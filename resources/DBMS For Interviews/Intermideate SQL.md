# 📖 Chapter 4: Intermediate SQL
## 🎯 Complete Mid-Sem Study Material (Book + PPT Combined)

---

## 🧠 What Will You Learn?

This chapter takes your SQL skills to the NEXT LEVEL:
- **Join Expressions** (Natural, Inner, Outer — LEFT, RIGHT, FULL)
- **Views** (Virtual tables)
- **Transactions** (Basic concepts)
- **Integrity Constraints** (NOT NULL, UNIQUE, CHECK, Foreign Keys)
- **SQL Data Types** (Date, Time, LOB, User-defined)
- **Indexes** (Speed up queries)
- **Authorization** (GRANT, REVOKE)

> ⚠️ **EXAM TIP**: JOINs and Views are the MOST asked topics from this chapter!

---

## 4.1 JOIN Expressions 🤝 (⚠️ SUPER IMPORTANT!)

Joins are how we **combine data from multiple tables**. This is one of the most important SQL concepts!

### Types of Joins — Overview

```
┌───────────────────────────────────────────────────── ┐
│                   JOIN TYPES                         │
│                                                      │
│  By CONDITION:                                       │
│  ├── Natural Join (auto-match same-name columns)     │
│  ├── Join ... ON (you specify the condition)         │
│  └── Join ... USING (you specify which columns)      │
│                                                      │
│  By TYPE:                                            │
│  ├── Inner Join (only matching rows)                 │
│  ├── Left Outer Join (all from LEFT + matching)      │
│  ├── Right Outer Join (all from RIGHT + matching)    │
│  └── Full Outer Join (all from BOTH)                 │
└───────────────────────────────────────────────────── ┘
```

### 4.1.1 Natural Join

**What it does**: Automatically matches rows where ALL identically-named columns have the same values. Keeps only ONE copy of the common columns.

```sql
-- Old way (without natural join)
SELECT name, course_id
FROM student, takes
WHERE student.ID = takes.ID;

-- Natural join way (shorter!)
SELECT name, course_id
FROM student NATURAL JOIN takes;
```

**Both give the same result!** Natural join automatically matches on the `ID` column.

You can chain natural joins:
```sql
SELECT A1, A2, ...
FROM r1 NATURAL JOIN r2 NATURAL JOIN r3
WHERE condition;
```

### ⚠️ DANGER with Natural Join!

Natural join matches on ALL common column names — sometimes this causes **unexpected results**!

```sql
-- ❌ WRONG: This query gives incorrect results!
SELECT name, title
FROM student NATURAL JOIN takes NATURAL JOIN course;

-- WHY? Because student and course BOTH have dept_name!
-- It matches on BOTH ID and dept_name
-- So students who took courses in OTHER departments are excluded!

-- ✅ CORRECT way:
SELECT name, title
FROM student NATURAL JOIN takes, course
WHERE takes.course_id = course.course_id;
```

> 💡 **Lesson**: Be careful with natural join! When in doubt, use explicit JOIN ... ON.

### 4.1.2 Outer Joins (⚠️ VERY IMPORTANT FOR EXAMS!)

Regular (inner) join **loses information** — rows that don't match are dropped. Outer joins **keep** those unmatched rows by filling with NULLs.

Let's use these example tables:

```
course table:                  prereq table:
┌───────────┬──────────┐      ┌───────────┬───────────┐
│ course_id │ title    │      │ course_id │ prereq_id │
├───────────┼──────────┤      ├───────────┼───────────┤
│ BIO-301   │ Genetics │      │ BIO-301   │ BIO-101   │
│ CS-190    │ Game Des.│      │ CS-190    │ CS-101    │
│ CS-315    │ Robotics │      │ CS-347    │ CS-101    │
└───────────┘──────────┘      └───────────┴───────────┘

Notice: CS-315 has NO prerequisite (missing from prereq)
        CS-347 has a prereq but is NOT in the course table
```

### LEFT OUTER JOIN — Keep ALL from LEFT table

```sql
course NATURAL LEFT OUTER JOIN prereq
```

```
Result:
┌───────────┬──────────┬───────────┐
│ course_id │ title    │ prereq_id │
├───────────┼──────────┼───────────┤
│ BIO-301   │ Genetics │ BIO-101   │  ← matched
│ CS-190    │ Game Des.│ CS-101    │  ← matched
│ CS-315    │ Robotics │ NULL      │  ← from LEFT, no match → NULL
└───────────┴──────────┴───────────┘
```

> CS-315 is **kept** even though it has no prerequisite! prereq_id is filled with NULL.

### RIGHT OUTER JOIN — Keep ALL from RIGHT table

```sql
course NATURAL RIGHT OUTER JOIN prereq
```

