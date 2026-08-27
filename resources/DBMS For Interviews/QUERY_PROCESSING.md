# Chapter 15: Query Processing - Study Guide
**Date:** 6 May 2026
**Subject:** Database Management Systems (Korth 7th Ed.)
**Syllabus Coverage:** Sections 15.1 to 15.7

---

## 🧠 Is Chapter Mein Kya Kya Hai?

1. **Query Processing Overview** — SQL query ko database actually kaise execute karta hai
2. **Measures of Query Cost** — Cost kaise measure hota hai (Disk I/O count karna)
3. **Selection Operation** — `WHERE` clause kaise implement hota hai (Linear, Binary, Index search)
4. **Sorting** — External Sort-Merge algorithm ⭐
5. **Join Operations** ⭐⭐⭐ — SABSE IMPORTANT (4 types of joins!)
6. **Other Operations** — Duplicate elimination, Aggregation, Set operations, Outer join
7. **Evaluation of Expressions** — Materialization vs Pipelining ⭐
~~8. Query Processing in Memory~~ ← ❌ NOT in syllabus (15.8)
---
## 1. Query Processing Ka Big Picture (Slides 1-4) 🖼️
### Samajh aise — Zomato Order Analogy 🍕
Tu Zomato pe "Paneer Butter Masala" order karta hai.

Zomato ke paas 3 steps hain:
1. **Parsing**: "Paneer Butter Masala" ko samajhna → kaunsa restaurant, kya item (yeh hai **SQL ko relational algebra mein convert karna**)
2. **Optimization**: 10 restaurants mein se sabse sasta, fast aur best quality wala choose karna (yeh hai **query optimization**)
3. **Execution**: Actual order place karke delivery karvana (yeh hai **query execution engine**)

### Database Mein Yeh 3 Steps Hain:

```
SQL Query
    │
    ▼
┌─────────────────────┐
│  1. PARSER &         │ ← SQL syntax check karo, relational algebra mein convert karo
│     TRANSLATOR       │
└─────────┬───────────┘
          │  (Relational Algebra Expression)
          ▼
┌─────────────────────┐
│  2. OPTIMIZER        │ ← Best execution plan choose karo (sabse kam cost wala)
│                      │
└─────────┬───────────┘
          │  (Execution Plan)
          ▼
┌─────────────────────┐
│  3. EVALUATION       │ ← Plan ko actually execute karo, result do
│     ENGINE           │
└─────────────────────┘
          │
          ▼
      Query Output
```

### Ek Actual Example:

```sql
SELECT salary FROM instructor WHERE salary < 75000;
```

Isko execute karne ke **2 alag plans** ho sakte hain:

**Plan 1**: Full table scan karo, har row check karo salary < 75000 hai ya nahi ❌ SLOW

**Plan 2**: Agar salary pe index hai, toh seedha index use karo ✅ FAST

> 🔥 **EXAM TIP**: "Query Optimization" ka matlab **best plan choose karna** hai, not necessarily the absolute optimal. Database hamesha ek "reasonably good" plan dhundta hai, kyunki SABSE best plan dhundhne mein khud bahut time lagega!

---

## 2. Measures of Query Cost (Slides 5-6) 💰

### Cost = Kitne Disk I/O Lage?

Database ke liye **sabse mehnga kaam** hai disk se data padhna/likhna. CPU time choti cheez hai compared to disk I/O.

Cost measure karne ke liye hum **2 cheezein** count karte hain:

| Factor | Kya Hai | Analogy |
|--------|---------|---------|
| **Block Transfers (b_t)** | Kitne blocks disk se memory mein transfer hue? | Godown se kitne boxes truck mein lade? |
| **Disk Seeks (S)** | Kitni baar disk arm ko nayi position pe jaana pada? | Truck ko kitne alag alag godowns jaana pada? |

### Cost Formula:

```
Total Cost = b × t_T + S × t_S
```

Jahan:
- **b** = number of block transfers
- **t_T** = time for one block transfer (typically 0.1 ms)
- **t_S** = time for one disk seek (typically 4 ms)

> ⚡ **Key Insight**: Seek bohot costly hai transfer se! Ek seek = 40 block transfers ke barabar. Isliye database hamesha koshish karta hai ki kam se kam seeks ho.

### Exam Mein Kaise Likhein?

Cost formula mein **DONO cheezein** likhni hain — block transfers AUR seeks. Lekin jab do algorithms ki **quick comparison** karni ho, toh hum mainly **block transfers pe focus** karte hain kyunki woh dominant cost hai (seeks ka pattern bhi similar hota hai mostly).

**Buffer Size = M pages** → Bahut important variable. Memory mein kitne blocks rakh sakte hain, woh `M` hai.

> 🔥 **EXAM TIP**: Formula likhte waqt **dono likh** — block transfers + seeks. Lekin jab question bole "compare algorithms" toh block transfers se compare karo. Worst case assume karo jab tak question na bole ki buffer bada hai.

---

## 3. Selection Operation (Slides 7-13) 🔍

**Selection** = `WHERE` clause implement karna.

### Algorithm A1: Linear Search (File Scan)

**Kya karta hai**: Har ek block ko disk se padho, har record check karo.

```
Example: SELECT * FROM student WHERE name = 'Aman';

File mein 1000 blocks hain:
→ WORST CASE: 1000 block transfers (poore file scan karo)
→ BEST CASE (key attribute pe search): Average 500 blocks (key unique hai toh aadhe mein mil jaayega)
```

**Cost Formula**:
```
Cost = b_r block transfers + 1 seek
(b_r = total blocks in relation r)

Agar key attribute hai: Average = b_r/2 transfers + 1 seek
```

> 📌 Linear search **hamesha kaam karta hai** — koi bhi condition ho, koi index ho ya na ho. Yeh FALLBACK plan hai. Lekin SLOW hai! 🐢

---

### Algorithm A2: Primary Index + Equality on Key

**Condition**: Index hai candidate/primary key pe, aur tum equality search kar rahe ho (e.g., `WHERE id = 5`)

```
Soch aise: B+ Tree ka height = h_i
           
Step 1: Tree traverse karo → h_i block reads
Step 2: Actual record padho → 1 block read

Cost = (h_i + 1) block transfers + (h_i + 1) seeks
```

