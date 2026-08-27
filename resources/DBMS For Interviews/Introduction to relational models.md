# 📖 Chapter 2: Introduction to Relational Model
## 🎯 Complete Mid-Sem Study Material (Book + PPT Combined)

---

## 🧠 What Will You Learn?

This is the **FOUNDATION** of everything. You'll learn:
- How data is organized in tables (relations)
- What are keys and why they matter
- What is relational algebra (the math behind SQL!)
- How to write relational algebra expressions

> ⚠️ **EXAM TIP**: Relational algebra is HEAVILY tested! You'll be asked to write expressions. Practice a lot!

---

## 2.1 Structure of Relational Databases 📊

### The Basic Idea

In the relational model, everything is a **table** (formally called a **relation**).

```
instructor relation (table):
┌───────┬────────────┬────────────┬────────┐
│  ID   │    name    │ dept_name  │ salary │ ← Attributes (column headers)
├───────┼────────────┼────────────┼────────┤
│ 10101 │ Srinivasan │ Comp. Sci. │ 65000  │ ← Tuple (one row)
│ 12121 │ Wu         │ Finance    │ 90000  │
│ 15151 │ Mozart     │ Music      │ 40000  │
│ 22222 │ Einstein   │ Physics    │ 95000  │
│ 45565 │ Katz       │ Comp. Sci. │ 75000  │
│ 76766 │ Crick      │ Biology    │ 72000  │
│ 83821 │ Brandt     │ Comp. Sci. │ 92000  │
│ 98345 │ Kim        │ Elec. Eng. │ 80000  │
└───────┴────────────┴────────────┴────────┘
```

### Important Vocabulary (⚠️ MUST Know!)

| Formal Term | Informal Term | Meaning |
|-------------|---------------|---------|
| **Relation** | Table | The entire table |
| **Tuple** | Row / Record | One row of data |
| **Attribute** | Column / Field | One column header |
| **Domain** | Allowed values | Set of valid values for an attribute |
| **Relation Schema** | Table structure | Name + column names (like a blueprint) |
| **Relation Instance** | Table data | The actual rows at a given time |

### Example:
```
Relation Schema:  instructor(ID, name, dept_name, salary)
                  ↑ This is like a blueprint - it tells the structure

Relation Instance: The actual 8 rows shown above
                   ↑ This is the current data - it changes over time
```

### Attributes and Domains

Every attribute has a **domain** — the set of allowed values:

```
Attribute: salary
Domain:    All positive numbers up to 99999999.99

Attribute: dept_name  
Domain:    {'Comp. Sci.', 'Finance', 'Physics', 'Music', 'Biology', ...}

Attribute: semester
Domain:    {'Fall', 'Winter', 'Spring', 'Summer'}
```

### Two Important Rules About Attributes:

1. **Attribute values must be ATOMIC (indivisible)**
   - ✅ Good: `name = "Einstein"` (single value)
   - ❌ Bad: `phone = "9876543210, 1234567890"` (multiple values in one cell!)