```
Result:
┌───────────┬──────────┬───────────┐
│ course_id │ title    │ prereq_id │
├───────────┼──────────┼───────────┤
│ BIO-301   │ Genetics │ BIO-101   │  ← matched
│ CS-190    │ Game Des.│ CS-101    │  ← matched
│ CS-347    │ NULL     │ CS-101    │  ← from RIGHT, no match → NULL
└───────────┴──────────┴───────────┘
```

> CS-347 is **kept** even though it's not in the course table! title is filled with NULL.

### FULL OUTER JOIN — Keep ALL from BOTH tables

```sql
course NATURAL FULL OUTER JOIN prereq
```

```
Result:
┌───────────┬──────────┬───────────┐
│ course_id │ title    │ prereq_id │
├───────────┼──────────┼───────────┤
│ BIO-301   │ Genetics │ BIO-101   │  ← matched
│ CS-190    │ Game Des.│ CS-101    │  ← matched
│ CS-315    │ Robotics │ NULL      │  ← only in LEFT
│ CS-347    │ NULL     │ CS-101    │  ← only in RIGHT
└───────────┴──────────┴───────────┘
```

### Visual Summary of Joins 🎨

```
         LEFT TABLE              RIGHT TABLE
        ┌─────────┐             ┌─────────┐
        │    A    ┌┼─────────────┼┐   B    │
        │         ││  A ∩ B      ││        │
        │         └┼─────────────┼┘        │
        └─────────┘             └─────────┘

INNER JOIN:       Only A ∩ B (intersection)
LEFT OUTER:       A + (A ∩ B)  [all of left]
RIGHT OUTER:      (A ∩ B) + B  [all of right]  
FULL OUTER:       A + (A ∩ B) + B  [everything]
```

### JOIN ... ON vs Natural Join

```sql
-- JOIN ON: You specify the condition explicitly
course INNER JOIN prereq ON course.course_id = prereq.course_id

-- Difference: ON keeps BOTH columns, natural join keeps only one
-- ON result has: course.course_id AND prereq.course_id
-- Natural join has: only one course_id column
```

### JOIN ... USING

```sql
-- USING: Like natural join but you choose WHICH columns to match
course FULL OUTER JOIN prereq USING (course_id)
```

---

## 4.2 Views 👁️ (⚠️ IMPORTANT FOR EXAMS!)

### What is a View?

A **view** is a "virtual table" — it doesn't store data, but saves a query that runs whenever you use it.

**Why use views?**
1. **Security**: Hide sensitive data (like salary) from some users
2. **Simplicity**: Complex queries become simple table names
3. **Customization**: Different users see different "versions" of data

### Creating Views

```sql
-- Syntax
CREATE VIEW view_name AS
    <query expression>;

-- Example 1: View WITHOUT salary
CREATE VIEW faculty AS
    SELECT ID, name, dept_name
    FROM instructor;

-- Now you can query it like a regular table!
SELECT name
FROM faculty
WHERE dept_name = 'Biology';
```

```sql
-- Example 2: View with aggregation
CREATE VIEW departments_total_salary(dept_name, total_salary) AS
    SELECT dept_name, SUM(salary)
    FROM instructor
    GROUP BY dept_name;
```

### Views Defined Using Other Views

You can build views on top of other views!

```sql
-- View 1: Physics courses in Fall 2017
CREATE VIEW physics_fall_2017 AS
    SELECT course.course_id, sec_id, building, room_number
    FROM course, section
    WHERE course.course_id = section.course_id
      AND course.dept_name = 'Physics'
      AND section.semester = 'Fall'
      AND section.year = '2017';

-- View 2: Built on top of View 1!
CREATE VIEW physics_fall_2017_watson AS
    SELECT course_id, room_number
    FROM physics_fall_2017
    WHERE building = 'Watson';
```

### View Expansion

When you query a view, the database **replaces** the view name with its definition:

```sql
-- When you write:
SELECT * FROM physics_fall_2017_watson;

-- Database internally expands it to:
SELECT course_id, room_number
FROM (SELECT course.course_id, building, room_number
      FROM course, section
      WHERE course.course_id = section.course_id
        AND course.dept_name = 'Physics'
        AND section.semester = 'Fall'
        AND section.year = '2017')
WHERE building = 'Watson';
```

### Materialized Views

- Normal view: Only saves the query, runs it every time
- **Materialized view**: Actually stores the result physically!

```
Advantage: Faster (pre-computed results)
Disadvantage: Needs updating when base tables change (maintenance overhead)
```

### Can You UPDATE a View?

**It depends!** Updates on views are allowed only for **simple views**:

✅ **Updatable** if:
- FROM has only ONE table
- SELECT has NO expressions, aggregates, or DISTINCT
- No GROUP BY or HAVING
- Attributes not in SELECT can be set to NULL

❌ **NOT updatable** if view involves:
- Multiple tables (JOINs)
- Aggregate functions
- GROUP BY
- DISTINCT