**Example**:
```
B+ Tree height = 3
Cost = 3 + 1 = 4 block transfers, 4 seeks
Compare with linear: 1000 blocks scan
MASSIVE IMPROVEMENT! 🚀
```

---

### Algorithm A3: Primary Index + Equality on Non-Key

**Condition**: Primary index hai, lekin search attribute mein **duplicates** ho sakte hain (e.g., `WHERE dept = 'CSE'`)

```
B+ Tree traverse karke pehla matching record dhundho, 
phir sequentially aage padho (kyunki primary index sorted hai)

Cost = h_i × (t_T + t_S) + t_S + t_T × b
(b = number of blocks containing matching records)
```

> Matlab: Tree traverse + consecutive blocks padho jab tak matching records mil rahe hain.

---

### Algorithm A4: Secondary Index + Equality

**Secondary index** pe search — records sorted nahi hain file mein.

| Case | Cost |
|------|------|
| Candidate key (unique value) | **(h_i + 1) × (t_T + t_S)** → Ek hi record milega |
| Non-key (multiple matches) | **Bahut expensive!** Har matching record alag block mein ho sakta hai |

```
Example: "SELECT * FROM student WHERE city = 'Delhi'"
city pe secondary index hai, 50 students Delhi ke hain.
WORST CASE: 50 alag alag blocks padhne padenge!
→ Isliye sometimes linear search CHEAPER hota hai is case mein!
```

> 🔥 **EXAM TIP**: Secondary index on non-key → Cost can be VERY HIGH. Yeh exam mein trick question aata hai!

---

### Selections Involving Comparisons (A5, A6)

**Range queries** ke liye: `WHERE salary > 50000`

| Algorithm | Kaise Kaam Karta Hai |
|-----------|---------------------|
| **A5 - Primary Index, Comparison** | B+ tree se starting point dhundho, phir linearly scan karo |
| **A6 - Secondary Index, Comparison** | B+ tree ke leaf level pe traverse karo starting point se, pointers follow karo |

```
σ(salary ≥ V): B+ tree mein V dhundho, phir aage ke saare leaf nodes traverse karo.
σ(salary ≤ V): B+ tree mein V dhundho, peeche takwaale saare records lo.
     (ya first leaf se start karo, V tak traverse karo)
```

---

### Complex Selections — Conjunction & Disjunction

**Conjunctive Selection** (AND): `WHERE dept='CSE' AND salary > 50000`

| Strategy | Method |
|----------|--------|
| **A7** | Index use karo kisi ek condition pe, baaki conditions results pe check karo |
| **A8 (Composite Index)** | Agar composite index hai (dept, salary) pe toh directly use karo |
| **A9 (Intersection of Indices)** | Har condition pe alag index use karo, results ka **intersection** lo |

**Disjunctive Selection** (OR): `WHERE dept='CSE' OR salary > 50000`

```
Strategy A10: Agar SAB conditions pe index hai → Har ek se results lo → UNION karo
             Agar ek bhi condition pe index nahi → Linear scan karna padega 😢
```

> 🔥 **EXAM TIP**: AND → Intersection use karo. OR → Union use karo (lekin agar ek bhi index missing toh linear scan).

---

## 4. Sorting — External Sort-Merge ⭐ (Slides 14-17)

### Kyun Important Hai?

- `ORDER BY` clause
- Join algorithms ke liye sorted data chahiye
- Duplicate elimination ke liye
- `GROUP BY` ke liye

### Problem: Data Memory Mein Fit Nahi Hota!

Agar table 100 GB ki hai aur memory sirf 1 GB hai, toh kaise sort karein?

**Answer: External Sort-Merge Algorithm** 🧠

### Kaise Kaam Karta Hai — 2 Phases:

```
Phase 1: CREATE SORTED RUNS
━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Memory mein M blocks aa sakte hain
→ File ke M-M blocks padho, memory mein sort karo, disk pe likh do
→ Har ek sorted chunk ko "RUN" bolte hain

Phase 2: MERGE RUNS
━━━━━━━━━━━━━━━━━━━
→ M-1 runs ko simultaneously padho (ek buffer output ke liye reserved)
→ Sabse chhota element output mein daalo
→ Jab tak saare runs merge nahi ho jaate
```

### Step-by-Step Example:

```
File: 108 blocks, Memory: M = 5 blocks

Phase 1 - CREATE RUNS:
━━━━━━━━━━━━━━━━━━━━━━
Data: [45, 12, 78, 3, 56, 23, 89, 1, 67, 34, 90, 11, ...]

→ 5 blocks padho → memory mein sort karo → likh do
   Run 0: [3, 12, 45, 56, 78]
→ agle 5 padho → sort karo → likh do  
   Run 1: [1, 23, 34, 67, 89]
→ ...aur aisa continue
   Run 2: [11, 22, 33, 44, 90]
   ...

Total runs = ⌈108/5⌉ = 22 sorted runs bane

Phase 2 - MERGE RUNS:
━━━━━━━━━━━━━━━━━━━━━
M-1 = 4 runs ek baar mein merge kar sakte hain

Pass 1: 22 runs → ⌈22/4⌉ = 6 merged runs
Pass 2: 6 runs → ⌈6/4⌉ = 2 merged runs  
Pass 3: 2 runs → 1 final sorted file ✅
```

### Cost Formula (EXAM MEIN ZAROOR AATA HAI):

```
Total number of merge passes = ⌈log_{M-1}(⌈b_r/M⌉)⌉

Block Transfers:
  Initial run creation: 2 × b_r (read + write)
  Each merge pass: 2 × b_r (read + write)    ...except final pass (only read, no write)
  
TOTAL = b_r × (2⌈log_{M-1}(⌈b_r/M⌉)⌉ + 1) block transfers

Disk Seeks:  
  = 2⌈b_r/M⌉ + ⌈b_r/b_b⌉ × (2⌈log_{M-1}(⌈b_r/M⌉)⌉ - 1) seeks
  (b_b = number of blocks in each buffer, usually b_b = 1)
```

### Numerical — Full Solved Example:

