# 📘 Chapter 17: Transactions — Complete Study Guide

> **Source**: Database System Concepts, 7th Edition — Silberschatz, Korth & Sudarshan  
> **Prepared for**: End-Semester Exam  
> **Style**: Notebook-style, taught from basics to advanced  

---

## 📋 Table of Contents

1. [What is a Transaction?](#1-what-is-a-transaction)
2. [The Fund Transfer Example (The Classic!)](#2-the-fund-transfer-example)
3. [ACID Properties — The Four Pillars](#3-acid-properties--the-four-pillars)
4. [Transaction States](#4-transaction-states)
5. [Concurrent Executions](#5-concurrent-executions)
6. [Schedules](#6-schedules)
7. [Serializability](#7-serializability)
8. [Conflict Serializability](#8-conflict-serializability)
9. [View Serializability](#9-view-serializability)
10. [Other Notions of Serializability](#10-other-notions-of-serializability)
11. [Testing for Serializability (Precedence Graph)](#11-testing-for-serializability)
12. [Recoverability](#12-recoverability)
13. [Cascading Rollbacks & Cascadeless Schedules](#13-cascading-rollbacks--cascadeless-schedules)
14. [Concurrency Control](#14-concurrency-control)
15. [Weak Levels of Consistency & Isolation Levels in SQL](#15-weak-levels-of-consistency--isolation-levels-in-sql)
16. [Transaction Definition in SQL](#16-transaction-definition-in-sql)
17. [Implementation of Isolation Levels](#17-implementation-of-isolation-levels)
18. [Phantom Phenomenon & Predicate Locking](#18-phantom-phenomenon--predicate-locking)
19. [Exam Tips & Key Points to Remember](#19-exam-tips--key-points-to-remember)
20. [Practice Questions](#20-practice-questions)

---

## 1. What is a Transaction?

### The Basic Idea

Think of a transaction like an **ATM operation**. When you transfer money from your savings account to your checking account, you expect TWO things to happen together:
1. Money leaves savings
2. Money arrives in checking

If the system crashes after step 1 but before step 2, your money vanishes! That's exactly the problem transactions solve.

### Formal Definition

> **A transaction is a *unit* of program execution that accesses and possibly updates various data items.**

The key word is **unit** — it means "all or nothing." Either the entire set of operations completes, or none of them do.

### Two Main Issues Transactions Must Handle

| Issue | What it means |
|-------|--------------|
| **Failures** | Hardware crashes, software bugs, power outages — anytime the system dies mid-operation |
| **Concurrent execution** | Multiple users/transactions running at the same time and potentially interfering with each other |

---

## 2. The Fund Transfer Example

This is the **most important example** in this chapter. Your teacher used it repeatedly. Understand it deeply.

### The Scenario

Transfer **$50** from Account A to Account B.

### The Steps

```
1.  read(A)          ← Fetch A's balance from database into memory
2.  A := A – 50      ← Subtract 50 in memory
3.  write(A)         ← Write A's new balance back to database
4.  read(B)          ← Fetch B's balance from database into memory
5.  B := B + 50      ← Add 50 in memory
6.  write(B)         ← Write B's new balance back to database
```

### What Could Go Wrong?

Now let's see why each ACID property matters using this example:

#### 🔴 Atomicity Problem
- If the system crashes **after step 3** (A is reduced) but **before step 6** (B is not yet increased), then $50 just **disappeared**!
- The system was left in an **inconsistent state**
- **Solution**: The system must **undo** the partial changes (rollback), so that A goes back to its original value

#### 🔵 Consistency Problem  
- **Before** the transaction: A + B = some total (say $1000)
- **After** the transaction: A + B must STILL = $1000
- The $50 left A and went to B, so the total is preserved
- **Consistency requirements** can be:
  - **Explicit**: Primary keys, foreign keys, CHECK constraints
  - **Implicit**: Like "sum of all accounts must equal total cash" (business rules)
- During execution, the database **may temporarily be inconsistent** (after step 3, A is down but B isn't up yet) — that's okay, as long as it's consistent when the transaction finishes

#### 🟡 Isolation Problem
- Suppose between step 3 and step 6, another transaction T₂ reads A and B to compute A+B
- T₂ would see the **reduced A** but the **old B** → it gets a **wrong total**!
- **Solution**: Make each transaction feel like it's running **alone** — hide intermediate results from other transactions

#### 🟢 Durability Problem
- Once the user sees "Transfer Complete!", the changes **must survive** any subsequent crash
- Even if the power goes out 1 second later, A and B should have their new values
- Typically implemented using **write-ahead logging**

---

## 3. ACID Properties — The Four Pillars

> ⭐ **ACID is one of the most frequently asked exam topics.** Memorize the definitions AND be ready to explain with examples.

| Property | One-liner Definition | Detailed Explanation |
|----------|---------------------|---------------------|
| **A**tomicity | All or nothing | Either ALL operations of the transaction are reflected in the database, or NONE are. No partial updates. |
| **C**onsistency | Preserve correctness | Execution of a transaction in isolation preserves the consistency of the database. Transaction takes DB from one consistent state to another. |
| **I**solation | Invisible to others | Although multiple transactions may execute concurrently, each transaction must be unaware of others. Intermediate results are hidden. |
| **D**urability | Survives crashes | After a transaction completes successfully, its changes persist even if there are system failures. |

### Isolation in More Detail

For every pair of transactions Tᵢ and Tⱼ, it appears to Tᵢ that either:
- Tⱼ **finished before** Tᵢ started, **OR**
- Tⱼ **started after** Tᵢ finished

In other words, each transaction thinks it's the only one running!

### Who is Responsible for What?

| Property | Ensured by |
|----------|-----------|
| Atomicity | Recovery system (undo logging) |
| Consistency | Application programmer + integrity constraints |
| Isolation | Concurrency control system |
| Durability | Recovery system (redo logging) |

---

## 4. Transaction States

A transaction goes through several states during its lifetime. Think of it like the lifecycle of a process in an Operating System.

### The Five States

```
                    ┌──────────────┐     ┌───────────┐
                    │  Partially   │────▶│ Committed │
             ┌─────▶│  Committed   │     └───────────┘
             │      └──────┬───────┘
             │             │
        ┌────┴────┐        │
        │ Active  │        │
        └────┬────┘        │
             │             │
             │      ┌──────▼───────┐     ┌───────────┐
             └─────▶│   Failed     │────▶│  Aborted  │
                    └──────────────┘     └───────────┘
```

### State-by-State Explanation

| State | When does the transaction enter this state? |
|-------|-------------------------------------------|
| **Active** | The **initial state**. The transaction stays here while it is executing its operations (reads, writes, computations) |
| **Partially Committed** | After the **final statement** has been executed. But wait — we haven't confirmed everything is safely written to disk yet! |
| **Failed** | After the system discovers that **normal execution can no longer proceed** (e.g., constraint violation, deadlock, crash) |
| **Aborted** | After the transaction has been **rolled back** and the database is restored to its state **before** the transaction started |
| **Committed** | After **successful completion** — all changes are now permanent |

### What Happens After Abort?

Two options:
1. **Restart the transaction** — only if the failure was NOT due to the transaction's own logic (e.g., it was a hardware failure)
2. **Kill the transaction** — if the failure was due to internal logical error (bad data, constraint violation, etc.)

> 💡 **Exam tip**: The difference between "Partially Committed" and "Committed" is subtle but important. Partially committed = final statement done but not yet confirmed safe. Committed = everything is safely on disk.

---

## 5. Concurrent Executions

### Why Allow Concurrent Transactions?

Instead of running transactions one at a time (serially), databases allow multiple transactions to run concurrently. Why?

| Advantage | Explanation |
|-----------|------------|
| **Increased processor & disk utilization** | While one transaction waits for disk I/O, another can use the CPU. Better *throughput* (more transactions per second). |
| **Reduced average response time** | Short transactions don't have to wait behind long ones. Like an express checkout lane at a supermarket! |

### The Danger of Concurrency

Concurrency is great for performance, but it can lead to **inconsistency** if not managed properly.

### Concurrency Control Schemes

These are mechanisms to **control the interaction** among concurrent transactions to prevent them from destroying database consistency. 

> Think of it like traffic lights at an intersection — without them, cars crash. Without concurrency control, transactions "crash" (produce wrong results).

---

## 6. Schedules

### What is a Schedule?

> **Schedule** = A sequence of instructions that tells us the **time order** in which instructions of concurrent transactions are executed.

### Rules for a Valid Schedule

1. It must contain **ALL instructions** of all participating transactions
2. It must **preserve the internal order** of instructions within each individual transaction (you can't rearrange steps within a single transaction)

### Commit and Abort

- A transaction that **successfully completes** → has a **commit** instruction as its last statement
- A transaction that **fails** → has an **abort** instruction as its last statement

### Schedule 1 — Serial Schedule (T₁ then T₂)

Let:
- **T₁**: Transfer $50 from A to B
- **T₂**: Transfer 10% of A's balance to B

```
        T₁                    T₂
  ─────────────────    ─────────────────
  read(A)
  A := A – 50
  write(A)
  read(B)
  B := B + 50
  write(B)
  commit
                       read(A)
                       temp := A * 0.1
                       A := A – temp
                       write(A)
                       read(B)
                       B := B + temp
                       write(B)
                       commit
```

✅ This is a **serial schedule** — T₁ runs completely, THEN T₂ runs completely. Always correct!

### Schedule 2 — Another Serial Schedule (T₂ then T₁)

```
        T₁                    T₂
  ─────────────────    ─────────────────
                       read(A)
                       temp := A * 0.1
                       A := A – temp
                       write(A)
                       read(B)
                       B := B + temp
                       write(B)
                       commit
  read(A)
  A := A – 50
  write(A)
  read(B)
  B := B + 50
  write(B)
  commit
```

✅ Also correct! Different order, possibly different final values, but consistency (A+B sum) is preserved.

### Schedule 3 — A Concurrent (Interleaved) Schedule that IS Equivalent to Schedule 1

```
        T₁                    T₂
  ─────────────────    ─────────────────
  read(A)
  A := A – 50
  write(A)
                       read(A)
                       temp := A * 0.1
                       A := A – temp
                       write(A)
  read(B)
  B := B + 50
  write(B)
  commit
                       read(B)
                       B := B + temp
                       write(B)
                       commit
```

✅ This interleaved schedule gives the **same result** as Schedule 1 → A + B is preserved → it's correct!

### Schedule 4 — A BAD Concurrent Schedule ❌

```
        T₁                    T₂
  ─────────────────    ─────────────────
  read(A)
  A := A – 50
                       read(A)         ← T₂ reads OLD A (before T₁'s write!)
                       temp := A * 0.1
                       A := A – temp
                       write(A)
                       read(B)
  write(A)             ← T₁ OVERWRITES T₂'s write! Lost update!
  read(B)
  B := B + 50
  write(B)
  commit
                       B := B + temp
                       write(B)
                       commit
```

❌ This schedule does **NOT preserve** the value of A + B. It's **incorrect**!

> ⚠️ In Schedule 4, T₂ reads the old value of A (before T₁'s write) and T₁ overwrites T₂'s write of A. This is a classic **lost update** problem.

---

## 7. Serializability

### The Big Idea

> A concurrent schedule is **correct** if it is **equivalent** to some serial schedule.

### Basic Assumption
- Each individual transaction, running alone, preserves database consistency
- Therefore, any **serial** execution of transactions preserves consistency

### Definition

> A (possibly concurrent) schedule is **serializable** if it is equivalent to a serial schedule.

### Two Types of Serializability

| Type | What it means |
|------|--------------|
| **Conflict Serializability** | Based on swapping non-conflicting instructions |
| **View Serializability** | Based on what values each read operation sees |

### Simplified View of Transactions

For analyzing serializability, we **only care about `read` and `write` instructions**. We ignore all the math/computation that happens in local buffers between reads and writes.

---

## 8. Conflict Serializability

### What are Conflicting Instructions?

Two instructions Iᵢ (from transaction Tᵢ) and Iⱼ (from transaction Tⱼ) **conflict** if and only if:
1. They belong to **different transactions** (Tᵢ ≠ Tⱼ)
2. They access the **same data item** Q
3. **At least one of them is a write**

### The Conflict Table (MEMORIZE THIS!) ⭐

| Iᵢ | Iⱼ | Conflict? | Why? |
|----|-----|-----------|------|
| **read**(Q) | **read**(Q) | ❌ No | Both just reading — order doesn't matter |
| **read**(Q) | **write**(Q) | ✅ Yes | If read happens first, it sees old value. If write happens first, it sees new value. |
| **write**(Q) | **read**(Q) | ✅ Yes | Same reason as above, reversed |
| **write**(Q) | **write**(Q) | ✅ Yes | Whichever writes last determines the final value |

> 💡 **Easy memory trick**: Two reads NEVER conflict. Everything else with same data item DOES conflict. "Read-Read = Friends, anything with Write = Enemies"

### Non-Conflicting Instructions Can Be Swapped!

If two **consecutive** instructions in a schedule:
- Belong to **different** transactions, AND
- Do **NOT** conflict

Then we can **swap their order** without changing the result.

### Conflict Equivalence

> If schedule S can be transformed into schedule S' by a series of swaps of **non-conflicting** instructions → S and S' are **conflict equivalent**.

### Conflict Serializable

> A schedule S is **conflict serializable** if it is conflict equivalent to **some serial schedule**.

### Example: Schedule 3 is Conflict Serializable

Schedule 3 can be transformed into the serial schedule (T₁ then T₂) by swapping non-conflicting instructions:

```
   Schedule 3                    Serial Schedule (T₁, T₂)
   ──────────                    ──────────
   T₁: read(A)                  T₁: read(A)
   T₁: write(A)                 T₁: write(A)
        T₂: read(A)             T₁: read(B)
        T₂: write(A)            T₁: write(B)
   T₁: read(B)                       T₂: read(A)
   T₁: write(B)                      T₂: write(A)
        T₂: read(B)                  T₂: read(B)
        T₂: write(B)                 T₂: write(B)
```

We just swap the non-conflicting pairs until we get a serial order!

### Example: A Schedule that is NOT Conflict Serializable

```
        T₃              T₄
  ─────────────    ─────────────
  read(Q)
                   write(Q)
  write(Q)
```

We **cannot** swap any of these instructions to get serial order ⟨T₃, T₄⟩ or ⟨T₄, T₃⟩ because:
- read(Q) by T₃ and write(Q) by T₄ → CONFLICT
- write(Q) by T₄ and write(Q) by T₃ → CONFLICT

All pairs conflict! No swaps possible → **NOT conflict serializable** ❌

---

## 9. View Serializability

### View Equivalence — The Three Conditions

Two schedules S and S' (with the same set of transactions) are **view equivalent** if, for each data item Q:

| # | Condition | Meaning |
|---|-----------|---------|
| 1 | **Initial read** | If Tᵢ reads the **initial value** of Q in S, then Tᵢ must also read the initial value of Q in S' |
| 2 | **Updated read** | If Tᵢ reads a value of Q that was **written by Tⱼ** in S, then Tᵢ must also read the value written by the same write(Q) of Tⱼ in S' |
| 3 | **Final write** | The transaction that performs the **final write(Q)** in S must also perform the final write(Q) in S' |

> 📌 View equivalence is based purely on **reads** and **writes** alone — just like conflict equivalence.

### View Serializable

> A schedule S is **view serializable** if it is view equivalent to some serial schedule.

### Key Relationships ⭐

```
   ┌──────────────────────────────────────────────────────────┐
   │                  View Serializable                       │
   │    ┌────────────────────────────────────────────────┐    │
   │    │           Conflict Serializable                │    │
   │    │    ┌──────────────────────────────────────┐    │    │
   │    │    │        Serial Schedules              │    │    │
   │    │    └──────────────────────────────────────┘    │    │
   │    └────────────────────────────────────────────────┘    │
   └──────────────────────────────────────────────────────────┘
```

> 📌 **Exam line:** "Every conflict serializable schedule is also view serializable, but NOT vice versa!"

### Example: View Serializable but NOT Conflict Serializable

```
        T₂₇            T₂₈            T₂₉
  ─────────────    ─────────────   ─────────────
  read(Q)
                   write(Q)
  write(Q)
                                  write(Q)
```

- This schedule is **view equivalent** to serial schedule ⟨T₂₇, T₂₈, T₂₉⟩
- But it is **NOT conflict serializable** (can't transform it by swapping non-conflicting instructions)

### Blind Writes

> **Every view serializable schedule that is NOT conflict serializable has blind writes.**

A **blind write** is a `write(Q)` that is NOT preceded by a `read(Q)` in the same transaction. The transaction writes a value without first reading it — it's "blind" to what Q currently contains.

---

## 10. Other Notions of Serializability

### Beyond Conflict and View

Some schedules produce the **same final result** as a serial schedule but are **neither conflict equivalent NOR view equivalent** to it.

### Example

```
        T₁              T₅
  ─────────────    ─────────────
  read(A)
  A := A – 50
  write(A)
                   read(B)
                   B := B – 10
                   write(B)
  read(B)
  B := B + 50
  write(B)
                   read(A)
                   A := A + 10
                   write(A)
```

This schedule produces the **same outcome** as serial schedule ⟨T₁, T₅⟩, but it is **NOT conflict equivalent or view equivalent** to it!

Why? Because to figure this out you need to look at the **actual math** (the arithmetic), not just the reads and writes. You'd need to know that (−50 + 10 = −40) to A and (+50 − 10 = +40) to B add up correctly.

> 📌 In practice, databases stick to conflict serializability because it's efficient to test. Analyzing actual computation values is impractical.

---

## 11. Testing for Serializability

### The Precedence Graph Method

This is the **practical algorithm** for checking conflict serializability. Very important for exams!

### How to Build a Precedence Graph

1. Create a **node** for each transaction (T₁, T₂, ..., Tₙ)
2. Draw an **arc (directed edge) from Tᵢ → Tⱼ** if:
   - Tᵢ and Tⱼ have a **conflicting** instruction, AND
   - Tᵢ's instruction comes **before** Tⱼ's instruction in the schedule
3. Optionally, **label** the arc with the data item that caused the conflict

### The Rule ⭐

> **A schedule is conflict serializable if and only if its precedence graph is ACYCLIC (has no cycles).**

### Examples

**Acyclic Graph** (Conflict Serializable ✅):
```
      T₁ ──────▶ T₂
```
- All edges go in one direction
- No cycle → Conflict Serializable!
- Serial order: T₁, T₂

**Cyclic Graph** (NOT Conflict Serializable ❌):
```
      T₁ ──────▶ T₂
      ↑          │
      └──────────┘
```
- T₁→T₂ AND T₂→T₁ → **CYCLE**
- NOT conflict serializable!

### Topological Sorting

If the precedence graph is **acyclic**, we can find the equivalent serial order by doing a **topological sort** of the graph.

- Topological sort = a linear ordering that follows the direction of edges
- Multiple valid orderings may exist

**Example from slides**: 
- One valid topological sort: T₅ → T₁ → T₃ → T₂ → T₄
- Other orderings are also possible!

### Complexity

| Algorithm | Time Complexity |
|-----------|----------------|
| Cycle detection | O(n²) where n = number of transactions |
| Better algorithms | O(n + e) where e = number of edges |

### Testing View Serializability

- The precedence graph test for **conflict** serializability **CANNOT** be used directly for view serializability
- Testing view serializability is an **NP-complete** problem!
- This means no efficient algorithm is likely to exist
- However, practical algorithms can check **sufficient conditions** for view serializability

---

## 12. Recoverability

### The Problem

When transactions run concurrently and one fails, we need to be able to **recover** — roll back the failed transaction without leaving the database in a mess.

### Recoverable Schedule

> A schedule is **recoverable** if: whenever transaction Tⱼ reads a data item previously written by transaction Tᵢ, then the **commit of Tᵢ appears before the commit of Tⱼ**.

In simple words: **Don't commit until all the transactions you depend on have committed.**

### Example of a NON-Recoverable Schedule (Schedule 11)

```
        T₈              T₉
  ─────────────    ─────────────
  read(A)
  write(A)
                   read(A)    ← T₉ reads what T₈ wrote
                   commit     ← T₉ commits BEFORE T₈!
  read(B)
  ...
```

❌ **Why is this bad?**
- T₉ reads A's value that was written by T₈
- T₉ commits
- If T₈ now **aborts**, T₈'s write to A should be undone
- But T₉ already committed using that value!
- We can't rollback T₉ because it's already committed
- **Irrecoverable!** The database is stuck in an inconsistent state

> ⚠️ Databases MUST ensure schedules are recoverable. A non-recoverable schedule means the database cannot properly handle failures.

### The Fix

T₉ should **wait** for T₈ to commit before T₉ commits. This way:
- If T₈ commits → T₉ can safely commit
- If T₈ aborts → T₉ must also abort (its data was based on T₈'s write)

---

## 13. Cascading Rollbacks & Cascadeless Schedules

### Cascading Rollback — The Domino Effect 🎯

> **Cascading rollback** = A single transaction failure leads to a **chain reaction** of rollbacks of other transactions.

### Example

```
        T₁₀            T₁₁            T₁₂
  ─────────────    ─────────────   ─────────────
  read(A)
  read(B)
  write(A)
                   read(A)        ← T₁₁ reads T₁₀'s write
                   write(A)
                                  read(A)  ← T₁₂ reads T₁₁'s write
  abort            ← T₁₀ fails!
```

**The domino effect:**
1. T₁₀ aborts → its write(A) must be undone
2. T₁₁ read the value written by T₁₀ → **T₁₁ must also be rolled back!**
3. T₁₂ read the value written by T₁₁ → **T₁₂ must also be rolled back!**

> This can lead to the **undoing of a LOT of work**! Very bad in practice.

### Cascadeless Schedules — The Solution

> **Cascadeless schedules** = Schedules where cascading rollbacks **cannot occur**.

### How?

For every pair of transactions Tᵢ and Tⱼ such that Tⱼ reads a data item previously written by Tᵢ:
- **The commit operation of Tᵢ must appear BEFORE the read operation of Tⱼ**

In simple words: **Only read committed data!** Don't read values written by transactions that haven't committed yet.

### Key Hierarchy ⭐

```
   Cascadeless schedules ⊂ Recoverable schedules

   Every cascadeless schedule is also recoverable ✅
   But NOT every recoverable schedule is cascadeless ❌
```

> 📌 **Exam line:** "Cascadeless ⊂ Recoverable ⊂ All Schedules. Cascadeless is the strongest (most restrictive), but also the safest."

---

## 14. Concurrency Control

### The Goal

Design mechanisms that make sure all possible schedules are:
1. **Conflict serializable** (or view serializable)
2. **Recoverable** 
3. **Preferably cascadeless**

### Why Not Just Use Serial Schedules?

A policy where only one transaction runs at a time DOES produce serial (and therefore correct) schedules, but it gives **terrible performance** — imagine a bank where only ONE customer can do anything at a time!

> **Are serial schedules recoverable/cascadeless?** Yes! Always. Because there's no interleaving, there can be no cascading issues.

### The Key Insight

> Testing a schedule for serializability **after** it has executed is **too late!** We need protocols that **guarantee** serializability BEFORE execution.

### Concurrency-Control Protocols

- These protocols **impose rules** that prevent non-serializable schedules from happening
- They don't examine the precedence graph — they **prevent** cycles from forming in the first place
- Different protocols offer different **tradeoffs** between concurrency and overhead

### Concurrency Control vs. Serializability Tests ⭐

| Aspect | Serializability Test | Concurrency Control |
|--------|---------------------|-------------------|
| **When** | After the schedule is created | During schedule creation |
| **Purpose** | Check if a schedule is correct | Make sure schedules are correct by design |
| **Practical?** | No (too late!) | Yes — used in real databases |
| **Value** | Helps us understand correctness | Actually used in production |

---

## 15. Weak Levels of Consistency & Isolation Levels in SQL

### Why Weaker Consistency?

Some applications are **okay with slightly wrong answers** if it means **better speed**:
- A read-only transaction getting an **approximate** total balance of all accounts
- Computing **database statistics** for query optimization (doesn't need exact values)
- Such transactions don't need to be serializable with respect to other transactions

> **Tradeoff: accuracy for performance**

### The Four Isolation Levels in SQL-92 ⭐

From **strongest** to **weakest**:

| Level | What it guarantees | What it allows |
|-------|-------------------|---------------|
| **Serializable** | Full isolation (default!) | Nothing bad — complete correctness |
| **Repeatable Read** | Only committed records are read. Repeated reads of same record return same value. | **Phantom reads** — new records inserted by other transactions may appear |
| **Read Committed** | Only committed records can be read | **Non-repeatable reads** — successive reads may return different (but committed) values |
| **Read Uncommitted** | Nothing! | **Dirty reads** — even uncommitted data can be read |

### Problems at Each Level

| Problem | Serializable | Repeatable Read | Read Committed | Read Uncommitted |
|---------|:-----------:|:---------------:|:--------------:|:----------------:|
| Dirty Reads | ❌ | ❌ | ❌ | ✅ |
| Non-repeatable Reads | ❌ | ❌ | ✅ | ✅ |
| Phantom Reads | ❌ | ✅ | ✅ | ✅ |

### Real-World Warning

> ⚠️ Some database systems (like Oracle, and PostgreSQL before v9) do **NOT** use serializable by default! They use **snapshot isolation** instead, which is not part of the SQL standard.

---

## 16. Transaction Definition in SQL

### Starting a Transaction
- In SQL, a transaction **begins implicitly** — the first SQL statement starts a transaction automatically

### Ending a Transaction

| Command | Effect |
|---------|--------|
| `COMMIT WORK` | Commits (saves) the current transaction and begins a new one |
| `ROLLBACK WORK` | Aborts the current transaction — all changes are undone |

### Auto-Commit

- In almost all database systems, by default, **every single SQL statement** automatically commits if it runs successfully
- This can be turned off:
  - **JDBC**: `connection.setAutoCommit(false);`
  - Then you must explicitly call `COMMIT` or `ROLLBACK`

### Setting Isolation Level

You can set the isolation level for a transaction:

```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
```

In JDBC:
```java
connection.setTransactionIsolation(Connection.TRANSACTION_SERIALIZABLE);
```

---

## 17. Implementation of Isolation Levels

How do databases actually make isolation work? Three main ways:

### 1. Locking

| Aspect | Details |
|--------|---------|
| **Scope** | Lock on whole database vs. lock on individual items (tuples, pages) |
| **Duration** | How long to hold the lock? (Short-term vs. long-term) |
| **Types** | **Shared lock (S)**: for reading — multiple transactions can hold at same time. **Exclusive lock (X)**: for writing — only one transaction can hold at a time |

### 2. Timestamps

| Aspect | Details |
|--------|---------|
| **Transaction timestamp** | Each transaction gets a unique timestamp when it starts |
| **Data item timestamps** | Each data item stores a **read timestamp** and a **write timestamp** |
| **Detection** | Timestamps catch **out-of-order accesses** and reject them |

### 3. Multiple Versions (MVCC)

- The database keeps **multiple versions** of each data item
- Transactions read from a **snapshot** of the database
- This allows more concurrency — readers don't block writers!

---

## 18. Phantom Phenomenon & Predicate Locking

### The Phantom Problem

Consider two transactions:

**T1**: `SELECT ID, name FROM instructor WHERE salary > 90000`

**T2**: `INSERT INTO instructor VALUES ('11111', 'James', 'Marketing', 100000)`

**What happens:**
1. T1 starts, finds all tuples with salary > 90000 using an index, and **locks them**
2. T2 inserts a NEW tuple with salary = 100000
3. If T1 runs the query again, it sees the NEW tuple that wasn't there before!

This is the **phantom phenomenon** — a new tuple "magically appears" between two reads of the same query.

### Why Tuple-Level Locking Fails

Even though T1 locked all existing tuples with salary > 90000, it couldn't lock a tuple that **didn't exist yet**!

### Another Example

**T3**: `UPDATE instructor SET salary = salary * 1.1 WHERE name = 'Wu'` (Wu's salary was 90000, now becomes 99000)

T1's query might miss Wu even though after the update Wu should be included (99000 > 90000)!

### The Solution: Predicate Locking

> 📌 **Key idea**: Detect "**predicate**" conflicts and use "**predicate locking**" — lock not just existing tuples, but the entire **condition** (predicate) that a query uses.

This prevents both:
- New inserts that satisfy the predicate
- Updates that make existing tuples satisfy the predicate

---

## 19. Exam Tips & Key Points to Remember

### 🎯 Most Likely Exam Questions

1. **Define ACID properties with examples** — almost guaranteed!
2. **Given a schedule, determine if it is conflict serializable** — draw the precedence graph
3. **Given a schedule, determine if it is recoverable/cascadeless**
4. **Draw the transaction state diagram and explain each state**
5. **What are conflicting instructions?** — give the table
6. **Differentiate conflict vs. view serializability**
7. **What is a cascading rollback? How to prevent it?**
8. **Explain isolation levels in SQL**

### 🧠 Quick Memory Aids

| Concept | Remember as... |
|---------|---------------|
| ACID | "A-ll or nothing, C-orrectness, I-nvisible to others, D-urable forever" |
| Conflict | "Read-Read = Safe. Write involved = Danger" |
| Precedence Graph | "Cycle = Bad. No Cycle = Good" |
| Recoverable | "Don't commit before your writer commits" |
| Cascadeless | "Only read committed data" |
| View vs Conflict | "Conflict ⊂ View. View is more relaxed but NP-hard to test" |

### ⚡ Common Mistakes to Avoid

1. ❌ Saying "consistency is maintained DURING a transaction" — NO! It may be temporarily inconsistent during execution
2. ❌ Confusing "Partially Committed" with "Committed" — partially committed is NOT final
3. ❌ Thinking all view serializable schedules are conflict serializable — NO! View serializability is a superset
4. ❌ Forgetting to check ALL conflicting pairs when building a precedence graph
5. ❌ Thinking serial schedules are the best — they're correct but terrible for performance

---

## 20. Practice Questions

### Question 1: ACID Properties
**Q**: A bank transfer deducts ₹5000 from Account X and credits it to Account Y. Explain how each ACID property applies to this transaction.

<details>
<summary>Click to see answer</summary>

- **Atomicity**: Either both deduction from X and credit to Y happen, or neither happens. If the system crashes after deducting from X but before crediting Y, the deduction must be reversed.
- **Consistency**: The total balance (X + Y) is preserved before and after the transaction. If X had ₹10000 and Y had ₹3000 (total ₹13000), after transaction X has ₹5000 and Y has ₹8000 (still ₹13000).
- **Isolation**: If another transaction reads X and Y during the transfer, it should see either the state before the transfer or after — never the intermediate state where X is deducted but Y isn't credited.
- **Durability**: Once the user sees "Transfer Successful", the changes persist even if power goes out immediately.
</details>

### Question 2: Conflict Serializability
**Q**: Is the following schedule conflict serializable? If yes, give the equivalent serial order.

```
T₁: read(A)   T₂: read(A)   T₁: write(A)   T₂: write(A)   T₁: read(B)   T₂: read(B)
```

<details>
<summary>Click to see answer</summary>

Find conflicting pairs:
1. T₁:read(A) vs T₂:write(A) → Conflict → T₁ before T₂ → edge T₁→T₂
2. T₂:read(A) vs T₁:write(A) → Conflict → T₂ before T₁ → edge T₂→T₁

Precedence graph: T₁→T₂ AND T₂→T₁ → **CYCLE!** → **NOT conflict serializable** ❌
</details>

### Question 3: Recoverable Schedule
**Q**: Is this schedule recoverable?
```
T₁: write(A),  T₂: read(A),  T₂: commit,  T₁: commit
```

<details>
<summary>Click to see answer</summary>

- T₂ reads A which was written by T₁
- T₂ commits BEFORE T₁ commits
- **NOT recoverable!** ❌
- T₂ should wait for T₁ to commit first.
- If T₁ aborts after T₂ has committed, we cannot undo T₂'s committed work.
</details>

### Question 4: Cascadeless?
**Q**: Is this schedule cascadeless?
```
T₁: write(A),  T₁: commit,  T₂: read(A),  T₂: commit
```

<details>
<summary>Click to see answer</summary>

- T₂ reads A which was written by T₁
- T₁ commits BEFORE T₂ reads A
- ✅ **Yes, this is cascadeless!** T₂ only reads after T₁ has committed.
</details>

### Question 5: Transaction States
**Q**: A transaction executes all its statements successfully but the system crashes before the changes are written to disk. What state was the transaction in at the time of the crash?

<details>
<summary>Click to see answer</summary>

The transaction was in the **Partially Committed** state. It had finished executing all statements (so it's past Active) but hadn't yet confirmed that all changes are safely on disk (so it's not yet Committed). After recovery, the system would either complete the commit or abort the transaction.
</details>

### Question 6: Precedence Graph
**Q**: Build the precedence graph for this schedule and determine if it's conflict serializable:
```
T₁: read(X)
T₂: read(Y)
T₁: write(X)
T₂: write(Y)
T₁: read(Y)
T₁: write(Y)
```

<details>
<summary>Click to see answer</summary>

Check all conflicting pairs:
- T₂:read(Y) vs T₁:write(Y) → T₂ comes first → edge **T₂→T₁** (on data item Y)
- T₂:write(Y) vs T₁:read(Y) → T₂ comes first → edge **T₂→T₁** (on data item Y)  
- T₂:write(Y) vs T₁:write(Y) → T₂ comes first → edge **T₂→T₁** (on data item Y)

All edges go T₂→T₁. **No cycle!** ✅

Equivalent serial order: **T₂, T₁**
</details>

---

## 📝 Summary Cheat Sheet

```
┌─────────────────────────────────────────────────────────────┐
│  TRANSACTION = Unit of work (all or nothing)                │
│                                                             │
│  ACID = Atomicity + Consistency + Isolation + Durability    │
│                                                             │
│  States: Active → Partially Committed → Committed          │
│                 → Failed → Aborted                          │
│                                                             │
│  Schedule = Order of execution of concurrent transactions   │
│  Serial Schedule = One after another (always correct)       │
│  Serializable = Equivalent to some serial schedule          │
│                                                             │
│  Conflict: Read-Read=OK, Rest=CONFLICT (same data item)    │
│  Conflict Serializability: Swap non-conflicting → serial?   │
│  Test: Precedence Graph → No cycle = serializable           │
│                                                             │
│  View Serializability ⊇ Conflict Serializability            │
│  (View is wider, but NP-hard to test)                       │
│                                                             │
│  Recoverable: Writer commits before reader commits          │
│  Cascadeless: Writer commits before reader READS            │
│  Cascadeless ⊂ Recoverable                                  │
│                                                             │
│  Isolation Levels (strongest → weakest):                    │
│  Serializable > Repeatable Read > Read Committed            │
│  > Read Uncommitted                                         │
│                                                             │
│  SQL: COMMIT WORK / ROLLBACK WORK                           │
│  SET TRANSACTION ISOLATION LEVEL [level]                    │
└─────────────────────────────────────────────────────────────┘
```

---

> 📖 **You've finished the complete Chapter 17: Transactions guide!**

---
*Guide prepared from Chapter 17 slides — Database System Concepts, 7th Ed. (Silberschatz, Korth & Sudarshan)*
