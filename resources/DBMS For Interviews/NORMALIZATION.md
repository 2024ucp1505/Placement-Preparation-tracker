# 📘 Chapter 14: Normalization and Transitive Dependency
### (Elmasri & Navathe — As Taught by Teacher, Till 3NF)

---

## 🎯 What This Chapter Covers

This chapter teaches you **how to design good tables** so your database has NO problems. Think of it as cleaning your messy room — if you throw everything in one drawer, finding stuff becomes a nightmare!

**Topics Covered:**
1. Informal Design Guidelines (4 Rules)
2. Update Anomalies (Insert, Delete, Modify)
3. Functional Dependencies (FDs)
4. Prime & Non-Prime Attributes
5. First Normal Form (1NF)
6. Second Normal Form (2NF) — Partial Dependency
7. Third Normal Form (3NF) — Transitive Dependency
8. BCNF (Boyce-Codd Normal Form)

**Remember This Famous Line:**
> **1NF**: All attributes depend on **the key**
> **2NF**: All attributes depend on **the whole key**
> **3NF**: All attributes depend on **nothing but the key**

---

## 1️⃣ Informal Design Guidelines — 4 Golden Rules

### What Makes a "Good" Table Design?

A good design means grouping attributes to form **good relation schemas**. Here are the 4 guidelines:

### GUIDELINE 1: Clear Semantics (Easy to Understand)

💡 **KEY CONCEPT**: Each table should represent ONE entity or ONE relationship.

```
❌ BAD: Mixing different entities in one table
┌───────┬─────────┬────────┬────────────┬──────────┐
│  SSN  │ Ename   │ Salary │ Dept_name  │ Dmgr_SSN │
├───────┼─────────┼────────┼────────────┼──────────┤
│  101  │ Ravi    │ 50000  │ CS         │ 999      │
│  102  │ Priya   │ 60000  │ CS         │ 999      │ ← Dept info REPEATED!
│  103  │ Amit    │ 45000  │ IT         │ 888      │
└───────┴─────────┴────────┴────────────┴──────────┘
(Employee + Department info mixed together)

✅ GOOD: Separate tables for separate entities
EMPLOYEE(SSN, Ename, Salary, Dno)
DEPARTMENT(Dnumber, Dept_name, Dmgr_SSN)
```

> **Rule**: Don't mix attributes of EMPLOYEEs, DEPARTMENTs, and PROJECTs in same table. Use foreign keys to connect them.

---

### GUIDELINE 2: No Update Anomalies

💡 **KEY CONCEPT**: A badly designed table causes 3 types of anomalies:

#### 🔴 Update (Modification) Anomaly

```
Table: EMP_PROJ(Emp#, Proj#, Ename, Pname, No_hours)

Problem: If project P1 changes name from "Billing" → "Customer-Accounting",
we must update it for ALL 100 employees working on P1!

If we miss even ONE row → DATA INCONSISTENCY! ❌
```

#### 🔴 Insertion Anomaly

```
Table: EMP_PROJ(Emp#, Proj#, Ename, Pname, No_hours)

Problem 1: Cannot add a NEW PROJECT unless an employee is assigned to it.
   (Because Emp# is part of the key — can't be NULL!)

Problem 2: Cannot add a NEW EMPLOYEE unless they are assigned to a project.
   (Because Proj# is part of the key — can't be NULL!)
```

#### 🔴 Deletion Anomaly

```
Table: EMP_PROJ(Emp#, Proj#, Ename, Pname, No_hours)

Problem: If we DELETE the only employee on project P5,
we also LOSE ALL information about project P5!

We only wanted to remove the employee, 
but we accidentally deleted the project too! ❌
```

> **Rule**: Design schemas that do NOT suffer from insertion, deletion, or modification anomalies.

---

### GUIDELINE 3: Avoid NULL Values