```
Given: b_r = 108 blocks, M = 5 blocks

Step 1: Initial runs = ⌈108/5⌉ = 22 runs

Step 2: Merge passes = ⌈log_4(22)⌉ = ⌈2.29⌉ = 3 merge passes
        (4 because M-1 = 5-1 = 4)

Step 3: Block transfers = 108 × (2×3 + 1) = 108 × 7 = 756 block transfers

Step 4: Seeks (with b_b = 1):
        = 2 × ⌈108/5⌉ + ⌈108/1⌉ × (2×3 - 1)
        = 2 × 22 + 108 × 5
        = 44 + 540
        = 584 seeks
```

> 🔥 **EXAM TIP**: Yeh numerical 100% aata hai! Formula ratna zaroori hai:
> - Runs = ⌈b_r/M⌉
> - Passes = ⌈log_{M-1}(runs)⌉
> - Block transfers = b_r × (2 × passes + 1)

---

## 5. JOIN Operations ⭐⭐⭐ — EXAM KA BOSS (Slides 18-43)

> ⚠️ **ALERT**: Yeh section SABSE IMPORTANT hai! 4 algorithms hain — sabki cost yaad karo.

Hum yeh standard example use karenge:

```
CHAPTER KA GOLDEN EXAMPLE:
━━━━━━━━━━━━━━━━━━━━━━━━━
instructor ⋈ teaches (join on common attribute)

instructor (r):
  n_r = 5,000 tuples
  b_r = 100 blocks

teaches (s):
  n_s = 10,000 tuples
  b_s = 400 blocks

Memory: M = 25 blocks (available buffer)
```

---

### 5.1 Nested-Loop Join (NLJ) — Sabse Basic 🐢

**Idea**: Har ek row of outer table ke liye, inner table ki saari rows check karo.

```python
# Pseudocode — Nested Loop Join
for each tuple t_r in r:          # Outer loop
    for each tuple t_s in s:      # Inner loop
        if (t_r aur t_s join condition satisfy karte hain):
            result mein daalo (t_r + t_s)
```

**Soch aise** 🍕: Tu class mein har ladke ko har ladki se pair karna chahta hai check karne ke liye ki kaun compatible hai — 50 boys × 50 girls = 2500 comparisons!

### Cost Formula:

```
WORST CASE (buffer mein sirf 1 page fit hota hai each relation ka):
  Cost = n_r × b_s + b_r block transfers
         n_r + b_r seeks

EXPLANATION:
  → Outer relation (r) ke har TUPLE ke liye, inner relation (s) ka poora scan
  → n_r = 5000 tuples, b_s = 400 blocks
  → 5000 × 400 + 100 = 2,000,100 block transfers 😱 BAHUT EXPENSIVE!
```

**Best Case**: Agar dono relations memory mein fit ho jaayein:
```
Cost = b_r + b_s = 100 + 400 = 500 block transfers ✅ CHEAP!
```

> 🔑 **KEY POINT**: **Chhoti table ko OUTER banao!** Kyunki outer table ka scan ek hi baar hota hai, inner ka baar baar.

### Numerical Example:

```
instructor (OUTER) ⋈ teaches (INNER):
Cost = 5000 × 400 + 100 = 2,000,100 block transfers

teaches (OUTER) ⋈ instructor (INNER):  
Cost = 10000 × 100 + 400 = 1,000,400 block transfers

DONO MEIN instructor outer banana BETTER HAI? NAHI! 
teaches outer = 1,000,400 which is less! WAIT...
Actually n_r × b_s vs n_s × b_r compare karo.

teaches outer: 10000 × 100 = 1,000,000
instructor outer: 5000 × 400 = 2,000,000

teaches OUTER cheaper hai! 🎯
```

---

### 5.2 Block Nested-Loop Join (BNLJ) — Improved Version 📦

**Idea**: Tuple-by-tuple ke bajaye **block-by-block** compare karo!

```python
# Pseudocode — Block Nested Loop Join
for each BLOCK B_r of r:          # Outer loop (block-wise)
    for each BLOCK B_s of s:      # Inner loop (block-wise)
        for each tuple t_r in B_r:
            for each tuple t_s in B_s:
                if join condition matched:
                    output (t_r + t_s)
```

### Cost Formula:

```
WORST CASE:
  Cost = b_r × b_s + b_r block transfers
         2 × b_r + b_r seeks   (agar buffer size = 3: 1 outer + 1 inner + 1 output)

BEST CASE (Chhoti relation memory mein fit):
  Cost = b_r + b_s block transfers + 2 seeks
```

### Numerical Example:

```
instructor (OUTER) ⋈ teaches (INNER):
Worst case:
Cost = 100 × 400 + 100 = 40,100 block transfers
Compare: NLJ mein 2,000,100 → BNLJ mein 40,100 → 50x IMPROVEMENT! 🚀
```

### Optimization — Use ALL M Buffer Blocks:

```
Agar Memory mein M blocks available hain:
→ M-2 blocks OUTER relation ke liye use karo
→ 1 block INNER relation ke liye  
→ 1 block OUTPUT ke liye

Cost = ⌈b_r/(M-2)⌉ × b_s + b_r block transfers
       2 × ⌈b_r/(M-2)⌉ seeks

Example: M = 25
= ⌈100/(25-2)⌉ × 400 + 100
= ⌈100/23⌉ × 400 + 100
= 5 × 400 + 100
= 2,100 block transfers 🔥🔥🔥
```

> 🔥 **EXAM TIP**: Block NLJ ka formula yaad rakh — `⌈b_r/(M-2)⌉ × b_s + b_r`. Aur hamesha **chhoti relation ko OUTER** banao!

---

### 5.3 Indexed Nested-Loop Join — Index Ka Power ⚡ (Slide 28-29)

**Condition**: Inner relation ke join attribute pe INDEX hona chahiye (B+ Tree ya Hash Index)

```
Idea: Outer relation ke har tuple ke liye, 
      inner relation mein INDEX use karke matching tuples dhundho.
      
Benefit: Inner relation ka full scan nahi karna padta!
```

### Cost Formula:

```
Cost = b_r (t_T + t_S) + n_r × c

Where:
  b_r = outer relation ki blocks (poori outer scan)
  n_r = outer relation ke tuples
  c = cost of single index lookup on inner relation
```

### "c" ka value kya hoga?

