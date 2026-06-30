---
title: "How to Build a Deep Learning Framework from Scratch"
date: "June 10, 2026"
category: "Deep Learning"
description: "A hands-on guide to building a mini autograd engine and neural network framework using nothing but Python and NumPy."
image: "dl-bg"
icon: "bx-layer"
read_time: "8 min read"
keywords: "deep learning, autograd, backpropagation, framework from scratch, python, numpy"
---

When you write `loss.backward()` in PyTorch, magic happens. 

Behind the scenes, PyTorch traverses a complex web of operations, calculates derivatives for millions of variables, and updates weights—all in a fraction of a millisecond. 

For the longest time, this felt like black magic to me. I could train models, but I didn't *really* know what PyTorch was doing under the hood. Then I read *Grokking Deep Learning* by Andrew Trask and decided to build my own deep learning framework from scratch using nothing but NumPy.

It turns out that building a basic deep learning framework isn't as hard as it sounds. You only need to understand one core concept: **Automatic Differentiation (Autograd)**.

Let's build a mini-PyTorch in about 100 lines of Python.

---

## The Heart of the Framework: The Tensor

In PyTorch, everything is a `Tensor`. A Tensor is more than just a multi-dimensional array of numbers. It is a node in a **computation graph**. 

A Tensor needs to know:
1. Its actual data (a NumPy array).
2. What operations created it (its creators/parents).
3. Its gradient (how much the final loss changes if we tweak this tensor).

Let's write a basic `Tensor` class:

```python
import numpy as np

class Tensor:
    def __init__(self, data, creators=None, creation_op=None, autograd=True):
        self.data = np.array(data)
        self.creators = creators         # Tensors that generated this tensor
        self.creation_op = creation_op   # The operation (e.g., "add", "neg")
        self.grad = None                 # Gradient accumulator
        self.autograd = autograd         # Flag to track graph
        self.children = {}               # Track downstream child nodes
        
        # Keep track of how many children have finished backpropagation
        if creators is not None:
            for c in creators:
                if self.id not in c.children:
                    c.children[self.id] = 1
                else:
                    c.children[self.id] += 1
                    
    @property
    def id(self):
        return id(self)
```

---

## Building the Computation Graph

When we perform operations on Tensors, we need to connect them. For example, if we add two tensors `x` and `y` to get `z`, then `z`'s creators are `[x, y]` and its creation operation is `"add"`.

Let's implement the addition operation:

```python
    def __add__(self, other):
        if self.autograd and other.autograd:
            return Tensor(self.data + other.data,
                          creators=[self, other],
                          creation_op="add")
        return Tensor(self.data + other.data)
```

Now, if we run `z = x + y`, we have automatically built a directed acyclic graph (DAG) where `z` points back to `x` and `y`.

---

## The Magic: Backpropagation (Autograd)

To train a model, we need to calculate the gradient of our loss function with respect to every weight. This is where backpropagation comes in.

If we have a node `z = x + y`, how do gradients propagate backward?
According to calculus:
* The derivative of $z$ with respect to $x$ is $1$. ($\frac{\partial z}{\partial x} = 1$)
* Therefore, the gradient flowing back to $x$ is simply: $x.\text{grad} = z.\text{grad} \times 1$.

Let's implement a `backward` method that traverses the graph in reverse order, calculates gradients, and accumulates them:

```python
    def backward(self, grad=None):
        if not self.autograd:
            return
        
        if grad is None:
            if self.grad is None:
                # Typically loss is a scalar, so we start with a gradient of 1
                self.grad = Tensor(np.ones_like(self.data))
            grad = self.grad
        else:
            if self.grad is None:
                self.grad = grad
            else:
                self.grad.data += grad.data # Accumulate gradients from multiple paths

        # Go backward only when all child gradients have been received
        if self.creators is not None and self._all_children_grads_received():
            if self.creation_op == "add":
                # For addition, gradient passes straight through to both parents
                self.creators[0].backward(self.grad)
                self.creators[1].backward(self.grad)
```

*Note: The `_all_children_grads_received()` helper is crucial. If a tensor is used in multiple operations (like a weight shared across layers), we must wait for all children to send their gradients before backpropagating further. Otherwise, we calculate incorrect gradients.*

---

## Let's Test Our Autograd Engine

Let's verify that our framework can calculate basic derivatives. We will define:

$$z = (x + y) + y$$

We want to find the derivative of $z$ with respect to $x$ and $y$. Let's solve this analytically:
* $\frac{\partial z}{\partial x} = 1$
* $\frac{\partial z}{\partial y} = 2$

Let's see if our Python code gets it right:

```python
x = Tensor([1.0], autograd=True)
y = Tensor([2.0], autograd=True)

# Forward pass
a = x + y
z = a + y

# Backward pass
z.backward()

print("x grad:", x.grad.data)  # Expected: [1.0]
print("y grad:", y.grad.data)  # Expected: [2.0]
```

It works! Our framework successfully calculated the gradients using the chain rule across the computation graph.

---

## Scaling Up: Adding Matrix Multiplication

To build real neural networks, we need matrix multiplication (`matmul`) and activation functions (like `Sigmoid` or `ReLU`). 

For matrix multiplication $Y = X \cdot W$:
* The gradient with respect to input: $\frac{\partial L}{\partial X} = \frac{\partial L}{\partial Y} \cdot W^T$
* The gradient with respect to weights: $\frac{\partial L}{\partial W} = X^T \cdot \frac{\partial L}{\partial Y}$

Let's add the `matmul` operation to our `Tensor` class:

```python
    def matmul(self, other):
        if self.autograd and other.autograd:
            return Tensor(self.data @ other.data,
                          creators=[self, other],
                          creation_op="matmul")
        return Tensor(self.data @ other.data)
```

And update our `backward()` function:

```python
            if self.creation_op == "matmul":
                # Gradient of MatMul
                act = self.creators[0]  # Activation tensor
                weights = self.creators[1]  # Weight tensor
                
                # Backprop to input activation
                act.backward(Tensor(self.grad.data @ weights.data.T))
                # Backprop to weight matrix
                weights.backward(Tensor(act.data.T @ self.grad.data))
```

---

## What Next?

With just this simple `Tensor` class, you can build:
1. **Layers:** Create a `Linear` layer that initializes a weight matrix and bias vector.
2. **Loss Functions:** Implement `Mean Squared Error` or `Cross Entropy`.
3. **Optimizers:** Write a simple `SGD` class that updates weights: $W = W - \alpha \times W.\text{grad}$.

By stripping away the complex C++ optimizations of PyTorch, we can see the mathematical machinery that drives modern deep learning. It's not magic—it's just a graph of operations, a list of derivatives, and the chain rule executed recursively. 

If you want to understand deep learning deeply, stop importing PyTorch for a weekend. Grab NumPy, open a blank editor, and build it yourself.