```
❌ BAD: Too many NULLs
┌───────┬─────────┬────────┬──────────────┬──────────────┐
│  SSN  │ Ename   │ Salary │ Office_Phone │ Home_Phone   │
├───────┼─────────┼────────┼──────────────┼──────────────┤
│  101  │ Ravi    │ 50000  │ NULL         │ 9876543210   │
│  102  │ Priya   │ 60000  │ 011-2345678  │ NULL         │
│  103  │ Amit    │ 45000  │ NULL         │ NULL         │
└───────┴─────────┴────────┴──────────────┴──────────────┘

✅ BETTER: Put rarely-used attributes in a separate table
EMPLOYEE(SSN, Ename, Salary)
EMP_PHONES(SSN, Phone_type, Phone_number)
```

**Why are NULLs bad?**
- Waste storage space
- Cause confusion in aggregate functions (SUM, AVG, COUNT)
- Make comparisons difficult (NULL ≠ NULL in SQL!)

**3 Reasons for NULLs:**
1. Attribute **not applicable** (e.g., an intern has no office)
2. Attribute value **unknown** (might exist, but we don't know)
3. Value **exists but unavailable** (not recorded yet)

> **Rule**: Minimize NULL values. Put frequently-NULL attributes in separate tables.

---

### GUIDELINE 4: No Spurious Tuples (Lossless Join)

💡 **KEY CONCEPT**: Bad decomposition can create **fake/extra rows** when you join tables back!

```
Original:
┌───────┬─────────┬───────────┐
│  ID   │  Name   │  Street   │
├───────┼─────────┼───────────┤
│   1   │ Kumar   │ MG Road   │
│   2   │ Kumar   │ Park St   │
└───────┴─────────┴───────────┘

Decompose badly into:
Table A(ID, Name) and Table B(Name, Street)

Join back → SPURIOUS (FAKE) TUPLES APPEAR:
┌───────┬─────────┬───────────┐
│  ID   │  Name   │  Street   │
├───────┼─────────┼───────────┤
│   1   │ Kumar   │ MG Road   │ ← Real ✅
│   1   │ Kumar   │ Park St   │ ← FAKE! ❌ (ID 1 doesn't live on Park St)
│   2   │ Kumar   │ MG Road   │ ← FAKE! ❌ (ID 2 doesn't live on MG Road)
│   2   │ Kumar   │ Park St   │ ← Real ✅
└───────┴─────────┴───────────┘
```

> **Rule**: Always ensure **lossless join** — no extra/spurious tuples when joining decomposed tables.

---

## 2️⃣ Functional Dependencies (FDs)

### What is a Functional Dependency?

💡 **KEY CONCEPT**: `X → Y` means: If two rows have the **same value of X**, they **MUST** have the **same value of Y**.

```
In simple words:
    X DETERMINES Y
    "Knowing X, I can find exactly one Y"

Examples:
    SSN → Ename         (One SSN = One Name) ✅
    SSN → Salary         (One SSN = One Salary) ✅
    Dept_name → Dmgr_SSN (One department = One manager) ✅
    Ename → SSN          (NOT always! Multiple people can have same name) ❌
```

### Full vs Partial FD

| Type | Meaning | Example |
|------|---------|---------|
| **Full FD** | Removing ANY attribute from LHS breaks the FD | {SSN, Proj#} → Hours ✅ (need BOTH) |
| **Partial FD** | Can remove an attribute from LHS and FD still holds | {SSN, Proj#} → Ename ❌ (SSN alone → Ename) |

### Transitive FD

💡 **KEY CONCEPT**: `X → Y → Z` is a **transitive dependency** if Y is NOT a candidate key.

```
Example (Transitive):
    SSN → DNUMBER → DMGRSSN
    "SSN determines Department#, Department# determines Manager SSN"
    
    This is TRANSITIVE because DNUMBER is not a candidate key ❌
    
Example (NOT Transitive):
    SSN → Emp# → Salary
    
    This is NOT a problem because Emp# IS a candidate key ✅
```

---

## 3️⃣ Keys — Prime vs Non-Prime Attributes

### ⚠️ EXAM TIP: You MUST understand these terms for 2NF and 3NF!

```
Key Terms:
┌────────────────────┬──────────────────────────────────────────┐
│ Term               │ Meaning                                  │
├────────────────────┼──────────────────────────────────────────┤
│ Super Key          │ Any set of attributes that uniquely      │
│                    │ identifies rows (can have extra attrs)   │
├────────────────────┼──────────────────────────────────────────┤
│ Candidate Key      │ MINIMAL super key (remove anything and   │
│                    │ it stops being a super key)              │
├────────────────────┼──────────────────────────────────────────┤
│ Primary Key        │ One chosen candidate key (main key)      │
├────────────────────┼──────────────────────────────────────────┤
│ Secondary Key      │ Other candidate keys (not chosen as PK)  │
├────────────────────┼──────────────────────────────────────────┤
│ PRIME Attribute    │ Any attribute that is part of SOME       │
│                    │ candidate key                            │
├────────────────────┼──────────────────────────────────────────┤
│ NON-PRIME Attribute│ Any attribute that is NOT part of ANY    │
│                    │ candidate key                            │
└────────────────────┴──────────────────────────────────────────┘
```

### Example:

```
EMP(SSN, Emp#, Ename, Salary)

Candidate Keys: {SSN} and {Emp#}
Primary Key: SSN (chosen)
Secondary Key: Emp#

Prime Attributes: SSN, Emp#       (part of some candidate key)
Non-Prime Attributes: Ename, Salary  (NOT part of any candidate key)
```

---

## 4️⃣ First Normal Form (1NF)

### Definition:

💡 **KEY CONCEPT**: A relation is in **1NF** if every attribute contains only **atomic (single, indivisible)** values.

### What is NOT Allowed in 1NF:

```
❌ Composite attributes:
    Name = "Ravi Kumar" → Should be: First_name = "Ravi", Last_name = "Kumar"

❌ Multivalued attributes:
    Phone = {9876543210, 8765432109} → Should be separate rows

❌ Nested relations:
    Courses = {(CS101, A), (CS102, B)} → Should be separate table
```

### Example: Converting to 1NF

```
❌ NOT in 1NF:
DEPARTMENT table with:
┌─────────┬────────────┬───────────────────────────┐
│ Dept_No │ Dept_Name  │     Locations             │
├─────────┼────────────┼───────────────────────────┤
│    5    │ Research   │ {Bellaire, Sugarland, Houston} │ ← MULTI-VALUED!
│    4    │ Admin      │ {Stafford}                │
└─────────┴────────────┴───────────────────────────┘

✅ In 1NF (Method: Separate rows):
┌─────────┬────────────┬──────────────┐
│ Dept_No │ Dept_Name  │  Location    │
├─────────┼────────────┼──────────────┤
│    5    │ Research   │ Bellaire     │
│    5    │ Research   │ Sugarland    │ ← Redundancy, but 1NF ✅
│    5    │ Research   │ Houston      │
│    4    │ Admin      │ Stafford     │
└─────────┴────────────┴──────────────┘
New Primary Key: {Dept_No, Location}
```

> **Rule**: Most RDBMS only allow 1NF tables. Always start by ensuring 1NF!

---

## 5️⃣ Second Normal Form (2NF) — Remove Partial Dependencies

### ⚠️ EXAM TIP: 2NF is about PARTIAL dependencies!

### Definition:

💡 **KEY CONCEPT**: A relation is in **2NF** if:
1. It is in **1NF**, AND
2. Every **non-prime attribute** is **fully functionally dependent** on the **primary key** (NO partial dependency)

### What is Partial Dependency?

```
Partial Dependency = Part of the composite key → Non-prime attribute

It can ONLY happen when the primary key is COMPOSITE (more than one attribute)!
If PK is a SINGLE attribute → table is automatically in 2NF ✅
```

### Example — EMP_PROJ (NOT in 2NF):

```
EMP_PROJ(SSN, Pnumber, Hours, Ename, Pname, Plocation)

Primary Key: {SSN, Pnumber}  (COMPOSITE key)

FDs:
    {SSN, Pnumber} → Hours      ← FULL dependency ✅
    SSN → Ename                  ← PARTIAL dependency ❌ (only part of key!)
    Pnumber → Pname, Plocation   ← PARTIAL dependency ❌ (only part of key!)
```

### Fix — Decompose into 2NF:

```
Step: Remove partial dependencies into separate tables

EP1(SSN, Pnumber, Hours)          ← Full FD only ✅
    PK: {SSN, Pnumber}

EP2(SSN, Ename)                    ← Moved from partial FD ✅
    PK: SSN

EP3(Pnumber, Pname, Plocation)     ← Moved from partial FD ✅
    PK: Pnumber

All three tables are in 2NF ✅
```

### Another Example — LOTS:

```
LOTS(Property_id, County_name, Lot#, Area, Price, Tax_rate)

Candidate Keys: {Property_id} and {County_name, Lot#}

FDs:
    Property_id → County_name, Lot#, Area, Price, Tax_rate
    County_name, Lot# → Property_id, Area, Price, Tax_rate
    County_name → Tax_rate      ← PARTIAL dependency ❌
    Area → Price                 ← Transitive (handled in 3NF)

Fix for 2NF:
    LOTS1(Property_id, County_name, Lot#, Area, Price)
    LOTS2(County_name, Tax_rate)
```

---

## 6️⃣ Third Normal Form (3NF) — Remove Transitive Dependencies

### ⚠️ EXAM TIP: 3NF is the most important topic for your midsem!

### Definition:

💡 **KEY CONCEPT**: A relation is in **3NF** if:
1. It is in **2NF**, AND
2. No **non-prime attribute** is **transitively dependent** on the primary key

### What is Transitive Dependency?

```
Transitive Dependency:
    X → Y → Z
    (Key → Non-key → Non-key)

    Where:
    - X is the primary key
    - Y is a non-prime attribute (NOT a candidate key)
    - Z is a non-prime attribute

The problem: Z depends on X, but THROUGH Y (indirectly)
```

### Example — EMP_DEPT (NOT in 3NF):

```
EMP_DEPT(SSN, Ename, Bdate, Address, Dnumber, Dname, Dmgr_SSN)

Primary Key: SSN

FDs:
    SSN → Ename, Bdate, Address, Dnumber    ← Direct, OK ✅
    SSN → Dnumber → Dname, Dmgr_SSN         ← TRANSITIVE! ❌

    SSN determines Dnumber (employee's department)
    Dnumber determines Dname and Dmgr_SSN (department info)
    So Dname and Dmgr_SSN are TRANSITIVELY dependent on SSN
    through Dnumber (which is NOT a candidate key)
```

### Fix — Decompose into 3NF:

```
ED1(SSN, Ename, Bdate, Address, Dnumber)   ← Employee info ✅
    PK: SSN

ED2(Dnumber, Dname, Dmgr_SSN)               ← Department info ✅
    PK: Dnumber

Both tables are in 3NF ✅
```

### Another Example — LOTS1 (NOT in 3NF):

```
LOTS1(Property_id, County_name, Lot#, Area, Price)
(This was already in 2NF from previous step)

FDs:
    Property_id → Area → Price     ← TRANSITIVE! ❌
    (Property determines Area, Area determines Price)
    Area is NOT a candidate key

Fix for 3NF:
    LOTS1A(Property_id, County_name, Lot#, Area)
    LOTS1B(Area, Price)
```

### When Transitive Dependency is OK:

```
⚠️ IMPORTANT EXCEPTION:
    X → Y → Z is NOT a problem if Y is a CANDIDATE KEY!

Example:
    EMP(SSN, Emp#, Salary)
    SSN → Emp# → Salary

    BUT Emp# IS a candidate key! ✅
    So this transitive dependency is ALLOWED.
    The table IS in 3NF ✅
```

---

## 7️⃣ General 3NF Definition (For Multiple Candidate Keys)

### Formal Definition:

💡 **KEY CONCEPT**: A relation R is in **3NF** if for every non-trivial FD `X → A`:
- **(a)** X is a **super key** of R, OR
- **(b)** A is a **prime attribute** (member of some candidate key)

```
For every FD in the table:
    │
    ├── Is LHS a super key? → YES → 3NF OK ✅
    │
    └── Is RHS a prime attribute? → YES → 3NF OK ✅
                                  → NO → NOT in 3NF ❌
```

### Why Does Condition (a) Catch Both 2NF and 3NF Violations?

```
Condition (a): "X is a superkey" catches TWO types:

1. If a PRIME attribute (part of key) → non-prime attribute
   This is a 2NF violation (partial dependency)

2. If a NON-PRIME attribute → non-prime attribute  
   This is a 3NF violation (transitive dependency)

Both are caught because in both cases, X is NOT a super key!
```

### Alternative (Simpler) Definition:

> A relation R is in 3NF if every **non-prime attribute**:
> 1. Is **fully** functionally dependent on every key of R (2NF part)
> 2. Is **non-transitively** dependent on every key of R (3NF part)

---

## 8️⃣ BCNF (Boyce-Codd Normal Form)

### Definition:

💡 **KEY CONCEPT**: A relation R is in **BCNF** if for every non-trivial FD `X → A`:
- X **must be** a **super key** of R

```
BCNF vs 3NF:
──────────────
3NF: X is a superkey  OR  A is a prime attribute  ← 2 conditions
BCNF: X is a superkey                             ← only 1 condition (STRICTER!)

The "slip through" case:
    In 3NF, even if X is NOT a superkey, the FD is OK if A is prime.
    In BCNF, this is NOT allowed — X MUST always be a superkey!
```

### Example (In 3NF but NOT in BCNF):

```
R(A, B, C)
FDs: { AB → C,  C → B }

Candidate Keys: {A, B} and {A, C}

Check C → B:
    3NF:  Is C a superkey? NO. But is B a prime attribute? YES (in key {A,B}) → 3NF OK ✅
    BCNF: Is C a superkey? NO → BCNF VIOLATION ❌
```

### Hierarchy:

```
    1NF  ⊃  2NF  ⊃  3NF  ⊃  BCNF
    
    Every BCNF relation is in 3NF ✅
    Every 3NF relation is in 2NF ✅
    Every 2NF relation is in 1NF ✅
    
    But NOT every 3NF is in BCNF ❌
```

---

## 📊 Complete Normalization Process — Step by Step

```
START: Un-normalized Relation
    │
    ▼ Remove multi-valued and composite attributes
┌─────────────────────────────────────────┐
│  1NF: All values are ATOMIC             │
└────────────────┬────────────────────────┘
                 ▼ Remove PARTIAL dependencies
┌─────────────────────────────────────────┐
│  2NF: No partial dependency             │
│  (Non-prime fully depends on WHOLE key) │
└────────────────┬────────────────────────┘
                 ▼ Remove TRANSITIVE dependencies
┌─────────────────────────────────────────┐
│  3NF: No transitive dependency          │
│  (Non-prime depends on NOTHING BUT key) │
└────────────────┬────────────────────────┘
                 ▼ Every determinant must be a super key
┌─────────────────────────────────────────┐
│  BCNF: Every LHS of FD is a super key  │
└─────────────────────────────────────────┘
```

---

## 🔥 Full Worked Example: EMP_PROJ Normalization

### Given:

```
EMP_PROJ(SSN, Pnumber, Hours, Ename, Pname, Plocation, Dnumber, Dname, Dmgr_SSN)

Primary Key: {SSN, Pnumber}

FDs:
    SSN → Ename, Dnumber
    Dnumber → Dname, Dmgr_SSN
    Pnumber → Pname, Plocation
    {SSN, Pnumber} → Hours
```

### Step 1: Check 1NF
All values are atomic → **1NF ✅**

### Step 2: Check 2NF (Partial Dependencies)

```
Partial Dependencies (Part of key → non-prime):
    SSN → Ename, Dnumber          ❌ (SSN is only PART of key)
    Pnumber → Pname, Plocation    ❌ (Pnumber is only PART of key)

Decompose:
    EP(SSN, Pnumber, Hours)         ← Only full FDs
    EMPLOYEE(SSN, Ename, Dnumber)   ← From SSN →
    PROJECT(Pnumber, Pname, Plocation) ← From Pnumber →
```

All three are in **2NF ✅**

### Step 3: Check 3NF (Transitive Dependencies)

```
Check EMPLOYEE(SSN, Ename, Dnumber):
    SSN → Dnumber → Dname, Dmgr_SSN
    Wait! Dname, Dmgr_SSN are not in EMPLOYEE table anymore.
    SSN → Ename, Dnumber (both direct, no transitive) → 3NF ✅

But if we had kept Dname and Dmgr_SSN:
    EMPLOYEE(SSN, Ename, Dnumber, Dname, Dmgr_SSN)
    SSN → Dnumber → Dname, Dmgr_SSN  ← TRANSITIVE! ❌

    Decompose further:
        EMP(SSN, Ename, Dnumber)
        DEPT(Dnumber, Dname, Dmgr_SSN)
```

### Final Result (in 3NF):

```
EP(SSN, Pnumber, Hours)              PK: {SSN, Pnumber}
EMP(SSN, Ename, Dnumber)             PK: SSN
PROJECT(Pnumber, Pname, Plocation)   PK: Pnumber
DEPT(Dnumber, Dname, Dmgr_SSN)       PK: Dnumber

All in 3NF ✅ (and BCNF too!)
```

---

## ⚠️ Common Exam Questions

### Theory Questions:
1. State the 4 informal design guidelines for relational databases
2. Explain Insert, Delete, and Update anomalies with examples
3. Define: Functional Dependency, Full FD, Partial FD, Transitive FD
4. Differentiate between Prime and Non-Prime attributes
5. Define 1NF, 2NF, 3NF with examples
6. Why is the 3NF definition "depends on nothing but the key"?
7. What is the difference between 3NF and BCNF?
8. When can a relation be in 3NF but NOT in BCNF? Give example.

### Problem-Solving:
1. Given a table and FDs, **identify the normal form** it is in
2. Given a table, **find all partial and transitive dependencies**
3. **Normalize a table** step-by-step from 1NF to 3NF
4. Given FDs, **identify candidate keys**, prime & non-prime attributes
5. Determine if a decomposition produces **spurious tuples**

---

## 🎯 Key Points to Remember

1. ✅ **GUIDELINE 1**: One table = One entity/relationship
2. ✅ **GUIDELINE 2**: Avoid update anomalies (Insert, Delete, Modify)
3. ✅ **GUIDELINE 3**: Minimize NULL values
4. ✅ **GUIDELINE 4**: Ensure lossless join (no spurious tuples)
5. ✅ **Prime attribute** = part of some candidate key
6. ✅ **Non-prime attribute** = not part of any candidate key
7. ✅ **1NF** = All values atomic (no sets, no nested tables)
8. ✅ **2NF** = 1NF + No partial dependency (non-prime fully depends on WHOLE key)
9. ✅ **3NF** = 2NF + No transitive dependency (non-prime depends on NOTHING BUT key)
10. ✅ **BCNF** = Every determinant (LHS of FD) is a super key
11. ✅ Partial dependency only happens with **COMPOSITE keys**
12. ✅ Transitive dependency: `Key → Non-key → Non-key` (middle is NOT a candidate key)
13. ✅ If middle attribute IS a candidate key → transitive dependency is OK!
14. ✅ 1NF ⊃ 2NF ⊃ 3NF ⊃ BCNF (each stricter than the previous)

---

## 🧠 Mind Map

```
                    ┌──────────────────────────────────┐
                    │ CH 14: NORMALIZATION              │
                    │ (Elmasri & Navathe)               │
                    └──────────────┬───────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
┌───────▼───────┐         ┌────────▼────────┐        ┌───────▼────────┐
│ 4 GUIDELINES  │         │ FUNCTIONAL      │        │ NORMAL FORMS   │
├───────────────┤         │ DEPENDENCIES    │        ├────────────────┤
│1. Clear       │         ├─────────────────┤        │                │
│   Semantics   │         │• X → Y          │        │ 1NF: Atomic    │
│2. No Update   │         │  (X determines Y│        │      ↓         │
│   Anomalies   │         │• Full FD: need  │        │ 2NF: No partial│
│   • Insert    │         │  ALL of LHS     │        │      deps      │
│   • Delete    │         │• Partial FD:    │        │      ↓         │
│   • Modify    │         │  part of key→   │        │ 3NF: No trans- │
│3. Min NULLs   │         │  non-prime      │        │      itive deps│
│4. Lossless    │         │• Transitive FD: │        │      ↓         │
│   Join        │         │  Key→Non-key→   │        │ BCNF: Every    │
│               │         │  Non-key        │        │  LHS=superkey  │
└───────────────┘         └─────────────────┘        └────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
             ┌──────▼──────┐ ┌────▼────┐  ┌──────▼──────┐
             │ PRIME       │ │ SUPER   │  │ CANDIDATE   │
             │ ATTRIBUTE   │ │ KEY     │  │ KEY         │
             ├─────────────┤ ├─────────┤  ├─────────────┤
             │ Part of     │ │ Any set │  │ Minimal     │
             │ SOME        │ │ that    │  │ super key   │
             │ candidate   │ │ uniquely│  │ (remove any │
             │ key         │ │ ID rows │  │ attr → not  │
             └─────────────┘ └─────────┘  │ super key)  │
                                          └─────────────┘
```

---

> 📝 **Note**: Your teacher covers till 3NF from this chapter. For BCNF decomposition algorithms, closure, canonical cover, and 4NF — refer to the companion file `MIDSEM_CH7_NORMALIZATION.md` (from the Silberschatz textbook).

---

## 🔥 PYQ-STYLE PRACTICE PROBLEMS (Exam Pattern: 4 × 3 = 12 Marks)

> 📌 **From PYQ Analysis**: Question 4 carries 12 marks with 4 sub-questions. Below are SOLVED problems covering every type asked.

---

### 📝 PROBLEM 1: Lossless Decomposition Test (PYQ Q4a — 3 Marks)

**Question**: Decompose R = (A, B, C, D, E) into R₁(A,B,C) and R₂(A,D,E). FDs: `A→BC, CD→E, B→D, E→A`. Is it lossless?

**Solution**:
```
R₁ ∩ R₂ = {A}

Compute (A)⁺:
  Start: {A}
  A→BC → {A,B,C}
  B→D  → {A,B,C,D}
  CD→E → {A,B,C,D,E} = R

A⁺ ⊇ R₁ = {A,B,C} → A → R₁ ✅
∴ R₁ ∩ R₂ is a superkey of R₁ → LOSSLESS ✅
```

---

### 📝 PROBLEM 2: Compute Closure & Candidate Keys (PYQ Q4b — 3 Marks)

**Question**: R = (A,B,C,D,E), FDs: `A→BC, CD→E, B→D, E→A`. Find candidate keys and normal form.

**Solution**:
```
(A)⁺: {A}→{A,B,C}→{A,B,C,D}→{A,B,C,D,E} = R ✅ → Candidate Key
(B)⁺: {B}→{B,D} ≠ R ❌
(C)⁺: {C} ≠ R ❌
(D)⁺: {D} ≠ R ❌
(E)⁺: {E}→{E,A}→{E,A,B,C}→{E,A,B,C,D} = R ✅ → Candidate Key

Candidate Keys: {A}, {E}
Prime: A, E | Non-Prime: B, C, D

Normal Form Check:
  2NF: Single-attribute keys → no partial deps → 2NF ✅
  3NF: B→D: B is not superkey, D is not prime → ❌ VIOLATION
  ∴ In 2NF but NOT in 3NF (B→D is transitive: A→B→D)
```

---

### 📝 PROBLEM 3: Normalize Table to 3NF (PYQ Q4c — 3 Marks)

**Question**: Normalize this university enrollment table to 3NF:

| StudentID | StudentName | CourseID | CourseName | Instructor | InstructorPhone | Department |
|-----------|-------------|----------|------------|------------|-----------------|------------|
| 101 | Alice | CS101 | Database | Dr. Smith | 9876543210 | CS |
| 101 | Alice | CS102 | Algorithms | Dr. Johnson | 9876512345 | CS |
| 102 | Bob | CS101 | Database | Dr. Smith | 9876543210 | CS |
| 103 | Charlie | MA201 | Calculus | Dr. Lee | 9876598765 | Math |

**Solution**:
```
FDs: StudentID → StudentName
     CourseID → CourseName, Instructor, Department
     Instructor → InstructorPhone
     {StudentID, CourseID} → ALL

Candidate Key: {StudentID, CourseID}
Prime: StudentID, CourseID
Non-Prime: StudentName, CourseName, Instructor, InstructorPhone, Department

NOT in 2NF: StudentID → StudentName (PARTIAL ❌)
            CourseID → CourseName... (PARTIAL ❌)
NOT in 3NF: CourseID → Instructor → InstructorPhone (TRANSITIVE ❌)

DECOMPOSE TO 3NF:
  Student(StudentID, StudentName)               PK: StudentID
  Course(CourseID, CourseName, Instructor, Dept) PK: CourseID
  InstructorInfo(Instructor, InstructorPhone)    PK: Instructor
  Enrollment(StudentID, CourseID)                PK: {StudentID, CourseID}

All in 3NF ✅
```

---

### 📝 PROBLEM 4: Different Closure Problem (Practice)

**Question**: R = (A,B,C,D), FDs: `A→B, B→C, C→D, D→A`. Find candidate keys.

**Solution**:
```
(A)⁺ = {A}→{A,B}→{A,B,C}→{A,B,C,D} = R ✅
(B)⁺ = {B}→{B,C}→{B,C,D}→{A,B,C,D} = R ✅
(C)⁺ = {C}→{C,D}→{A,C,D}→{A,B,C,D} = R ✅
(D)⁺ = {D}→{A,D}→{A,B,D}→{A,B,C,D} = R ✅

ALL single attributes are candidate keys!
All attributes are PRIME → 3NF ✅ and BCNF ✅
```

---

### 📝 PROBLEM 5: Lossless Decomposition — Failure Case

**Question**: R = (A,B,C), FDs: `A→B`. Decompose into R₁(A,C) and R₂(B,C). Is it lossless?

**Solution**:
```
R₁ ∩ R₂ = {C}
(C)⁺ = {C} (no FD has C on LHS)
C is NOT a superkey of R₁ or R₂ → LOSSY ❌

Correct decomposition: R₁(A,B) and R₂(A,C)
R₁ ∩ R₂ = {A}, (A)⁺ = {A,B} ⊇ R₁ → LOSSLESS ✅
```

---

### 📝 PROBLEM 6: Full EMP_PROJ Normalization (Practice)

**Question**: R(Emp#, Proj#, Ename, Pname, Hours, Dnumber, Dname, Dmgr_SSN) with:
`Emp#→Ename,Dnumber | Dnumber→Dname,Dmgr_SSN | Proj#→Pname | {Emp#,Proj#}→Hours`

**Solution**:
```
CK: {Emp#, Proj#}
Partial deps: Emp#→Ename,Dnumber  and  Proj#→Pname → NOT in 2NF
Transitive: Emp#→Dnumber→Dname,Dmgr_SSN → NOT in 3NF

FINAL 3NF:
  EP(Emp#, Proj#, Hours)              PK: {Emp#, Proj#}
  Employee(Emp#, Ename, Dnumber)      PK: Emp#
  Project(Proj#, Pname)               PK: Proj#
  Department(Dnumber, Dname, Dmgr_SSN) PK: Dnumber
```

---

### ⚡ Quick Exam Checklist for Normalization
```
1. List all FDs
2. Find candidate key(s) using closure
3. Mark prime / non-prime attributes
4. Check 2NF: partial deps? (only with composite keys!)
5. Check 3NF: transitive deps? (Key→Non-key→Non-key)
6. Decompose step by step
7. State PK and normal form of each result

FOR LOSSLESS TEST:
1. Find R₁ ∩ R₂
2. Compute closure of R₁ ∩ R₂
3. If closure ⊇ R₁ or R₂ → LOSSLESS ✅
```