```
Agar inner pe B+ Tree primary index hai:
  c = (h_i + 1) block transfers → tree height + 1 data block

Agar inner pe B+ Tree secondary index hai:
  c = (h_i + 1 + matching tuples for each lookup)
  
Example with B+ Tree:
  tree height h_i = 4
  c = 4 + 1 = 5 per lookup
  
  Total cost = 100 + 5000 × 5 = 25,100 block transfers
  Compare: BNLJ mein 40,100 → Index NLJ mein 25,100 → BETTER! 🚀
```

> 🔑 **KEY POINT**: Agar dono relations pe index hai, toh **jis relation mein FEWER tuples hain, use OUTER banao!**

---

### 5.4 Merge Join (Sort-Merge Join) ⭐⭐ (Slides 30-32)

**Condition**: Dono relations join attribute pe **SORTED** honi chahiye.

```
Idea:  
1. Dono tables ko join attribute pe SORT karo (agar sorted nahi hain)
2. Phir dono ke pointers use karke ek baar mein merge karo
   (jaise merge sort ka merge step kaam karta hai)
```

### Step-by-Step:

```
Sorted instructor (by ID):    Sorted teaches (by ID):
┌────┐                        ┌────┐
│ 101│ ←── pr                 │ 101│ ←── ps
│ 102│                        │ 101│
│ 103│                        │ 102│
│ 104│                        │ 103│
│ 105│                        │ 103│
└────┘                        │ 104│
                              └────┘

Step 1: pr=101, ps=101 → MATCH! Output (101,101). ps aage badha → 101 again → MATCH!
Step 2: ps=102 > pr=101 → pr aage badha → pr=102 → MATCH!
Step 3: ps=103 > pr=102 → pr aage badha → pr=103 → MATCH! ps aage → 103 → MATCH!
... aur continue...

Har record SIRF EK BAAR scan hota hai! ✅
```

### Cost Formula:

```
AGAR ALREADY SORTED:
  Cost = b_r + b_s block transfers + ⌈b_r/b_b⌉ + ⌈b_s/b_b⌉ seeks

AGAR SORT KARNA PADHE (which is usually the case):
  Total Cost = Sort cost of r + Sort cost of s + Merge cost
  
  Sort cost = b × (2⌈log_{M-1}(b/M)⌉ + 1) per relation  (external sort-merge formula)
  
  Merge cost = b_r + b_s (single pass merge)
```

### Numerical Example:

```
instructor: b_r = 100, teaches: b_s = 400, M = 25

Sorting instructor:
  Runs = ⌈100/25⌉ = 4
  Merge passes = ⌈log_24(4)⌉ = 1       (24 = M-1 = 24)
  Sort cost = 100 × (2×1 + 1) = 300 block transfers

Sorting teaches:
  Runs = ⌈400/25⌉ = 16
  Merge passes = ⌈log_24(16)⌉ = 1
  Sort cost = 400 × (2×1 + 1) = 1200 block transfers

Merge cost: 100 + 400 = 500 block transfers

TOTAL = 300 + 1200 + 500 = 2000 block transfers 🔥

Compare:
  NLJ:   2,000,100
  BNLJ:  40,100  
  INLJ:  25,100
  Merge: 2,000 → SABSE BEST! 🏆
```

> 🔥 **EXAM TIP**: Merge Join ki cost calculation numerical mein ZAROOR aata hai. Steps likhna: Sort r + Sort s + Merge. Phir cost add karo. **Hybrid merge join** — agar ek relation sorted hai, partial sort baaki ka → cost aur kam.

---

### 5.5 Hash Join ⭐⭐⭐ (Slides 31-41) — THE KING OF JOINS

**Condition**: Sirf **equi-join** aur **natural join** ke liye kaam karta hai.

### Idea — Partition & Probe (2 Phases):

```
Soch aise — College Fest Registration 🎪:

Phase 1 (PARTITION):
Tu 1000 students ko 10 groups mein baant deta hai unke branch ke hisaab se:
Group 0 = CSE students, Group 1 = IT students, Group 2 = ECE students...

Phase 2 (BUILD & PROBE):
Ab tu ek group mein baithke matching registration dhundhta hai.
CSE wale students ke registrations sirf CSE group mein hi honge!
```

### Algorithm Steps:

```
Hash Join: r ⋈ s

PHASE 1 — PARTITION:
  1. Hash function h use karo join attribute pe
  2. r ke saare tuples ko n partitions mein baanto: r₀, r₁, ..., rₙ
  3. s ke saare tuples ko SAME hash function se n partitions mein baanto: s₀, s₁, ..., sₙ
  
  KEY INSIGHT: r_i ke tuples SIRF s_i ke tuples se match ho sakte hain!
  (kyunki same hash value wale hi match karenge)

PHASE 2 — BUILD & PROBE (for each partition i):
  1. s_i ko memory mein load karo (yeh hai BUILD input — chhoti relation)
  2. s_i pe ek in-memory hash index banao (DIFFERENT hash function h₂ se)
  3. r_i ke tuples ek ek padhke, hash index mein matching dhundho (yeh hai PROBE input)
  4. Jo match mile, output karo
```

```
Diagram:

     r                      s
     │                      │
     ▼                      ▼
  ┌──────┐              ┌──────┐
  │h(JA) │              │h(JA) │     ← Same hash function h
  └──┬───┘              └──┬───┘
     │                      │
  ┌──┴──┐              ┌──┴──┐
  │r₀ r₁│              │s₀ s₁│
  │r₂ r₃│              │s₂ s₃│      ← Partitions
  │r₄   │              │s₄   │
  └─────┘              └─────┘
  
  Then: r₀ ↔ s₀, r₁ ↔ s₁, r₂ ↔ s₂ ... individually match karo
```

### Terminology:
- **Build input (s)**: Chhoti relation → jisko memory mein load karte hain (hash table banate hain)
- **Probe input (r)**: Badi relation → jisko probe karte hain against hash table

### Cost Formula (NO Recursive Partitioning):

```
Cost = 3(b_r + b_s) + 4 × n_h block transfers
       + 2(⌈b_r/b_b⌉ + ⌈b_s/b_b⌉) seeks

Simplified (ignoring small constants for comparison):
Cost ≈ 3(b_r + b_s) block transfers
```

**Why 3×?**
```
1st read:  r aur s dono ko PARTITION karo → read karo (b_r + b_s)
1st write: Partitions ko disk pe likho → write karo (b_r + b_s)  
2nd read:  BUILD & PROBE ke time partitions wapas padho → read karo (b_r + b_s)

Total = 3 × (b_r + b_s)
```