####  Example of view update problem:
```sql
CREATE VIEW history_instructors AS
    SELECT * FROM instructor WHERE dept_name = 'History';

-- What happens if we insert this?
INSERT INTO history_instructors VALUES ('25566', 'Brown', 'Biology', 100000);
-- 😱 This is a Biology instructor inserted into history_instructors!
-- The row goes into the instructor table but disappears from the view!
```

---

## 4.3 Transactions 💰

### What is a Transaction?

A **transaction** = A sequence of SQL statements that acts as ONE unit of work.

```
Transaction: Transfer ₹500 from A to B
    1. UPDATE accounts SET balance = balance - 500 WHERE name = 'A';
    2. UPDATE accounts SET balance = balance + 500 WHERE name = 'B';
    
    Both must succeed, or both must fail!
```

### Transaction Endings

```sql
COMMIT WORK;    -- Make all changes permanent ✅
ROLLBACK WORK;  -- Undo all changes ❌
```

### Key Properties
- **Atomic**: All or nothing
- **Isolated**: Concurrent transactions don't interfere

> 💡 A transaction begins implicitly when an SQL statement executes.

---

## 4.4 Integrity Constraints 🛡️

Integrity constraints ensure data stays **valid and consistent**.

### 4.4.1 NOT NULL

```sql
name varchar(20) NOT NULL    -- name CANNOT be NULL
budget numeric(12,2) NOT NULL
```

### 4.4.2 UNIQUE

```sql
UNIQUE(A1, A2, ..., Am)
-- These attributes form a CANDIDATE KEY
-- Unlike PRIMARY KEY, UNIQUE allows NULLs!
```

### 4.4.3 CHECK Clause

```sql
-- Ensure semester is one of four valid values
CREATE TABLE section (
    course_id varchar(8),
    sec_id varchar(8),
    semester varchar(6),
    year numeric(4,0),
    ...
    CHECK (semester IN ('Fall', 'Winter', 'Spring', 'Summer'))
);
```

### 4.4.4 Referential Integrity (Foreign Keys)

```sql
FOREIGN KEY (dept_name) REFERENCES department
```

#### What Happens When Referenced Row is Deleted?

```sql
-- CASCADE: Delete the referencing rows too
FOREIGN KEY (dept_name) REFERENCES department
    ON DELETE CASCADE
    ON UPDATE CASCADE

-- SET NULL: Set the foreign key to NULL
    ON DELETE SET NULL

-- SET DEFAULT: Set to a default value
    ON DELETE SET DEFAULT
```

**Example with CASCADE**:
```
If we DELETE the 'Physics' department:
  → All instructors with dept_name='Physics' are ALSO deleted!
  → All courses with dept_name='Physics' are ALSO deleted!
```

### 4.4.5 Constraint Violation During Transactions

Sometimes you need to insert related data — how to handle circular references?

```sql
CREATE TABLE person (
    ID char(10),
    name char(40),
    mother char(10),
    father char(10),
    PRIMARY KEY (ID),
    FOREIGN KEY (father) REFERENCES person,
    FOREIGN KEY (mother) REFERENCES person
);

-- Solutions:
-- 1. Insert parents first, then children
-- 2. Set father/mother to NULL initially, update later
-- 3. Use DEFERRABLE constraints
```

### 4.4.6 Assertions

```sql
-- A condition that must ALWAYS be true for the entire database
CREATE ASSERTION <name> CHECK (<predicate>);

-- Example: "An instructor cannot teach in two classrooms 
-- in the same semester at the same time slot"
```

> 💡 Assertions are rarely supported by actual databases — they're mainly theoretical.

---

## 4.5 SQL Data Types 📋

### Built-in Types

```sql
date '2005-07-27'                    -- Year-Month-Day
time '09:00:30'                      -- Hours:Minutes:Seconds
timestamp '2005-07-27 09:00:30.75'   -- Date + Time
interval '1' day                     -- Period of time
```

### Large-Object Types

```sql
blob    -- Binary Large Object (photos, videos, etc.)
clob    -- Character Large Object (large text documents)
```

> When you query a large object, you get a **pointer** to it, not the actual object!

### User-Defined Types

```sql
-- Create a custom type
CREATE TYPE Dollars AS numeric(12,2) FINAL;

-- Use it in a table
CREATE TABLE department (
    dept_name varchar(20),
    building varchar(15),
    budget Dollars          -- Using custom type!
);
```

### Domains (similar to types but with constraints)

```sql
CREATE DOMAIN person_name char(20) NOT NULL;

CREATE DOMAIN degree_level varchar(10)
    CONSTRAINT degree_level_test
    CHECK (value IN ('Bachelors', 'Masters', 'Doctorate'));
```

---

## 4.6 Indexes 🔍

### What is an Index?

