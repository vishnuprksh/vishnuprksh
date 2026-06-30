---
title: "Integer Logic Programming Basics"
date: "June 20, 2026"
category: "Optimization"
description: "How to use discrete variables and linear constraints to solve complex logical decision-making problems. An introduction to ILP."
image: "ilp-bg"
icon: "bx-analyse"
read_time: "5 min read"
keywords: "integer programming, linear programming, optimization, logic constraints, operations research"
---

Imagine you are planning a seating arrangement for a wedding reception. 

You have 50 guests, 5 tables, and a list of rules:
* Aunt Sarah can't sit at the same table as Uncle Bob.
* Cousins Dave and Amy must sit together.
* Each table can hold a maximum of 10 people.

You try to solve this manually. After two hours of shifting name cards around, you feel a headache coming on. Every time you fix one rule, you break three others.

This isn't just a wedding problem—it's a classic **combinatorial optimization** problem. And if you try to solve it using traditional machine learning or deep learning, you will fail. Neural networks are great at pattern recognition, but they are terrible at strict, logical constraints.

To solve this, we need a different superpower: **Integer Linear Programming (ILP)**.

---

## What is Integer Linear Programming?

At its core, linear programming (LP) is about finding the best outcome (like maximizing profit or minimizing cost) in a system governed by linear relationships. 

But standard linear programming has a catch: it assumes everything is continuous. If you ask a standard LP solver to optimize how many cargo planes to build, it might tell you to build **3.47 planes**. 

Since you cannot build 47% of a plane, you need **Integer** Linear Programming. ILP forces some or all of the decision variables to be integers (like 0, 1, 2...). 

When we restrict variables to be **binary (0 or 1)**, ILP becomes an incredibly powerful tool for modeling logical choices (Yes/No, If/Then, Either/Or). This is why it is often called **Integer Logic Programming**.

---

## The Anatomy of an ILP Problem

Every ILP model consists of three basic building blocks:

1. **Decision Variables:** The things we want to decide. In binary logic programming, these are usually $0$ or $1$. 
   * *Example:* Let $x_i = 1$ if guest $i$ is assigned to Table 1, and $0$ otherwise.
2. **Objective Function:** What we want to maximize or minimize.
   * *Example:* Minimize the number of tables used, or maximize the total compatibility score of people sitting together.
3. **Constraints:** The strict rules we must obey. These are expressed as linear equations or inequalities.

---

## Modeling Logic with Math

The real magic of ILP is how we translate human logical rules into simple linear math. Here are a few classic examples:

### 1. The "Either-Or" Choice (Mutual Exclusion)
Suppose you can choose to build a warehouse in City A ($x_A = 1$) or City B ($x_B = 1$), but you don't have the budget to build both.
* **Logical Rule:** You can build at most one warehouse.
* **Mathematical Equation:** 
  $$x_A + x_B \le 1$$
  *(If $x_A = 1$, then $x_B$ must be $0$. If both are $0$, that's fine too.)*

### 2. The "If-Then" Dependency (Prerequisites)
Suppose you can only install the advanced analytics dashboard ($y = 1$) if you have first set up the data warehouse pipeline ($x = 1$).
* **Logical Rule:** If $y$ is active, $x$ must be active.
* **Mathematical Equation:** 
  $$y \le x$$
  *(If $x = 0$, then $y$ must be $0$. If $x = 1$, $y$ can be either $0$ or $1$.)*

### 3. The "At Least N" Constraint
Suppose you are scheduling a shift for a hospital. You have 5 doctors on call, and you must have at least 2 doctors present.
* **Logical Rule:** At least 2 active doctors.
* **Mathematical Equation:** 
  $$d_1 + d_2 + d_3 + d_4 + d_5 \ge 2$$

---

## A Practical Example: The Knapsack Problem

Let's look at the classic optimization problem: **The Knapsack Problem**. 

You are a thief breaking into a house. You have a backpack (knapsack) that can hold a maximum weight of **15 kg**. You see 5 items, each with a specific weight and value:

* Laptop: $2\text{ kg}$, value $\$1000$
* Stereo: $10\text{ kg}$, value $\$1500$
* Painting: $5\text{ kg}$, value $\$2000$
* Vase: $7\text{ kg}$, value $\$1200$
* Gold Coin: $1\text{ kg}$, value $\$800$

Which items do you put in your backpack to maximize your total value without breaking it?

Here is how we code this in Python using `scipy.optimize` (or `pulp` which is the standard choice for ILP in Python):

```python
import pulp

# 1. Initialize the problem
prob = pulp.LpProblem("Thief_Knapsack", pulp.LpMaximize)

# 2. Define Binary Decision Variables (0 = leave, 1 = take)
items = ['laptop', 'stereo', 'painting', 'vase', 'gold_coin']
x = pulp.LpVariable.dicts("take", items, cat='Binary')

# Item details
values = {'laptop': 1000, 'stereo': 1500, 'painting': 2000, 'vase': 1200, 'gold_coin': 800}
weights = {'laptop': 2, 'stereo': 10, 'painting': 5, 'vase': 7, 'gold_coin': 1}

# 3. Define Objective Function: Maximize total value
prob += pulp.lpSum([values[i] * x[i] for i in items]), "Total_Value"

# 4. Define Constraint: Weight limit <= 15 kg
prob += pulp.lpSum([weights[i] * x[i] for i in items]) <= 15, "Weight_Limit"

# 5. Solve the problem
prob.solve()

# Print results
for i in items:
    if x[i].varValue == 1:
        print(f"Take the {i}!")
```

Running this solver takes less than a millisecond, and it will instantly give you the optimal choice: **Take the laptop, painting, vase, and gold coin** (Total weight: $15\text{ kg}$, Total value: $\$5000$). 

---

## When to Use ILP Instead of Machine Learning

In a world hyped up on AI, we often forget that some problems are better solved with discrete math. You should reach for ILP when:

1. **You need 100% hard constraints:** If a system *cannot* allow a scheduling conflict or go over a budget, ML models cannot guarantee it. ILP solvers guarantee it.
2. **You want the provably best solution:** Machine learning models find "good enough" patterns. ILP solvers use algorithms like **Branch and Bound** to guarantee that the solution is the absolute mathematical global optimum.
3. **You have little to no data:** ILP doesn't require training data. It only requires a set of logical rules and weights.

Understanding Integer Linear Programming is like having a cheat code for scheduling, logistics, and resource allocation. It bridges the gap between pure logic and numerical optimization, proving that sometimes, a set of simple linear inequalities is all you need to solve the impossible.