### Numerical Example:

```
instructor: b_r = 100, teaches: b_s = 400

Hash Join Cost = 3 × (100 + 400) = 3 × 500 = 1500 block transfers

Compare:
  NLJ:    2,000,100  🐢🐢🐢
  BNLJ:   40,100     🐢
  INLJ:   25,100     😐
  Merge:  2,000      😊
  Hash:   1,500      🏆 WINNER!
```

### Memory Requirement for Hash Join:

```
Condition: Har ek partition of s (build input) memory mein fit honi chahiye.

n (number of partitions) choose karo such that:
  each s_i fits in memory → each partition ≈ b_s/n blocks

n is typically chosen as: ⌈b_s/M⌉ × f
  where f = "fudge factor" ≈ 1.2 (extra margin rakhte hain)

Minimum Memory Required: M > √(b_s)    (approximately)
  → Agar b_s = 400, toh M > √400 = 20 blocks chahiye minimum
```

### Recursive Partitioning (Slide 35):

```
Kab chahiye? Jab n > M (partitions memory se zyada hain)

Solution: 
  → M-1 partitions banao (instead of n)
  → Phir har partition ko DOBAARA partition karo (different hash function se)
  → Yeh tab tak karo jab tak partitions memory mein fit ho jayein

Cost with recursive partitioning:
  = 2(b_r + b_s)⌈log_{M-1}(b_s/M)⌉ + b_r + b_s block transfers

Rarely needed in practice! 4 KB block size ke saath, 
2 MB memory se 1 GB tak ka data handle ho jaata hai bina recursive partitioning ke.
```

### Handling Overflows (Slide 36):

```
Problem: Partition SKEWED ho sakta hai (kuch partitions bahut bade ho jaayein)
  → e.g., 90% students CSE mein hain toh CSE partition bahut bada hoga

Hash-table overflow reasons:
  1. Bahut saare tuples same join value ke (duplicates)
  2. Bad hash function (uneven distribution)
  
Solutions:
  📌 Overflow Resolution: Overflowed partition ko further partition karo (different hash function se)
  📌 Overflow Avoidance: Bahut saare chhote partitions banao, phir combine karo
  📌 Fallback: Agar bahut zyada duplicates hain → Block Nested Loop Join use karo overflowed partitions pe
```

### Hybrid Hash Join (Slide 39):

```
Special case: Jab memory BADI hai (M >> √b_s)

Idea: Pehli partition MEMORY MEIN HI RAKH LO! Disk pe mat likho.
→ Saving: Pehli partition ka write + read DONO bach gaye!

Example:
  Memory = 25 blocks
  instructor: 5 partitions × 20 blocks = 100 blocks
  teaches: 5 partitions × 80 blocks = 400 blocks
  
  Memory division:
    20 blocks = first partition of s (in memory)
    1 block = input buffer
    4 blocks = output buffers for other 4 partitions
  
  Normal hash join cost: 3(100+400) = 1500
  Hybrid hash join cost: 3(80+320) + 20 + 80 = 1300 
  Saving of 200 block transfers! 🎉

Most useful when M >> √(b_s)
```

---

## 🏆 JOIN Cost Comparison — MASTER TABLE (EXAM KE LIYE RATT LE!)

```
Given: r: n_r=5000, b_r=100  |  s: n_s=10000, b_s=400  |  M=25

┌────────────────────┬──────────────────────┬──────────────┐
│  Join Algorithm     │  Cost Formula         │  Cost Value  │
├────────────────────┼──────────────────────┼──────────────┤
│ Nested-Loop Join   │ n_r × b_s + b_r      │ 2,000,100    │
│ Block NLJ (worst)  │ b_r × b_s + b_r      │ 40,100       │
│ Block NLJ (M buf)  │ ⌈b_r/(M-2)⌉×b_s+b_r │ 2,100        │
│ Indexed NLJ        │ b_r + n_r × c        │ ~25,100      │
│ Merge Join         │ Sort both + merge     │ ~2,000       │
│ Hash Join          │ 3(b_r + b_s)         │ 1,500        │
│ Hybrid Hash Join   │ < 3(b_r + b_s)       │ 1,300        │
└────────────────────┴──────────────────────┴──────────────┘

RANKING: Hybrid Hash < Hash < Merge << BNLJ(M) << Indexed NLJ << BNLJ(worst) << NLJ
```

---

### 5.6 Complex Joins (Slide 40)

**Conjunctive Join** (Multiple AND conditions):
```
r ⋈_{θ1 ∧ θ2 ∧ ... ∧ θn} s

Option 1: Nested loops/Block nested loops (koi bhi condition pe kaam karega)
Option 2: Ek condition pe efficient join karo, baaki conditions result pe filter karo
```

**Disjunctive Join** (Multiple OR conditions):
```
r ⋈_{θ1 ∨ θ2 ∨ ... ∨ θn} s

Option 1: Nested loops (always works)
Option 2: Har condition pe alag join karo → results ka UNION lo
         (r ⋈_θ1 s) ∪ (r ⋈_θ2 s) ∪ ... ∪ (r ⋈_θn s)
```

---

## 6. Other Operations (Slides 42-50) 📋

### 6.1 Duplicate Elimination

```sql
SELECT DISTINCT city FROM student;
```

**2 Methods:**
| Method | Kaise |
|--------|-------|
| **Sorting** | Sort karo → adjacent duplicates delete karo. Optimization: sorting ke intermediate merge steps mein hi duplicates hatao |
| **Hashing** | Hash function se partition karo → duplicates same bucket mein aayenge → bucket check karke hatao |

---

### 6.2 Projection

```sql
SELECT name, dept FROM instructor;
```

Steps:
1. Har tuple pe projection karo (unwanted columns hatao)
2. Phir duplicate elimination karo (agar DISTINCT hai)

---

### 6.3 Aggregation

```sql
SELECT dept, AVG(salary) FROM instructor GROUP BY dept;
```

**Implementation**:
- Sorting ya Hashing se same group ke tuples ko saath laao
- Phir aggregate function apply karo (SUM, AVG, COUNT, etc.)