An **index** is like the index at the back of a textbook — it helps you find data FAST without reading every page!

```sql
-- Without index: Database scans ALL rows (slow!)
-- With index: Database jumps directly to the right row (fast!)

-- Create an index
CREATE INDEX studentID_index ON student(ID);

-- Now this query is FAST:
SELECT *
FROM student
WHERE ID = '12345';
-- Instead of checking all rows, the database uses the index!
```

> 💡 Indexes speed up SELECT but slow down INSERT/UPDATE/DELETE (because the index must also be updated)

---

## 4.7 Authorization 🔐

### Types of Privileges

| Privilege | What It Allows |
|-----------|---------------|
| **SELECT** | Read data |
| **INSERT** | Add new rows |
| **UPDATE** | Modify existing rows |
| **DELETE** | Remove rows |

### Schema-Level Privileges

| Privilege | What It Allows |
|-----------|---------------|
| **INDEX** | Create/delete indexes |
| **RESOURCES** | Create new tables |
| **ALTERATION** | Add/remove table columns |
| **DROP** | Delete tables |

### GRANT — Give Permissions

```sql
-- Syntax
GRANT <privilege list> ON <relation or view> TO <user list>;

-- Examples
GRANT SELECT ON department TO Amit, Satoshi;
GRANT SELECT ON instructor TO U1, U2, U3;
GRANT ALL PRIVILEGES ON student TO admin;
```

### REVOKE — Remove Permissions

```sql
-- Syntax
REVOKE <privilege list> ON <relation or view> FROM <user list>;

-- Example
REVOKE SELECT ON student FROM U1, U2, U3;
```

### Roles — Group Permissions

```sql
-- Create a role
CREATE ROLE instructor;

-- Grant role to users
GRANT instructor TO Amit;

-- Grant privileges to the role
GRANT SELECT ON takes TO instructor;

-- Roles can be given to other roles!
CREATE ROLE teaching_assistant;
GRANT teaching_assistant TO instructor;
-- Now instructor inherits all of teaching_assistant's privileges!

-- Chain of roles
CREATE ROLE dean;
GRANT instructor TO dean;
GRANT dean TO Satoshi;
-- Satoshi has dean → instructor → teaching_assistant privileges!
```

### Authorization on Views

```sql
-- Create a restricted view
CREATE VIEW geo_instructor AS
    SELECT * FROM instructor WHERE dept_name = 'Geology';

-- Grant access to the VIEW (not the base table!)
GRANT SELECT ON geo_instructor TO geo_staff;
-- geo_staff can see Geology instructors but NOT other instructors!
```

### Grant Option and Cascading

```sql
-- Allow user to pass on their privilege to others
GRANT SELECT ON department TO Amit WITH GRANT OPTION;

-- Revoking with cascade (removes from everyone who got it from this user)
REVOKE SELECT ON department FROM Amit, Satoshi CASCADE;

-- Revoking with restrict (fails if others depend on this privilege)
REVOKE SELECT ON department FROM Amit, Satoshi RESTRICT;
```

---

## 📝 Chapter 4 Quick Revision Table

| Concept | Key Points |
|---------|------------|
| **Natural Join** | Auto-matches same-name columns, removes duplicates |
| **Inner Join** | Only matching rows from both tables |
| **Left Outer Join** | ALL from left + matching from right (NULL for no match) |
| **Right Outer Join** | Matching from left + ALL from right |
| **Full Outer Join** | ALL from both tables |
| **View** | Virtual table, stores a query, not data |
| **Materialized View** | View that physically stores computed data |
| **Transaction** | Unit of work: COMMIT or ROLLBACK |
| **NOT NULL** | Column cannot be NULL |
| **UNIQUE** | Column(s) must have unique values (allows NULL) |
| **CHECK** | Custom validation rule |
| **Foreign Key** | References primary key of another table |
| **CASCADE** | Automatically propagate delete/update |
| **Index** | Data structure for fast lookups |
| **GRANT** | Give privileges |
| **REVOKE** | Remove privileges |
| **Role** | Group of privileges assigned to users |

---

## 🎯 Most Likely Exam Questions

1. Explain LEFT, RIGHT, and FULL OUTER JOIN with examples
2. What is the difference between INNER JOIN and NATURAL JOIN?
3. Create a view and write queries using it
4. Can views be updated? Under what conditions?
5. What are integrity constraints? List different types
6. Write SQL with foreign key constraints including CASCADE
7. What is the difference between UNIQUE and PRIMARY KEY?
8. Explain GRANT and REVOKE with examples
9. What are roles in SQL? How do they help?
10. What is a materialized view? How is it different from a regular view?

---

*Previous → [Chapter 3](./MIDSEM_CH3_INTRO_SQL.md) | Next → [Chapter 5: Advanced SQL](./MIDSEM_CH5_ADVANCED_SQL.md)* 📚