2. **NULL values**
   - `null` means the value is **unknown** or **doesn't exist**
   - `null` is a member of every domain
   - `null` causes complications! (we'll see later)

### Relations are UNORDERED

- The **order of tuples** doesn't matter
- The order of rows {Einstein, Wu, Srinivasan} and {Wu, Srinivasan, Einstein} represent the **same** relation
- This is because a relation is a **SET** of tuples

> 💡 **Think of it like**: A bag of marbles. It doesn't matter which marble is on top — it's the same bag!

---

## 2.2 Database Schema vs Instance 📐

### Schema = Blueprint (doesn't change often)
```
instructor(ID, name, dept_name, salary)
student(ID, name, dept_name, tot_cred)
course(course_id, title, dept_name, credits)
```

### Instance = Actual data (changes all the time)
```
At this moment: instructor table has 8 rows
Tomorrow: A new instructor joins, now 9 rows!
```

**Analogy**:
- Schema = The structure of your WhatsApp (text box, send button, etc.) → Rarely changes
- Instance = Your actual messages → Changes every minute!

---

## 2.3 Keys 🔑 (⚠️ SUPER IMPORTANT FOR EXAMS!)

Keys help us **uniquely identify** tuples in a relation. This is one of the MOST important concepts!

### Superkey
A **superkey** is a set of attributes that can uniquely identify a tuple.
x
```
For instructor table:
✅ {ID} is a superkey (each ID is unique)
✅ {ID, name} is a superkey (if ID is unique, adding name doesn't hurt)
✅ {ID, name, salary} is a superkey
❌ {name} is NOT a superkey (two instructors could have same name)
❌ {dept_name} is NOT a superkey (many instructors in same dept)
```

> 💡 **Rule**: If K is a superkey, then ANY SUPERSET of K is also a superkey.

### Candidate Key
A **candidate key** is a **MINIMAL superkey** — meaning you can't remove any attribute from it and still have a superkey.

```
{ID} → Candidate key ✅ (minimal — can't remove anything)
{ID, name} → NOT a candidate key ❌ (can remove 'name' and {ID} still works)
```

### Primary Key
The **primary key** is the candidate key that the database designer **chooses** as the main identifier.

```sql
-- ID is chosen as the primary key
CREATE TABLE instructor (
    ID char(5) PRIMARY KEY,    -- ← This is the primary key
    name varchar(20),
    dept_name varchar(20),
    salary numeric(8,2)
);
```

**Rules for Primary Keys**:
- Cannot be NULL
- Must be unique
- Usually underlined in schema diagrams: instructor(<u>ID</u>, name, dept_name, salary)

### Foreign Key
A **foreign key** is an attribute in one relation that refers to the primary key of another relation.

```
instructor(ID, name, dept_name, salary)
                      ↑
                      This dept_name MUST exist in the department table!

department(dept_name, building, budget)
           ↑
           If someone says dept_name = "Comp. Sci." in instructor,
           then "Comp. Sci." MUST exist in the department table
```

```
Terminology:
─────────────
instructor → Referencing relation (the one with the foreign key)
department → Referenced relation (the one being pointed to)
```

> ⚠️ **EXAM TIP**: You'll be asked to identify primary keys and foreign keys from schema diagrams. Practice this!

### Summary Table of Keys

| Key Type | Definition | Example |
|----------|-----------|---------|
| **Superkey** | Any set of attributes that uniquely identifies tuples | {ID}, {ID, name}, {ID, name, salary} |
| **Candidate Key** | Minimal superkey | {ID} |
| **Primary Key** | Chosen candidate key | ID (underlined in schema) |
| **Foreign Key** | Attribute referencing primary key of another relation | dept_name in instructor → department |

---

## 2.4 Schema Diagram (University Database) 🗺️

Here's the complete University Database we'll use throughout:

```
┌─────────────────┐      ┌─────────────────┐      ┌──────────────────┐
│   department    │      │   instructor    │      │     course       │
├─────────────────┤      ├─────────────────┤      ├──────────────────┤
│ dept_name (PK)  │←─────│ ID (PK)         │      │ course_id (PK)   │
│ building        │      │ name            │  ┌──→│ title            │
│ budget          │←─┐   │ dept_name (FK)──│──┘   │ dept_name (FK)───│──┐
└─────────────────┘  │   │ salary          │      │ credits          │  │
                     │   └─────────────────┘      └──────────────────┘  │
                     │                                                   │
                     │   ┌─────────────────┐      ┌──────────────────┐  │
                     │   │    student      │      │    section       │  │
                     │   ├─────────────────┤      ├──────────────────┤  │
                     └───│ ID (PK)         │      │ course_id (PK,FK)│──┘
                         │ name            │      │ sec_id (PK)      │
                         │ dept_name (FK)  │      │ semester (PK)    │
                         │ tot_cred        │      │ year (PK)        │
                         └─────────────────┘      │ building         │
                                                  │ room_number      │
                                                  │ time_slot_id     │
                                                  └──────────────────┘
```

> ⚠️ **EXAM TIP**: You may be asked to draw the schema diagram or identify keys from it.

---

## 2.5 Relational Query Languages 🔍

There are different ways to ask questions (queries) from a database:

| Language | Type | How it works |
|----------|------|-------------|
| **Relational Algebra** | Procedural | You specify WHAT + HOW |
| **Tuple Relational Calculus** | Non-procedural | You specify only WHAT |
| **Domain Relational Calculus** | Non-procedural | You specify only WHAT |

> 💡 All three are **equivalent** in computing power — anything you can express in one, you can express in the others!

**We'll focus on Relational Algebra** because it's the foundation of SQL and heavily tested in exams.

---

## 2.6 Relational Algebra 🧮 (⚠️ MOST IMPORTANT FOR EXAMS!)

Relational algebra is a set of operations that take one or two relations as input and produce a NEW relation as output.

### Six Fundamental Operations

```
┌─────────────────────────────────────────────┐
│         SIX BASIC OPERATIONS                 │
│                                              │
│  1. σ (sigma)  → Select (filter rows)       │
│  2. Π (pi)     → Project (choose columns)   │
│  3. ∪ (union)  → Union (combine two sets)   │
│  4. − (minus)  → Set Difference             │
│  5. × (cross)  → Cartesian Product          │
│  6. ρ (rho)    → Rename                     │
│                                              │
│  Additional:                                 │
│  ⋈ (bowtie)   → Join                        │
│  ∩ (cap)      → Intersection                │
└─────────────────────────────────────────────┘
```

---

### 2.6.1 SELECT Operation (σ) — Filter Rows 🔍

**What it does**: Picks out rows that satisfy a condition (predicate).

**Notation**: σ_condition(relation)

**Think of it as**: A FILTER — only rows matching the condition pass through.

#### Example 1: Find all Physics department instructors
```
σ_dept_name="Physics"(instructor)

Result:
┌───────┬──────────┬──────────┬────────┐
│  ID   │   name   │dept_name │ salary │
├───────┼──────────┼──────────┼────────┤
│ 22222 │ Einstein │ Physics  │ 95000  │
│ 33456 │ Gold     │ Physics  │ 87000  │
└───────┴──────────┴──────────┴────────┘
```

#### Example 2: Find Physics instructors with salary > 90000
```
σ_dept_name="Physics" ∧ salary>90000(instructor)

∧ means AND
∨ means OR  
¬ means NOT
```

**Comparison operators you can use**: =, ≠, >, ≥, <, ≤

#### Example 3: Compare two attributes
```
σ_dept_name=building(department)

This finds departments where the department name equals the building name!
```

> 💡 **SQL Equivalent**: σ is like the `WHERE` clause in SQL
> ```sql
> SELECT * FROM instructor WHERE dept_name = 'Physics';
> ```

---

### 2.6.2 PROJECT Operation (Π) — Choose Columns 📋

**What it does**: Picks out specific columns (and removes duplicates!).

**Notation**: Π_attribute_list(relation)

**Think of it as**: Selecting which COLUMNS you want to see.

#### Example: Show only ID, name, and salary of all instructors
```
Π_ID,name,salary(instructor)

Result:
┌───────┬────────────┬────────┐
│  ID   │    name    │ salary │
├───────┼────────────┼────────┤
│ 10101 │ Srinivasan │ 65000  │
│ 12121 │ Wu         │ 90000  │
│ 15151 │ Mozart     │ 40000  │
│ 22222 │ Einstein   │ 95000  │
│ ...   │ ...        │ ...    │
└───────┴────────────┴────────┘
```

**Important**: Π automatically **removes duplicate rows** because the result is a set!

> 💡 **SQL Equivalent**: Π is like the `SELECT column_list` in SQL
> ```sql
> SELECT ID, name, salary FROM instructor;
> ```

---

### 2.6.3 Composition of Operations 🔗

The POWER of relational algebra is that you can **combine operations**!

#### Example: Find NAMES of all Physics department instructors
```
Π_name(σ_dept_name="Physics"(instructor))
         ↑                    ↑
    Then project name   First filter Physics
```

**Step by step**:
1. σ_dept_name="Physics"(instructor) → gives us all Physics rows
2. Π_name(result_of_step_1) → picks out just the name column

**Result**: {Einstein, Gold}

> This is like nesting: the inner operation runs first, then the outer one!

---

### 2.6.4 CARTESIAN PRODUCT (×) — Combine All Possible Pairs ✖️

**What it does**: Takes every row from table A and pairs it with every row from table B.

**Notation**: r × s

#### Example: instructor × teaches

If instructor has 8 rows and teaches has 10 rows:
- Result has 8 × 10 = **80 rows**!

```
instructor × teaches produces EVERY possible combination:

instructor.ID | instructor.name | ... | teaches.ID | teaches.course_id | ...
10101         | Srinivasan      | ... | 10101      | CS-101            | ...
10101         | Srinivasan      | ... | 12121      | FIN-201           | ...
10101         | Srinivasan      | ... | 15151      | MU-199            | ...
12121         | Wu              | ... | 10101      | CS-101            | ...
...
```

**By itself, Cartesian product is NOT very useful** (too many meaningless combinations!). But combine it with SELECT...

#### Useful Combination: Find which instructor teaches what

```
σ_instructor.ID=teaches.ID(instructor × teaches)

This keeps only rows where the instructor ID matches!
```

> 💡 **SQL Equivalent**: 
> ```sql
> SELECT * FROM instructor, teaches WHERE instructor.ID = teaches.ID;
> ```

---

### 2.6.5 JOIN Operation (⋈) — The Smart Combine 🤝

**What it does**: Cartesian product + Selection in ONE step.

**Notation**: r ⋈_condition s

**Formula**: r ⋈_θ s = σ_θ(r × s)

#### Example:
```
instructor ⋈_instructor.ID=teaches.ID teaches

This is the SAME as:
σ_instructor.ID=teaches.ID(instructor × teaches)

But JOIN is cleaner and easier to write!
```

> 💡 **This is exactly what SQL JOIN does!**
> ```sql
> SELECT * FROM instructor JOIN teaches ON instructor.ID = teaches.ID;
> ```

---

### 2.6.6 UNION Operation (∪) — Combine Two Sets 🔗

**What it does**: Combines rows from two relations (removing duplicates).

**Notation**: r ∪ s

**Rules (IMPORTANT!)**:
1. Both relations must have the **same number of attributes** (same arity)
2. The attributes must have **compatible domains** (same types)

#### Example: Find all courses taught in Fall 2017 OR Spring 2018

```
Π_course_id(σ_semester="Fall" ∧ year=2017(section))
∪
Π_course_id(σ_semester="Spring" ∧ year=2018(section))
```

**Step by step**:
1. Find course IDs for Fall 2017: {CS-101, CS-347, PHY-101}
2. Find course IDs for Spring 2018: {CS-101, CS-315, FIN-201}
3. Union: {CS-101, CS-315, CS-347, FIN-201, PHY-101}

> Notice: CS-101 appears only ONCE (duplicates removed!)

---

### 2.6.7 SET INTERSECTION (∩) — Common in Both 🎯

**What it does**: Finds tuples that exist in BOTH relations.

#### Example: Courses taught in Fall 2017 AND Spring 2018

```
Π_course_id(σ_semester="Fall" ∧ year=2017(section))
∩
Π_course_id(σ_semester="Spring" ∧ year=2018(section))
```

**Result**: {CS-101} (only CS-101 appears in both semesters)

---

### 2.6.8 SET DIFFERENCE (−) — In One But Not Other ➖

**What it does**: Finds tuples in the first relation but NOT in the second.

#### Example: Courses taught in Fall 2017 but NOT in Spring 2018

```
Π_course_id(σ_semester="Fall" ∧ year=2017(section))
−
Π_course_id(σ_semester="Spring" ∧ year=2018(section))
```

**Result**: {CS-347, PHY-101}

---

### 2.6.9 RENAME Operation (ρ) — Give a New Name 🏷️

**What it does**: Renames a relation or its attributes.

**Notation**: ρ_x(E) → Renames result of expression E to x

This is useful when:
- You need to refer to the same relation twice (self-join)
- You want to give a meaningful name to a result

---

### 2.6.10 The ASSIGNMENT Operation (←) — Store Temporarily 📝

**What it does**: Saves the result of an expression to a temporary variable.

#### Example: Find all instructors in Physics AND Music
```
Physics ← σ_dept_name="Physics"(instructor)
Music ← σ_dept_name="Music"(instructor)
Result ← Physics ∪ Music
```

This is like using **variables** to break a complex query into steps!

---

## 2.7 Aggregate Functions in Relational Algebra 📊

These functions work on a set of values and return a SINGLE value:

| Function | What it does | Example |
|----------|-------------|---------|
| **avg** | Average value | avg(salary) = 70000 |
| **min** | Minimum value | min(salary) = 40000 |
| **max** | Maximum value | max(salary) = 95000 |
| **sum** | Sum of values | sum(salary) = 537000 |
| **count** | Number of values | count(ID) = 8 |

### Aggregation Notation

**Without grouping** (apply to entire table):
```
γ_avg(salary)(instructor)
→ Returns: average salary of ALL instructors
```

**With grouping** (apply per group):
```
dept_name γ_avg(salary)(instructor)
→ Returns: average salary for EACH department

Result:
┌────────────┬─────────────┐
│ dept_name  │ avg(salary)  │
├────────────┼─────────────┤
│ Comp. Sci. │ 77333       │
│ Finance    │ 85000       │
│ Music      │ 40000       │
│ Physics    │ 91000       │
└────────────┴─────────────┘
```

---

## 2.8 Equivalent Queries ⚖️

An important concept: There can be **multiple ways** to write the same query!

### Example 1: Find Physics instructors with salary > 90000

**Query 1** (single selection with AND):
```
σ_dept_name="Physics" ∧ salary>90000(instructor)
```

**Query 2** (cascaded selections):
```
σ_dept_name="Physics"(σ_salary>90000(instructor))
```

Both give the **SAME result** on any database! They are **equivalent**.

### Example 2: Find courses taught by Physics instructors

**Query 1** (select after join):
```
σ_dept_name="Physics"(instructor ⋈_instructor.ID=teaches.ID teaches)
```

**Query 2** (select before join — MORE EFFICIENT!):
```
(σ_dept_name="Physics"(instructor)) ⋈_instructor.ID=teaches.ID teaches
```

> 💡 **Query 2 is FASTER** because it first reduces the size of the instructor table, then does the join with fewer rows!

---

## 📝 Relational Algebra Cheat Sheet

| Operation | Symbol | Purpose | SQL Equivalent |
|-----------|--------|---------|---------------|
| Select | σ | Filter rows | WHERE |
| Project | Π | Choose columns | SELECT columns |
| Union | ∪ | Combine two sets | UNION |
| Intersection | ∩ | Common rows | INTERSECT |
| Set Difference | − | In first, not second | EXCEPT |
| Cartesian Product | × | All combinations | FROM a, b |
| Join | ⋈ | Smart combine | JOIN ... ON |
| Rename | ρ | Give new name | AS |
| Assignment | ← | Store temporarily | WITH (CTE) |
| Aggregation | γ | Summarize | GROUP BY + aggregate functions |

---

## 🎯 Practice Problems

### Problem 1
**Q**: Write a relational algebra expression to find the names of all instructors in Comp. Sci. with salary > 70000.

**A**: 
```
Π_name(σ_dept_name="Comp. Sci." ∧ salary>70000(instructor))
```

### Problem 2
**Q**: Find the course IDs and titles of all courses in the Comp. Sci. department with 3 credits.

**A**:
```
Π_course_id,title(σ_dept_name="Comp. Sci." ∧ credits=3(course))
```

### Problem 3
**Q**: Find the names of all instructors who teach at least one course.

**A**:
```
Π_name(instructor ⋈_instructor.ID=teaches.ID teaches)
```

### Problem 4
**Q**: Find courses offered in Fall 2017 but not in Spring 2018.

**A**:
```
Π_course_id(σ_semester="Fall" ∧ year=2017(section))
−
Π_course_id(σ_semester="Spring" ∧ year=2018(section))
```

### Problem 5
**Q**: Find the average salary of instructors in each department.

**A**:
```
dept_name γ_avg(salary)(instructor)
```

---

## 🎯 Most Likely Exam Questions from Chapter 2

1. Define: Relation, Tuple, Attribute, Domain, Schema, Instance
2. Differentiate between Superkey, Candidate Key, Primary Key, and Foreign Key with examples
3. Write relational algebra expressions (many variations!)
4. Explain the six basic operations of relational algebra
5. What is the difference between schema and instance? Give examples.
6. Why are relations unordered?
7. What is a NULL value? Why does it cause complications?
8. What are equivalent queries? Give an example.

---

*Previous Chapter → [Chapter 1](./MIDSEM_CH1_INTRODUCTION.md) | Next Chapter → [Chapter 3: Introduction to SQL](./MIDSEM_CH3_INTRO_SQL.md)* 📚