**Optimization — Partial Aggregation** 🔥:
```
Sort ke intermediate merge steps mein hi aggregate compute karo:
  → COUNT: partial counts add karo
  → SUM: partial sums add karo  
  → MIN/MAX: minimum/maximum rakh lo
  → AVG: sum aur count dono rakh lo, end mein divide
```

---

### 6.4 Set Operations (∪, ∩, −)

**Using Hashing** (most common):

**UNION (r ∪ s)**:
```
1. Dono relations ko same hash function se partition karo
2. Har partition i ke liye:
   a. r_i pe hash index banao
   b. s_i ki tuples add karo agar hash index mein already nahi hain
   c. Sab dump to result
```

**INTERSECTION (r ∩ s)**:
```
1. Same partition karo
2. Har partition i ke liye:
   a. r_i pe hash index banao
   b. s_i ki tuples output karo SIRF agar woh hash index mein pehle se hain
```

**SET DIFFERENCE (r − s)**:
```
1. Same partition karo
2. Har partition i ke liye:
   a. r_i pe hash index banao
   b. s_i ke tuples check karo — agar hash index mein hain toh DELETE karo
   c. Jo bachi hain r_i mein, woh result hain
```

---

### 6.5 Outer Join

**2 approaches:**

**Approach 1**: Normal join karo + non-matching tuples ko NULL padding ke saath add karo

**Approach 2**: Join algorithm ko modify karo:

```
Merge Join modify karke LEFT OUTER JOIN:
  → Merging ke time, agar r ka tuple t_r kisi bhi s tuple se match nahi karta,
    toh t_r ko NULL-padded output mein daalo

Hash Join modify karke LEFT OUTER JOIN:
  → Agar r PROBE relation hai: non-matching r tuples ko NULL-padded output karo
  → Agar r BUILD relation hai: probe ke time track karo kaun match hua,
    end mein non-matched r tuples NULL-padded output karo
```

---

## 7. Evaluation of Expressions — Materialization vs Pipelining ⭐ (Slides 49-57)

### Ye Concept Kya Hai?

Ek complex query mein **multiple operations** hote hain (selection → join → projection). In sab ko kaise execute karein?

```sql
SELECT name 
FROM instructor, department  
WHERE instructor.dept_name = department.dept_name 
AND building = 'Watson';
```

**Expression Tree**:
```
        Π_name           ← Step 3: Projection
           │
           ⋈              ← Step 2: Join
          / \
   σ_building='Watson'  instructor
         │
    department            ← Step 1: Selection
```

### Two Approaches:

---

### 7.1 Materialization (Store Intermediate Results) 💾

```
Step 1: σ_building='Watson'(department) → Result R1 disk pe save karo
Step 2: R1 ⋈ instructor → Result R2 disk pe save karo  
Step 3: Π_name(R2) → Final result
```

**Analogy**: Zomato order — Pehle paneer tikka banao, thanda hone do, plate mein rakho. Phir gravy banao, thanda hone do. Phir dono mix karo. **SLOW!** 🐢

**Cost**:
```
Overall Cost = Sum of costs of individual operations 
             + Cost of writing intermediate results to disk

PROBLEM: Intermediate results disk pe likhne/padhne ka extra cost! 
         Yeh bohot EXPENSIVE ho sakta hai!
```

**Double Buffering Optimization**:
```
2 output buffers use karo — jab ek full ho, use disk pe likho.
Tab tak doosre buffer mein computation continue karo.
→ Disk write aur computation OVERLAP karte hain → Faster!
```

> 📌 Materialization **HAMESHA applicable** hai — koi bhi operation pe kaam karega. Lekin SLOW hai.

---

### 7.2 Pipelining (Pass Results Directly) ⚡

```
Step 1 ka result DISK PE SAVE MAT KARO!
→ Jaise jaise tuples milein, seedha Step 2 ko pass karo
→ Step 2 ka result seedha Step 3 ko pass karo
```

**Analogy**: Restaurant ki assembly line — paneer kato, SEEDHA kadhai mein daalo, SEEDHA plate mein serve karo. Kuch store nahi karna. **FAST!** 🚀

**Why Better?**
- ❌ No temporary relations stored on disk
- ✅ Multiple operations simultaneously chalti hain
- ✅ Bohot cheaper than materialization

**Limitation**:
```
Pipelining HAMESHA possible nahi hai!
Sort aur Hash Join ke liye SAARA data chahiye before output de sakein.
Yeh "BLOCKING OPERATIONS" hain — inhe pipeline nahi kar sakte.
```

### Two Types of Pipelining:

| Type | Alias | Kaise Kaam Karta Hai |
|------|-------|---------------------|
| **Demand Driven** | Lazy / Pull Model | Top operation bottom se maangta hai: "Ek tuple do!" → Bottom apne child se: "Ek tuple do!" → Chain reaction |
| **Producer Driven** | Eager / Push Model | Bottom operation tuples banake upar push karta hai. Buffer mein daalta hai, parent buffer se uthata hai |

### Demand Driven (Pull Model) — Iterator Interface:

```
Har operation ek ITERATOR hai with 3 functions:

open()  → Initialize karo (e.g., file ka pointer starting pe rakho)
next()  → Agle tuple de do (e.g., next matching row output karo)
close() → Cleanup karo (resources free karo)

Example:
  Projection.next() → calls Join.next() → calls Selection.next() → calls FileScan.next()
  
  Chain mein har ek apne child se next() maangta hai!
```

### Producer Driven (Push Model):

```
Bottom operators tuples produce karte hain aur BUFFER mein daalte hain.
Parent operator buffer se uthata hai.
Agar buffer FULL hai → child WAIT karta hai.

System schedule karta hai kaun run karega based on buffer availability.
```

> 🔥 **EXAM TIP**: Materialization vs Pipelining ka comparison question **100% aata hai**. Key points:
> - Materialization: Always works, expensive (disk I/O for intermediate)
> - Pipelining: Cheaper, but not always possible (blocking ops like sort)
> - Demand driven = Pull = Lazy
> - Producer driven = Push = Eager

---

### 7.3 Blocking Operations & Pipeline Stages (Slides 55-56)

