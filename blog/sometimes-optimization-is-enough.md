---
title: "Sometimes Optimization Is All You Need"
date: "June 05, 2026"
category: "Engineering"
description: "Why we should stop throwing complex machine learning models at scheduling, routing, and resource allocation problems, and start using classical optimization."
image: "opt-bg"
icon: "bx-target-lock"
read_time: "5 min read"
keywords: "optimization, machine learning, linear programming, engineering, operations research"
---

I recently sat in a meeting where a team proposed building a deep reinforcement learning model to solve a warehouse scheduling problem. 

They wanted to train an agent to decide which forklift should pick up which pallet to minimize travel time. They talked about state spaces, action bounds, rewards, and training a model on GPU clusters for three weeks. 

When I asked, "Why not just model this as a Mixed Integer Linear Program (MILP)?" I was met with blank stares. One engineer replied, "But can a linear solver learn over time?"

This interaction represents a common pathology in modern software engineering: **Machine Learning Masochism**. 

We have become so obsessed with training models, adjusting weights, and feeding GPUs that we've forgotten a fundamental tool of computer science: **Classical Mathematical Optimization**.

Sometimes, optimization is not just a simpler alternative to ML; it is the superior choice.

---

## The ML Mindset vs. The Optimization Mindset

When we use Machine Learning, we are saying:
* "I don't know the exact rules that govern this problem."
* "But I have a ton of historical data."
* "I want a model to look at the data and guess the rules."

This is great for classification, image recognition, and language processing. 

But when we deal with logistics, scheduling, budgeting, or routing, we *do* know the rules. We know exactly how many trucks we have, we know their capacities, we know the distances between warehouses, and we know our delivery deadlines. 

When you throw Machine Learning at a problem with known rules, you are making your life unnecessarily hard. You are asking a neural network to look at millions of historical schedules, guess the rules of physics and logistics, and then output a schedule that is hopefully valid.

With the **Optimization Mindset**, we write down the rules mathematically. We define an objective (e.g., minimize delivery cost) and a set of bounds. We pass this model to a solver (like Gurobi, CPLEX, or PuLP). The solver then finds the absolute, mathematically proven best solution. No guessing, no training data, no hallucinations.

---

## Why Choose Optimization Over ML?

Here is why classical optimization is often a better fit for decision-making problems:

### 1. Hard Constraints Are Actually Hard
If you train a neural network to generate a delivery route, it might occasionally try to route a truck through a lake or assign a 12-hour shift to a driver who is legally capped at 8 hours. Machine learning models output probabilistic predictions; they cannot guarantee that a constraint will never be broken.
Optimization solvers treat constraints as law. If a constraint says $\sum \text{hours} \le 8$, the solver will never, under any circumstances, return a schedule that exceeds 8 hours.

### 2. Zero Data Requirement
To train a decent machine learning model, you need thousands (or millions) of clean, labeled historical records. 
Optimization doesn't need data. It needs a **description of the system**. If you want to optimize a school bus route, you just need a list of students' addresses and the buses' capacities. You don't need five years of historical bus routes to train on.

### 3. Global Optimality
When you train a deep learning model, you are searching a massive, non-convex space. Your model can easily get stuck in local minima, finding a "decent" solution but missing the best one.
For linear and mixed-integer problems, optimization solvers use algorithms (like Branch and Bound) that mathematically prove whether a solution is the absolute global optimum. You get peace of mind knowing you aren't leaving money on the table.

---

## A Quick Comparison

| Feature | Machine Learning (ML) | Classical Optimization (ILP/LP) |
| :--- | :--- | :--- |
| **Primary Input** | Clean historical training data | Math formulas describing the rules |
| **Logic Rules** | Learned implicitly (approximate) | Stated explicitly (perfectly obeyed) |
| **Guarantees** | None (probabilistic outputs) | Mathematically proven global optimum |
| **Hardware** | GPUs, high memory, training clusters | Standard CPU, runs in milliseconds |
| **Debugging** | Black box (why did it make this guess?) | White box (which constraint bound the solution?) |

---

## How to Get Started

Before you write `import tensorflow as tf` or `import xgboost as xgb` for your next business logic task, ask yourself:
1. *Am I predicting the future, or am I organizing the present?* (If you are organizing, it's optimization).
2. *Can I write the constraints down as equations?* (If yes, you can use a solver).

Python has an incredible ecosystem for optimization. Look into **PuLP** or **SciPy**'s `linprog` for linear programming, and **ortools** (by Google) for complex routing and scheduling problems.

Machine learning is a shiny hammer, and it's easy to treat every problem like a nail. But sometimes, the best engineering decision is to put down the heavy model, pull out a piece of paper, write down a few linear equations, and let a classical solver do the heavy lifting.
