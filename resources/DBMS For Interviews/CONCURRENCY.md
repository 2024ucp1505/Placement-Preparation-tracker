# 📖 Chapter 18: Concurrency Control — Complete Guide

> **This chapter had the HIGHEST weight in the quiz — 3 questions worth 4 marks (21% of total)!** Covers Lock-Based Protocols, Deadlocks, Multiple Granularity, Timestamp Ordering, Validation, and Multiversion Schemes.

> **Syllabus: Sections 18.1 to 18.6** (Korth 7th Ed.)

---

## 📋 Table of Contents


1. [📖 Section 18.1: Lock-Based Protocols](#-section-181-lock-based-protocols)
2. [📖 Section 18.2: Deadlock Handling](#-section-182-deadlock-handling)
3. [📖 Section 18.3: Multiple Granularity](#-section-183-multiple-granularity)
4. [📖 Section 18.4: Timestamp-Based Protocols](#-section-184-timestamp-based-protocols)
5. [📖 Section 18.5: Validation-Based Protocols (Optimistic Concurrency Control)](#-section-185-validation-based-protocols-optimistic-concurrency-control)
6. [📖 Section 18.6: Multiversion Schemes](#-section-186-multiversion-schemes)
8. [📋 Quick Comparison — All Concurrency Control Protocols](#-quick-comparison--all-concurrency-control-protocols)
9. [🧠 Quick Memory Tricks](#-quick-memory-tricks)

---
## 📖 Section 18.1: Lock-Based Protocols

### 18.1.1 Lock Modes

A **lock** is a mechanism to control concurrent access to a data item. Two modes:

| Lock Mode | Symbol | Purpose | Requested Using |
|-----------|--------|---------|-----------------|
| **Shared** | S | Read ONLY | `lock-S(Q)` |
| **Exclusive** | X | Read AND Write | `lock-X(Q)` |

Lock requests go to the **concurrency-control manager**. A transaction can only proceed after the request is **granted**.

### Lock Compatibility Matrix:

```
              Requested:
              S           X
Currently:
  S           ✅ Grant    ❌ Wait
  X           ❌ Wait     ❌ Wait
```

- S + S = Compatible (multiple readers OK)
- S + X = NOT compatible (reader blocks writer)
- X + X = NOT compatible (writers block each other)

> **Key Rule**: A transaction that needs both read and write on Q must request `lock-X(Q)` from the start, OR first acquire `lock-S(Q)` and then **upgrade** to `lock-X(Q)`.

### Starvation

**Starvation** can happen even without deadlocks if the concurrency-control manager is poorly designed:
- A transaction may be waiting for an X-lock on an item, while a **stream of other transactions** keep requesting and getting S-locks on the same item → the X-lock request **never gets granted**.
- A transaction may be **repeatedly chosen as a deadlock victim** and rolled back every time.

> **Solution**: The concurrency-control manager must ensure fair scheduling (e.g., grant locks in FIFO order, limit rollback count for victim selection).

### 18.1.2 Lock Upgrade and Downgrade

- **Upgrade**: S → X (convert shared to exclusive). Allowed only in the **growing phase**.
- **Downgrade**: X → S (convert exclusive to shared). Allowed only in the **shrinking phase**.

---

### 18.1.3 Two-Phase Locking Protocol (2PL)

The most important lock-based protocol. It has **two phases**:

```
Phase 1 — GROWING PHASE:
  → Transaction CAN acquire new locks
  → Transaction CANNOT release any lock
  → Example: lock-S(A), lock-X(B), lock-S(C)... keep acquiring

LOCK POINT (transition moment):
  → The instant when the transaction acquired its LAST lock
  → After this point, the SHRINKING phase begins

Phase 2 — SHRINKING PHASE:
  → Transaction CAN release locks
  → Transaction CANNOT acquire any NEW lock ⚠️
  → Example: unlock(A), unlock(B)... keep releasing
```

**GUARANTEE: 2PL ensures CONFLICT SERIALIZABILITY ✅**

Visual Diagram:
```
Number of
Locks held
    │    
    │         /\
    │        /  \
    │       /    \
    │      /      \
    │     /        \
    │    /          \
    │───/────────────\───
    │  GROWING    SHRINKING
    │  (acquire)  (release)
    └────────────────────── Time
              ↑
         Lock Point
```

### Variants of 2PL:

| Variant | Extra Rule | Benefit |
|---------|-----------|---------|
| **Basic 2PL** | Just growing + shrinking phases | Conflict serializable |
| **Strict 2PL** | Hold ALL **exclusive** locks until COMMIT/ABORT | Prevents cascading rollbacks |
| **Rigorous 2PL** | Hold ALL locks (shared + exclusive) until COMMIT/ABORT | Simplest — transactions serialized in commit order |

> **Most databases use Strict 2PL** — hold exclusive locks until commit.

---

### 18.1.4 Graph-Based Protocols — Tree Protocol

An alternative to 2PL that provides **deadlock-freedom**.

**Tree Protocol Rules:**
```
RULE 1: The FIRST lock by any transaction MUST be on the ROOT node
RULE 2: To lock any other node Q → must CURRENTLY hold a lock on PARENT(Q)
RULE 3: Nodes can be UNLOCKED at any time (no growing/shrinking restriction!)
RULE 4: A node locked and then unlocked by Ti CANNOT be relocked by Ti
```

Visual Example:
```
Tree Structure:
           A (root)
          / \
         B   C
        / \   \
       D   E   F

Transaction T1 wants to lock D:
  Step 1: Lock(A) ← MUST start at root
  Step 2: Lock(B) ← OK, parent A is currently locked
  Step 3: Unlock(A) ← OK, can unlock at any time
  Step 4: Lock(D) ← OK, parent B is still locked ✅

WRONG: Lock(D) directly without locking B first → ❌ VIOLATION!
WRONG: Lock(B) without locking A first → ❌ VIOLATION!
```

**Tree Protocol vs 2PL:**

| Feature | Tree Protocol | 2PL |
|---------|--------------|-----|
| Deadlock? | ❌ **DEADLOCK-FREE!** | ✅ Possible |
| Conflict Serializable? | ✅ Yes | ✅ Yes |
| Lock ordering | Must follow tree structure (parent first) | Any order |
| Unlock timing | Anytime | Only in shrinking phase |
| May lock unnecessary nodes? | ✅ Yes (must lock root even to access a leaf) | ❌ No |

> **KEY ADVANTAGE**: Tree Protocol is **DEADLOCK-FREE** because lock ordering follows the tree hierarchy — circular wait is impossible!

---

### 18.1.5 Insert/Delete Operations and Predicate Reads

**Locking rules for insert/delete:**
1. An **exclusive lock** must be obtained on an item **before it is deleted**.
2. A transaction that **inserts** a new tuple into the database is automatically given an **X-mode lock** on that tuple.

**This ensures:**
- Reads/writes conflict properly with deletes.
- An inserted tuple is **NOT accessible** by other transactions until the inserting transaction **commits**.

---

### 18.1.6 The Phantom Phenomenon

**What is a Phantom?**

A tuple that appears "out of nowhere" in a second query execution because another transaction inserted it between the two queries.

```
Example from slides:
  T1: Read(instructor WHERE dept_name='Physics')    → finds some rows
  
                T2: INSERT instructor in Physics
                T2: INSERT instructor in Comp. Sci.
                T2: COMMIT
  
  T1: Read(instructor WHERE dept_name='Comp. Sci.') → sees T2's new insert!
  
  T1 saw a different set of tuples in its two queries → NOT serializable!
```

**Another Phantom Example:**
- T1 and T2 both find the maximum instructor ID in parallel.
- Both create new instructors with `ID = maximum ID + 1`.
- Both get the **same ID** → NOT possible in any serial schedule.

### Handling Phantoms:

**Solution 1 — Relation-level data item:**
- Associate a data item with the relation to represent "what tuples the relation contains."
- Transactions scanning the relation → acquire **S-lock** on this data item.
- Transactions inserting/deleting → acquire **X-lock** on this data item.
- **Problem**: Provides very low concurrency for insert/delete operations.

**Solution 2 — Index Locking Protocol:**
- Every relation must have **at least one index**.
- A transaction performing a **lookup** must lock all index leaf nodes it accesses in **S-mode** (even if the leaf contains no matching tuple — e.g., for a range query).
- A transaction performing an **insert/update/delete** must:
  - Update all indices.
  - Obtain **X-locks** on all index leaf nodes affected.
- Two-phase locking rules must be observed.
- **Guarantees** that the phantom phenomenon will NOT occur.

**Solution 3 — Next-Key Locking Protocol:**
- Index-locking locks the **entire leaf node** → poor concurrency with many inserts.
- Next-Key Locking provides higher concurrency:
  - Lock all values that satisfy the index lookup (match value or fall in range).
  - Also lock the **next key value** in the index.
  - Lock mode: **S** for lookups, **X** for insert/delete/update.
- Ensures detection of query conflicts with inserts, deletes, and updates.

```
Example with B+-tree leaf nodes:
  [3, 5, 8, 11, 14] → [18, 24, 38, 55]
  
  Query predicate: 7 ≤ X ≤ 16
  Locks acquired: values 8, 11, 14 AND next-key 18
  
  Insert 15: needs X-lock on 15's position and next-key → BLOCKED by the range lock ✅
  Insert 7: needs X-lock on 7's position → BLOCKED ✅
```

---

## 📖 Section 18.2: Deadlock Handling

### What is a Deadlock?

A system is **deadlocked** if there is a set of transactions such that every transaction in the set is **waiting for another transaction in the set**.

Example from slides:
```
T3: lock-X(B), read(B), B := B-50, write(B)
                            T4: lock-S(A), read(A), lock-S(B) ← WAITS for T3
T3: lock-X(A) ← WAITS for T4

T3 waits for T4, T4 waits for T3 → DEADLOCK! 😱
```

### Two Strategies:

| Strategy | Approach |
|----------|----------|
| **Prevention** | Ensure deadlocks can NEVER happen |
| **Detection + Recovery** | Allow deadlocks, detect them, then fix them |

---

### 18.2.1 Deadlock Prevention — Wait-Die and Wound-Wait

Both use **transaction timestamps** (older = smaller timestamp = higher priority).

| Scheme | When Ti wants lock held by Tj | Memory Trick |
|--------|------------------------------|-------------|
| **Wait-Die** (non-preemptive) | If Ti is **OLDER** → Ti **WAITS**. If Ti is **YOUNGER** → Ti **DIES** (rollback) | "Old waits, Young dies" |
| **Wound-Wait** (preemptive) | If Ti is **OLDER** → Ti **WOUNDS** Tj (forces Tj to rollback). If Ti is **YOUNGER** → Ti **WAITS** | "Old attacks, Young waits" |

> Both are **DEADLOCK-FREE** because they impose a total ordering on transactions by age.
> **Important**: When a rolled-back transaction restarts, it keeps its **ORIGINAL timestamp** (to prevent starvation).

---

### 18.2.2 Deadlock Detection — Wait-For Graph

```
Nodes = Transactions
Edge Ti → Tj means: Ti is WAITING for a lock held by Tj

CYCLE in the graph = DEADLOCK!

Example:
  T1 → T2 → T3 → T1  ← CYCLE! = DEADLOCK!

Resolution: Choose a VICTIM (usually youngest or least work done) and ROLLBACK it
```

**Victim Selection Factors:**
1. How long has the transaction been running?
2. How many data items has it used?
3. How many more data items does it need?
4. How many transactions will need to be rolled back?

> **Starvation**: Same transaction should not always be chosen as victim. Include rollback count as a factor.

### 18.2.3 Deadlock Detection — When to Run?

- If deadlocks are **frequent** → run detection algorithm more often
- If deadlocks are **rare** → run less frequently (saves overhead)
- **Timeout-based approach**: If a transaction waits too long, assume deadlock and rollback

---

## 📖 Section 18.3: Multiple Granularity

### The Problem:

Should we lock at the **row level**, **table level**, or **database level**?
- **Fine granularity** (row-level) → More concurrency, but more lock overhead
- **Coarse granularity** (table-level) → Less overhead, but less concurrency

### Granularity Hierarchy (from slides):
```
         Database (DB)
        /           \
     Area (A1)    Area (A2)
    /    \            \
  File(Fa) File(Fb)  File(Fc)
  / | \    / \       / \
 r₁ r₂ rₙ r₁ rₖ   r₁  rₘ    (records)
```

### Intention Lock Modes:

To avoid checking EVERY descendant node, we use **intention locks**:

| Lock | Full Name | Meaning |
|------|-----------|---------|
| **IS** | Intention Shared | "I intend to acquire SHARED locks on some descendants below" |
| **IX** | Intention Exclusive | "I intend to acquire EXCLUSIVE locks on some descendants below" |
| **SIX** | Shared + Intention Exclusive | "I have a SHARED lock on this entire level AND intend to lock some descendants EXCLUSIVELY" |

### Compatibility Matrix (MEMORIZE THIS!):

```
         IS    IX    S    SIX    X
IS       ✅    ✅    ✅    ✅    ❌
IX       ✅    ✅    ❌    ❌    ❌
S        ✅    ❌    ✅    ❌    ❌
SIX      ✅    ❌    ❌    ❌    ❌
X        ❌    ❌    ❌    ❌    ❌
```

> **Memory Trick**: IS is the most compatible (only blocks X). X is the least compatible (blocks everything). SIX blocks almost everything except IS.

### Locking Rules (Multiple Granularity Protocol):

```
1. Must lock the ROOT first
2. A node can be locked in S or IS mode ONLY IF the PARENT is locked in IS or IX mode
3. A node can be locked in X, IX, or SIX mode ONLY IF the PARENT is locked in IX or SIX mode
4. A transaction can lock a node ONLY IF it has not previously unlocked any node
   (i.e., 2PL rules still apply within this protocol)
5. A transaction can UNLOCK a node ONLY IF none of its CHILDREN are currently locked
   → Unlock from BOTTOM to TOP (leaves first, root last)
```

> **Key Observation**: Locks are acquired in **ROOT-to-LEAF** order, but released in **LEAF-to-ROOT** order.

### Lock Granularity Escalation:

If there are **too many locks** at a particular level (too much overhead), the system can automatically **switch to a higher-granularity** S or X lock. For example, if a transaction has locked 1000 individual rows of a table, the system may escalate to a single table-level lock.

### Example:
```
T1 wants to read record r_a2 in file Fa:
  lock-IS(DB) → lock-IS(A1) → lock-S(Fa) → read Fa

T2 wants to update record r_a9 in file Fa:
  lock-IX(DB) → lock-IX(A1) → lock-X(r_a9) → write r_a9

These can run CONCURRENTLY because IS and IX are compatible! ✅
```

---

## 📖 Section 18.4: Timestamp-Based Protocols

### Concept:

Each transaction Ti gets a unique **timestamp TS(Ti)** when it starts (from system clock or logical counter).

For each data item Q, the system maintains:
- **W-timestamp(Q)** = timestamp of the last transaction that successfully **wrote** Q
- **R-timestamp(Q)** = timestamp of the last transaction that successfully **read** Q

### Timestamp Ordering Protocol Rules:

```
Ti wants to READ Q:
  If TS(Ti) < W-timestamp(Q):
    → Ti needs a value that was already OVERWRITTEN by a newer transaction
    → Ti is ROLLED BACK (reject) ❌
  If TS(Ti) ≥ W-timestamp(Q):
    → READ is allowed ✅
    → Update R-timestamp(Q) = max(R-timestamp(Q), TS(Ti))

Ti wants to WRITE Q:
  If TS(Ti) < R-timestamp(Q):
    → A NEWER transaction already READ Q → Ti's write is too late
    → Ti is ROLLED BACK ❌
  If TS(Ti) < W-timestamp(Q):
    → A NEWER transaction already WROTE Q → Ti's write is obsolete
    → Ti is ROLLED BACK ❌
  Otherwise:
    → WRITE is allowed ✅
    → Update W-timestamp(Q) = TS(Ti)
```

### Example from Slides (5 transactions):
```
Transactions: T1(TS=1), T2(TS=2), T3(TS=3), T4(TS=4), T5(TS=5)
All R-TS and W-TS initially = 0

T5: read(X) → OK (TS(T5)=5 ≥ W-TS(X)=0) → R-TS(X) = 5
T2: read(Y) → OK → R-TS(Y) = 2
T1: read(Y) → OK (TS=1 ≥ W-TS(Y)=0) → R-TS(Y) stays 2 (max(2,1)=2)
T3: write(Y) → OK (TS=3 ≥ R-TS(Y)=2 and TS=3 ≥ W-TS(Y)=0) → W-TS(Y) = 3
T3: write(Z) → OK → W-TS(Z) = 3
T4: read(Z) → OK (TS=4 ≥ W-TS(Z)=3) → R-TS(Z) = 4
T2: read(Z) → TS=2 < W-TS(Z)=3 → T2 ABORTED! ❌
T1: read(X) → OK → R-TS(X) stays 5
T4: read(W) → OK → R-TS(W) = 4
T3: write(W) → TS=3 < R-TS(W)=4 → T3 ABORTED! ❌
```

### Correctness of Timestamp-Ordering Protocol:

- Guarantees **conflict serializability** — all arcs in the precedence graph go from transactions with smaller timestamps to transactions with larger timestamps → **no cycles possible**.
- Guarantees **freedom from deadlock** — no transaction ever waits; it either proceeds or is rolled back immediately.
- **⚠️ CAVEAT**: The schedule produced **may NOT be cascade-free**, and **may NOT even be recoverable!**
  - Solution: Delay commits or use a modified protocol to ensure recoverability.

### Thomas Write Rule (Optimization):

```
If TS(Ti) < W-timestamp(Q) for a write:
  Instead of aborting Ti → just SKIP the write (it's obsolete anyway)
  This allows more schedules to succeed without unnecessary aborts
  
  This is safe because the value Ti wants to write will be overwritten
  by the newer transaction's value anyway — so skipping has no effect.
```

> **Important**: Thomas Write Rule does NOT guarantee conflict serializability, but it does guarantee **view serializability**. It allows **greater potential concurrency** by accepting some view-serializable schedules that are not conflict-serializable.

---

## 📖 Section 18.5: Validation-Based Protocols (Optimistic Concurrency Control)

### Concept:

**Optimistic approach**: Assume most transactions don't conflict. Let them execute freely, then **validate** at commit time.

Best when: Conflicts are **RARE** and most transactions are **read-only**.

### Three Phases:

```
Phase 1 — READ PHASE:
  → Transaction reads from database and writes to a PRIVATE workspace
  → No locks needed during this phase

Phase 2 — VALIDATION PHASE:
  → At commit time, check if this transaction CONFLICTS with any other
  → If validation PASSES → proceed to write phase
  → If validation FAILS → ABORT and restart

Phase 3 — WRITE PHASE:
  → Apply the private workspace changes to the actual database
  → Only reaches this phase if validation passed
```

### Timestamps in Validation:

Each transaction Ti has three timestamps:
- **Start(Ti)** — when Ti started its read phase
- **Validation(Ti)** — when Ti entered its validation phase
- **Finish(Ti)** — when Ti finished its write phase

### Validation Test:

For all transactions Tj where TS(Tj) < TS(Ti), ONE of these must hold:

```
Test 1: Finish(Tj) < Start(Ti)
  → Tj completed entirely BEFORE Ti started
  → No conflict possible ✅

Test 2: Start(Ti) < Finish(Tj) < Validation(Ti) AND
        the set of data items WRITTEN by Tj does NOT intersect
        with the set of data items READ by Ti
  → Tj's writes don't affect Ti's reads ✅
```

### Example from Slides:
```
T25 (read-only):     read(B), read(A), <validate>, display(A+B)
T26 (read-write):    read(B), B:=B-50, read(A), A:=A+50, <validate>, write(B), write(A)

T25 validates first → passes (read-only, no conflicts)
T26 validates after → checks: does T25's write set intersect T26's read set?
  T25 has NO writes → no conflict → T26 passes ✅
```

---

## 📖 Section 18.6: Multiversion Schemes

### Concept:

Instead of one value per data item, the system maintains **multiple versions**. Each write creates a NEW version instead of overwriting the old one.

```
Data item Q has versions: <Q1, Q2, ..., Qm>

Each version Qk has three fields:
  1. Content — the actual value of version Qk
  2. W-timestamp(Qk) — timestamp of the transaction that CREATED this version
  3. R-timestamp(Qk) — largest timestamp of any transaction that READ this version
```

### 18.6.1 Multiversion Timestamp Ordering

```
Ti wants to READ Q:
  → Find version Qk where W-timestamp(Qk) is the LARGEST value ≤ TS(Ti)
  → Return the Content of Qk
  → Update R-timestamp(Qk) = max(R-timestamp(Qk), TS(Ti))
  → Reads NEVER fail! ✅

Ti wants to WRITE Q:
  → Find version Qk where W-timestamp(Qk) is the LARGEST value ≤ TS(Ti)
  → If TS(Ti) < R-timestamp(Qk):
      → Some newer transaction already read this version → ABORT Ti ❌
  → Otherwise:
      → Create a NEW version Qj with Content = Ti's value, W-timestamp(Qj) = TS(Ti)
```

> **Key Advantage**: Reads NEVER wait and NEVER fail. Only writes can be rejected.

### 18.6.2 Multiversion Two-Phase Locking

Used in real databases. Differentiates between **read-only transactions** and **update transactions**:

```
Update Transactions:
  → Acquire read and write locks → follow RIGOROUS 2PL
  → Hold ALL locks until end of transaction
  → Read of a data item returns the LATEST version
  → First write of Q by Ti creates a NEW version Qi
    ▪ W-timestamp(Qi) = ∞ initially

Commit Processing (when update transaction Ti completes):
  → ts-counter value (stored in database) is used to assign timestamps
  → ts-counter is locked in two-phase manner
  → Set TS(Ti) = ts-counter + 1
  → Set W-timestamp(Qi) = TS(Ti) for ALL versions Qi created by Ti
  → Set ts-counter = ts-counter + 1

Read-Only Transactions:
  → Assigned TS = ts-counter value at start
  → Use multiversion timestamp ordering to find correct version
  → NEVER wait, NEVER need locks! ✅
```

> This is the basis for how real databases (PostgreSQL, Oracle) implement MVCC.

---

### 18.6.3 Snapshot Isolation

Snapshot Isolation is a **practical implementation** of multiversion concurrency control, widely used in PostgreSQL, Oracle, and SQL Server.

```
How it works:
  1. Transaction Ti STARTS → Takes a SNAPSHOT of all committed data at that moment
  2. All READS come from this snapshot → No locks needed for reading!
  3. All WRITES go to a private workspace
  4. At COMMIT time:
     → Check: Did any OTHER committed transaction WRITE to the same data items?
     → YES (write-write conflict) → Ti is ABORTED ❌ (First-Committer-Wins rule)
     → NO conflict → Ti COMMITS ✅ (writes applied to main database)

KEY BENEFIT: Readers NEVER block writers. Writers NEVER block readers.
```

**First-Committer-Wins vs First-Updater-Wins:**

| Variant | When is conflict checked? | Mechanism |
|---------|--------------------------|----------|
| **First-Committer-Wins** | At **commit time** — if another transaction already committed a write to the same item | Check at commit |
| **First-Updater-Wins** | At **write time** — lock the item when writing; if another concurrent transaction has the lock, wait | Lock held until all concurrent transactions finish |

> **Note**: Oracle uses the First-Updater-Wins variant (plus some extra features). The two variants differ only in **when** the abort occurs; otherwise they are equivalent.

**Snapshot Isolation vs 2PL:**

| Feature | Snapshot Isolation | Two-Phase Locking |
|---------|-------------------|-------------------|
| Do reads block? | ❌ **NEVER** | ✅ May block |
| Do writers block readers? | ❌ **NEVER** | ✅ Yes |
| Do writers block writers? | ✅ Only on same item | ✅ Yes |
| Deadlock possible? | ❌ Rare | ✅ Common |
| Always serializable? | ❌ **NO!** (Write Skew) | ✅ Yes (if strict) |

> **EXAM TRAP**: "Snapshot Isolation guarantees serializability" → ❌ **FALSE!** It can suffer from the **Write Skew anomaly**.

**Write Skew Anomaly — Example 1 (Doctors):**
```
Example: Two on-call doctors, rule = at least one must remain on-call

T1: Reads both doctors (from snapshot) → both on-call → sets Doctor1 = off-call
T2: Reads both doctors (from ITS snapshot) → both on-call → sets Doctor2 = off-call

Both commit → BOTH doctors are off-call! Rule violated!
(Each saw a valid snapshot, but combined effect is invalid)
```

**Write Skew Anomaly — Example 2 (A=B Swap from slides):**
```
Initially: A = 3, B = 17
Serial execution would give: A = 17, B = 3 OR A = 3, B = 17

  Ti:                    Tj:
  read(A)   ← reads 3
  read(B)   ← reads 17
                         read(A)   ← reads 3
                         read(B)   ← reads 17
  A := B                           B := A
  write(A)  ← writes 17            write(B)  ← writes 3

Result: A = 17, B = 3 ???  NO!
Both read from SAME snapshot (A=3, B=17)
  Ti writes A = 17 (from its snapshot B=17)
  Tj writes B = 3  (from its snapshot A=3)
Final: A = 17, B = 3 → This IS a valid serial result (Ti before Tj)
BUT if both start simultaneously → Could also get A = 17, B = 3 which IS valid.

The REAL problem with skew: different items written → NO write-write conflict
→ First-Committer-Wins does NOT detect it!
```

> **Skew also occurs with inserts** (e.g., two transactions find max order number, both insert with max+1 → same number = phantom phenomenon).

**Snapshot Read Example from slides:**
```
X₀ = 100, Y₀ = 0

T1 (deposits 50 in Y):         T2 (withdraws 50 from X):
r1(X₀, 100)                    
r1(Y₀, 0)                      
                                r2(Y₀, 0)
                                r2(X₀, 100)
                                w2(X₂, 50)
w1(Y₁, 50)
r1(X₀, 100)  ← T2's update NOT seen (snapshot!)
r1(Y₁, 50)   ← CAN see its OWN updates
                                r2(Y₀, 0) ← T1's update NOT seen

Final: X₂ = 50, Y₁ = 50 (total preserved ✅)
```

---

## 📋 Quick Comparison — All Concurrency Control Protocols

| Protocol | Deadlock-Free? | Conflict Serializable? | Starvation-Free? | Used in Practice? |
|----------|---------------|----------------------|-----------------|------------------|
| Basic 2PL | ❌ No | ✅ Yes | ❌ No | Rarely alone |
| Strict 2PL | ❌ No | ✅ Yes | ❌ No | ✅ MySQL InnoDB |
| Tree Protocol | ✅ Yes | ✅ Yes | ❌ No | Specialized |
| Timestamp Ordering | ✅ Yes | ✅ Yes | ❌ Possible | Some systems |
| Validation | ✅ Yes | ✅ Yes | ❌ Possible | Read-heavy systems |
| MVCC + Snapshot | ✅ Mostly | ❌ Not always | ✅ Mostly | ✅ PostgreSQL, Oracle |

---

## 🧠 Quick Memory Tricks

| Concept | Trick |
|---------|-------|
| 2PL phases | "**G**row first, **S**hrink later = **G**et locks, then **S**urrender" |
| Tree Protocol | "Parent first, Child second — always ask Parent's permission" |
| Snapshot Isolation | "Take a photo at the start, read from your photo" |
| Deadlock | "Two people blocking each other's doorway" |
| Wait-Die | "Old = Wait, Young = Die" |
| Wound-Wait | "Old = Wound (attack), Young = Wait" |
| Intention locks | "IS = I plan to share, IX = I plan to exclusively use" |
| Validation | "Optimistic — do everything first, check conflicts later" |
| Thomas Write Rule | "Skip the obsolete write instead of aborting" |

---

*Previous → [Chapter 17](./ENDSEM_CH17_TRANSACTIONS.md)* 📚

**Focus heavily on this chapter! It had the highest quiz weight at 21%. Sections 18.1 (2PL + Tree Protocol) and 18.6 (Snapshot Isolation) are the most quiz-tested. Also know the Multiple Granularity compatibility matrix — it's a classic exam question! 💪**