```
BLOCKING OPERATIONS = Jo operations SAARA input consume karke hi output de sakte hain

Examples:
  → Sorting (saara data chahiye sort karne ke liye)
  → Hash Join ke partition phase
  → Aggregation (GROUP BY mein saare groups chahiye)

KEY IDEA: Blocking operations ke 2 sub-operations hote hain:
  → Sort: Run generation (blocking) + Merge (pipelinable)
  → Hash Join: Partitioning (blocking) + Build-Probe (pipelinable)
  
Inhe SEPARATE STAGES mein treat karo!

PIPELINE STAGES:
  → Ek stage ke andar saare operations concurrently chalte hain
  → Next stage TAB HI start hoga jab previous stage COMPLETE ho
```

---

## 8. Advanced Topics (Slides 48, 57-60) 🔬

### 8.1 Answering Keyword Queries (Slide 48)

```
Google jaisa kaam: Keywords → Documents

INVERTED INDEX:
  Har keyword ke liye ek sorted list of document IDs store karo:
  
  "database"     → d1, d4, d11, d45, d77, d123
  "distributed"  → d4, d8, d11, d56, d77, d121, d333

Query: "database distributed" → 
  INTERSECTION of both lists → d4, d11, d77

Ranking ke liye extra info store karo:
  → Term Frequency (TF): keyword kitni baar aata hai document mein
  → Inverse Document Frequency (IDF): kitne documents mein yeh keyword hai
  → Page Rank: document/page ki importance
```

### 8.2 Query Processing in Memory (Slides 59-60)

```
Modern databases SAARA data memory mein rakhte hain (In-Memory DB):

Optimizations:
  → Query COMPILATION: SQL ko machine code mein compile karo (JIT compilation)
    → Interpretation overhead hata do (e.g., bar bar column location dhundhna)
  
  → Column-oriented storage: Columns ko alag store karo
    → Vector operations fast hote hain
  
  → Cache-conscious algorithms:
    → Goal: CPU cache misses minimize karo
    → Sorting: L3 cache size ke runs banao (few MB)
    → Hash Join: Partitions ko L3 cache mein fit karo
    → Related attributes ko adjacently store karo
    → Multiple threads use karo (cache miss pe doosra thread chale)
```

---

## 📊 MEGA REVISION TABLE — Sab Ek Jagah! 

| Topic | Key Formula / Point | Exam Importance |
|-------|-------------------|-----------------|
| Cost Measure | b × t_T + S × t_S | ⭐⭐ |
| Linear Search | Cost = b_r transfers, 1 seek | ⭐ |
| Primary Index Search | Cost = h_i + 1 | ⭐⭐ |
| External Sort-Merge | Passes = ⌈log_{M-1}(⌈b_r/M⌉)⌉ | ⭐⭐⭐ |
| Sort Cost (transfers) | b_r × (2×passes + 1) | ⭐⭐⭐ |
| Nested Loop Join | n_r × b_s + b_r | ⭐⭐ |
| Block NLJ | ⌈b_r/(M-2)⌉ × b_s + b_r | ⭐⭐⭐ |
| Indexed NLJ | b_r + n_r × c | ⭐⭐ |
| Merge Join | Sort both + b_r + b_s | ⭐⭐⭐ |
| Hash Join | 3(b_r + b_s) | ⭐⭐⭐ |
| Hash Join Memory Req | M > √b_s | ⭐⭐ |
| Materialization | Store intermediate to disk | ⭐⭐ |
| Pipelining | Pass tuples directly, no disk I/O | ⭐⭐⭐ |
| Demand Driven | Pull/Lazy — Iterator (open, next, close) | ⭐⭐ |
| Producer Driven | Push/Eager — Buffer between operators | ⭐⭐ |
| Blocking Operation | Sort, Hash partition — need all input first | ⭐⭐ |

---

## 🎯 PRACTICE QUESTIONS — Exam Style!

### Q1. External Sort-Merge Numerical ⭐⭐⭐

**Q**: Ek relation mein **b_r = 2048 blocks** hain aur memory mein **M = 17 blocks** available hain. External sort-merge use karke:
- (a) Kitne initial runs banenge?
- (b) Kitne merge passes lagenge?
- (c) Total block transfers ka cost batao.

**Answer**:
```
(a) Initial runs = ⌈2048/17⌉ = ⌈120.47⌉ = 121 runs

(b) Merge passes = ⌈log_{16}(121)⌉ = ⌈log(121)/log(16)⌉ = ⌈2.08/1.20⌉ = ⌈1.73⌉ = 2 passes

(c) Block transfers = 2048 × (2×2 + 1) = 2048 × 5 = 10,240 block transfers
```

---

### Q2. Join Algorithm Cost Comparison ⭐⭐⭐

**Q**: Given:
- Relation r: n_r = 2000 tuples, b_r = 50 blocks
- Relation s: n_s = 8000 tuples, b_s = 200 blocks
- Memory buffer M = 22 blocks

Calculate cost (in block transfers) for:
- (a) Nested-Loop Join (r outer)
- (b) Block Nested-Loop Join (r outer, M buffers)
- (c) Hash Join

**Answer**:
```
(a) NLJ (r outer): n_r × b_s + b_r = 2000 × 200 + 50 = 400,050 block transfers

(b) BNLJ (r outer, M=22):
    = ⌈b_r/(M-2)⌉ × b_s + b_r
    = ⌈50/20⌉ × 200 + 50
    = 3 × 200 + 50
    = 650 block transfers

(c) Hash Join:
    = 3(b_r + b_s) = 3(50 + 200) = 3 × 250 = 750 block transfers

Ranking: BNLJ (650) < Hash (750) < NLJ (400,050)
Note: Is case mein BNLJ hash se bhi sasta hai kyunki r bohot chhota hai aur M enough hai!
```

---

### Q3. Theory Question ⭐⭐

**Q**: Materialization aur Pipelining mein kya difference hai? Pipelining kab possible nahi hota?

**Answer**:
```
MATERIALIZATION:
→ Har operation ka result disk pe temporarily store karo
→ Phir agle operation mein use karo
→ Always applicable, but expensive (extra disk I/O for intermediate results)
→ Example: Selection ka result disk pe likho, phir Join padhe

PIPELINING:
→ Ek operation ka output SEEDHA doosre operation ko pass karo
→ Disk pe intermediate results store NAHI karte
→ Much cheaper — no extra disk I/O
→ Example: Selection ke tuples directly Join ko pass karo

PIPELINING POSSIBLE NAHI HOTA JAB:
→ Blocking operations ho — jinhe SAARA input chahiye output dene se pehle
→ Examples: Sorting (sort karne ke liye saare records chahiye)
            Hash Join ka partition phase
            Aggregation (GROUP BY ke liye saare groups chahiye)
            
→ But even blocking ops ke sub-parts pipeline ho sakte hain
  (e.g., Hash Join ka Build-Probe phase pipeline ho sakta hai)
```

