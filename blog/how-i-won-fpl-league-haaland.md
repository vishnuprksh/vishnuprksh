---
title: "How I Won My FPL League Knowing Only Haaland"
date: "June 15, 2026"
category: "Data Science"
description: "How I leveraged integer optimization, knapsack algorithms, and historical data to beat my football-obsessed friends in Fantasy Premier League — with zero actual football knowledge."
image: "fpl-bg"
icon: "bx-trophy"
read_time: "7 min read"
keywords: "fantasy premier league, FPL, optimization, knapsack problem, python, fplgeek"
---

Here is a confession: I don't really watch football. 

I couldn't tell you the difference between a double pivot and a false nine. I don't know who the manager of Aston Villa is, and until recently, I thought "clean sheet" was a laundry term.

But last month, I stood victorious at the top of my office Fantasy Premier League (FPL) group, holding a trophy and looking down at twelve of my football-obsessed friends who spend their weekends screaming at the TV. 

How did I do it? 

I didn't watch games, read sports blogs, or follow Twitter transfer rumors. Instead, I locked Erling Haaland in my squad, treated FPL as a constrained linear programming problem, wrote a custom solver, and let math do the rest. 

I call it the [FPL Geek](https://github.com/vishnuprksh/fplgeek) method. Here is how it works.

---

## The FPL Problem: A Thief's Knapsack in a Jersey

Fantasy Premier League is deceptively simple:
1. You have a budget of **£100m**.
2. You must select **15 players** (2 Goalkeepers, 5 Defenders, 5 Midfielders, 3 Forwards).
3. You can choose at most **3 players** from any single Premier League team.
4. Each gameweek, you pick a **Starting XI**. Your players score points based on goals, assists, clean sheets, and saves.
5. You get **one free transfer** per week. Additional transfers cost you points.

Most people play FPL using their gut. They transfer in a player because they "looked sharp last weekend" or drop a defender because they have a bad feeling. 

To a data scientist, however, this isn't a game of vibes. It's a **Multi-dimensional Knapsack Problem with Logic Constraints**.

We want to select a subset of players that maximizes our objective function (expected points, or **xP**) subject to budget constraints, positional requirements, and team limits.

---

## The Haaland Constraint

In optimization theory, you can simplify problems by fixing "obviously optimal" variables. 

In FPL, Erling Haaland is that variable. He is a statistical anomaly—a goal-scoring machine who plays for one of the most dominant attacking teams in the world. He is extremely expensive, but his expected points are so high that over the course of a season, not owning him is a statistical suicide.

So I added a hard constraint to my model:

$$x_{\text{Haaland}} = 1 \quad (\text{Always})$$
$$\text{Captain} = \text{Haaland} \quad (\text{Usually})$$

With Haaland taking up roughly $15\%$ of my budget, my actual problem was: *How do I optimize the remaining £85m across 14 roster slots?*

---

## Building the Solver

To build my FPL helper, [FPL Geek](https://github.com/vishnuprksh/fplgeek), I split the logic into two parts: data prediction and squad optimization.

### 1. The xP (Expected Points) Model
First, I pulled player stats, historical performance, fixture difficulty, and injury reports. I built a simple model to predict how many points every player in the league would score over the next 3 to 5 gameweeks. This gave me my $xP_i$ (expected points for player $i$).

### 2. The Combinatorial Optimizer
Once we have the predicted points ($xP_i$) and prices ($w_i$), we feed them into our solver. In [FPL Geek](https://github.com/vishnuprksh/fplgeek), the core optimization is written in TypeScript on the frontend (using custom combinatorics to run instantly in the browser) and Python on the backend (using `scipy.optimize` and mixed-integer linear programming).

Here is a simplified view of the math behind the lineup optimizer:

$$\max \sum_{i \in \text{Players}} xP_i \cdot s_i$$

Subject to:
* $\sum s_i = 11$ (Exactly 11 players in the starting lineup)
* $\sum w_i \cdot y_i \le \text{Total Budget}$ (Roster stays under budget)
* $\text{Goalkeepers} = 1$, $\text{Defenders} \ge 3$, $\text{Forwards} \ge 1$ (Valid formation constraints)

Here is a snippet of how the frontend [solver.ts](https://github.com/vishnuprksh/fplgeek/blob/main/frontend/src/utils/solver.ts) optimizes transfer allowances:

```typescript
export function optimizeWithAllowance(
  currentSquad: Player[],
  bank: number,
  allCandidates: Player[],
  transferAllowance: number,
  lockedIds: number[]
): OptimizationResult {
  // Phase 1: Identify best XI combinations using N transfers
  // Phase 2: Fill the remaining bench positions within budget constraints
  // Phase 3: Rank results by net xP gain (taking transfer point hits into account)
  ...
}
```

---

## Beating the Humans: The Rules I Lived By

By letting the solver make my decisions, I avoided the classic traps that sink human managers:

### Rule 1: No Emotional Sentiment
When Marcus Rashford went on a cold streak, human managers kept him because "he's bound to score soon." My solver looked at his dipping xP and cut him immediately for a rising differential. The solver doesn't care about a player's history or reputation; it only cares about the gradient.

### Rule 2: Patience with Transfers
Humans panic-transfer players on Sunday night after they score a brace. The solver always waited until Friday afternoon, incorporating the latest injury news and price changes before making a move.

### Rule 3: Trusting the Bench Rotation
A huge part of FPL is managing your bench. The [FPL Geek](https://github.com/vishnuprksh/fplgeek) optimizer doesn't just pick the best XI; it optimizes the bench for rotation, ensuring that if one of my starters gets benched unexpectedly, a cheap but active player from Burnley or Luton steps in to grab 4 crucial points.

---

## The Verdict

On the final day of the season, while my friends were debating whether to start three defenders or play a risky wildcard, I loaded the latest projections into the solver, hit "⚡ Optimize", clicked "Apply", and went for a run. 

My captain Haaland scored a hat-trick, my cheap differentials returned clean sheets, and I won the league by a comfortable margin of 42 points.

You don't need to live and breathe football to win at FPL. You just need to realize that behind the grass, the fans, and the pundits, football is a numbers game. And if you know how to talk to the numbers, the numbers will tell you how to win.