---

### Q4. Selection Algorithm Choice ⭐⭐

**Q**: Batao kaunsa selection algorithm best hai in scenarios mein:
- (a) `WHERE id = 5` with B+ Tree primary index (height = 3)
- (b) `WHERE city = 'Delhi'` with no index, b_r = 500
- (c) `WHERE salary > 50000` with B+ Tree primary index

**Answer**:
```
(a) A2 - Primary index, equality on key
    Cost = h_i + 1 = 3 + 1 = 4 block transfers
    (B+ Tree traverse + 1 data block)

(b) A1 - Linear search (koi index nahi toh yehi option hai)
    Cost = b_r = 500 block transfers (worst case)
    Average = 250 (agar key attribute hai)

(c) A5 - Primary index, comparison
    B+ Tree mein 50000 ka entry dhundho, phir linearly aage scan karo
    Cost = h_i + number of blocks with salary > 50000
```

---

### Q5. Hash Join Deep Dive ⭐⭐⭐

**Q**: Explain:
- (a) Hash join mein build input aur probe input kya hota hai?
- (b) Recursive partitioning kab chahiye?
- (c) Hash join ka minimum memory requirement kya hai?

**Answer**:
```
(a) BUILD INPUT = Chhoti relation (s) → Jisko memory mein load karke hash table banate hain
    PROBE INPUT = Badi relation (r) → Jisko ek ek tuple padhke hash table mein match dhundhte hain
    
    Build input chhota isliye choose karte hain kyunki use MEMORY MEIN FIT hona chahiye!

(b) Recursive partitioning chahiye jab:
    n (number of partitions) > M (memory pages)
    Yeh tab hota hai jab build relation BAHUT BADI hai memory ke comparison mein
    → Solution: M-1 partitions banao → phir un partitions ko AUR partition karo 
      (different hash function se) → tab tak karo jab tak memory mein fit ho jayein

(c) Minimum Memory: M > √(b_s) (approximately)
    → b_s = build relation ki blocks
    → E.g., b_s = 400 → M > √400 = 20 blocks chahiye minimum
    → Agar M < √(b_s) → Recursive partitioning required
```

---

### Q6. Pipelining Types ⭐⭐

**Q**: Demand-driven aur Producer-driven pipelining mein kya farak hai? Iterator interface ke 3 operations kya hain?

**Answer**:
```
DEMAND-DRIVEN (Pull / Lazy):
→ Top-level operation bottom se DATA MAANGTA hai
→ System top se request bhejta hai: "Ek tuple do"
→ Har operator apne children se next tuple maangta hai
→ Between calls, operator STATE maintain karta hai
→ Iterator interface use hota hai

PRODUCER-DRIVEN (Push / Eager):
→ Bottom operators KHUD SE tuples produce karke upar PUSH karte hain
→ Operators ke beech BUFFER hota hai
→ Child buffer mein daalta hai, parent buffer se uthata hai
→ Agar buffer full → child WAIT karta hai

ITERATOR INTERFACE (3 operations):
  1. open()  → Initialization (file pointer set, sort start)
  2. next()  → Next output tuple return karo (state advance karo)
  3. close() → Resources free karo, cleanup
```

---

### Q7. Merge Join Numerical ⭐⭐⭐

**Q**: Given: r has b_r = 200 blocks, s has b_s = 600 blocks, M = 26 blocks. Calculate merge join cost.

**Answer**:
```
Step 1: Sort r
  Runs = ⌈200/26⌉ = 8 runs
  Merge passes = ⌈log_25(8)⌉ = ⌈0.646⌉ = 1 pass
  Sort cost = 200 × (2×1 + 1) = 600 block transfers

Step 2: Sort s
  Runs = ⌈600/26⌉ = 24 runs
  Merge passes = ⌈log_25(24)⌉ = ⌈0.987⌉ = 1 pass
  Sort cost = 600 × (2×1 + 1) = 1800 block transfers

Step 3: Merge
  Merge cost = b_r + b_s = 200 + 600 = 800 block transfers

TOTAL = 600 + 1800 + 800 = 3200 block transfers

(Note: Optimization possible — last sorting pass aur merge combine ho sakte hain, 
 saving b_r + b_s transfers. Optimized = 3200 - 800 = 2400)
```

---

## 🚀 LAST MINUTE EXAM CHECKLIST

```
✅ Query Processing ke 3 steps: Parse → Optimize → Execute
✅ Cost = Block transfers + Seeks (seek is MUCH costlier)
✅ External Sort-Merge: Runs = ⌈b_r/M⌉, Passes = ⌈log_{M-1}(runs)⌉
✅ Sort Cost = b_r × (2 × passes + 1) block transfers
✅ NLJ: n_r × b_s + b_r (tuple by tuple — EXPENSIVE!)
✅ BNLJ: ⌈b_r/(M-2)⌉ × b_s + b_r (block by block — MUCH BETTER)
✅ Chhoti table ko OUTER banao!
✅ Indexed NLJ: b_r + n_r × c (need index on inner relation)
✅ Merge Join: Sort both + merge = best for sorted data
✅ Hash Join: 3(b_r + b_s) — fastest for equi-joins!
✅ Hash = Partition + Build-Probe, Memory needs M > √(b_s)
✅ Materialization = Store intermediate results ← always works, expensive
✅ Pipelining = Pass directly ← cheap, but not for blocking ops (sort, hash partition)
✅ Demand-driven = Pull/Lazy, Producer-driven = Push/Eager
✅ Iterator: open(), next(), close()
✅ Blocking ops: Sort, Hash partition, Aggregation
```

---

> **🏆 ALL THE BEST FOR YOUR EXAM! Yeh guide padh liya toh Query Processing mein FULL MARKS guaranteed! Bas formulas ratt le aur numericals practice kar. Tu hai toh boss hai! 💪**
