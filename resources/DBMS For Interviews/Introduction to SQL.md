# 📖 Chapter 3: Introduction to SQL
## 🎯 Complete Mid-Sem Study Material (Book + PPT Combined)

---

## 🧠 What Will You Learn?

This is the **MOST PRACTICAL** chapter! You'll learn to actually TALK to a database:
- SQL Data Definition (CREATE, ALTER, DROP tables)
- Basic Queries (SELECT, FROM, WHERE)
- Set Operations (UNION, INTERSECT, EXCEPT)
- Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)
- Nested Subqueries (queries inside queries!)
- Database Modification (INSERT, UPDATE, DELETE)

> ⚠️ **EXAM TIP**: This chapter has the MOST marks potential! You'll be asked to write SQL queries. Practice, practice, practice!

---

## 3.1 History & Parts of SQL 📜

### Quick History
- Developed by IBM in the 1970s as "SEQUEL" (part of System R project)
- Renamed to **SQL** (Structured Query Language)
- Standardized by ANSI/ISO: SQL-86, SQL-89, SQL-92, SQL:1999, SQL:2003

### SQL Has Many Parts

| Part | What It Does | Commands |
|------|-------------|----------|
| **DDL** (Data Definition Language) | Define structure | CREATE, ALTER, DROP |
| **DML** (Data Manipulation Language) | Access & modify data | SELECT, INSERT, UPDATE, DELETE |
| **Integrity** | Define constraints | PRIMARY KEY, FOREIGN KEY, CHECK |
| **View Definition** | Create virtual tables | CREATE VIEW |
| **Transaction Control** | Manage transactions | COMMIT, ROLLBACK |
| **Authorization** | Control access | GRANT, REVOKE |

---

## 3.2 SQL Data Definition (DDL) 🏗️

### Data Types in SQL

| Type | Description | Example |
|------|-------------|---------|
| `char(n)` | Fixed-length string of exactly n characters | `char(5)` → "Hello" |
| `varchar(n)` | Variable-length string, max n characters | `varchar(20)` → "Hi" or "Hello World" |
| `int` | Integer number | 42, -7, 0 |
| `smallint` | Small integer | 255 |
| `numeric(p,d)` | Fixed-point number, p digits total, d after decimal | `numeric(8,2)` → 65000.00 |
| `real` | Floating-point number | 3.14159 |
| `float(n)` | Float with at least n digits precision | varies |

> 💡 `char(5)` stores "Hi   " (padded with spaces), while `varchar(5)` stores "Hi" (no padding)

### CREATE TABLE — Making a New Table

```sql
CREATE TABLE instructor (
    ID          char(5),
    name        varchar(20) NOT NULL,   -- name can NEVER be null
    dept_name   varchar(20),
    salary      numeric(8,2),
    PRIMARY KEY (ID),                    -- ID uniquely identifies each row
    FOREIGN KEY (dept_name) REFERENCES department  -- must exist in department table
);
```

Let me break this down in simple language:

```
What this says:
─────────────────
1. Create a table called "instructor"
2. It has 4 columns: ID, name, dept_name, salary
3. The "name" column CANNOT be empty (NOT NULL)
4. "ID" is the primary key (unique identifier)
5. "dept_name" must be a value that already exists 
   in the department table (foreign key)
```

### More CREATE TABLE Examples

```sql
-- Student table
CREATE TABLE student (
    ID          varchar(5),
    name        varchar(20) NOT NULL,
    dept_name   varchar(20),
    tot_cred    numeric(3,0),
    PRIMARY KEY (ID),
    FOREIGN KEY (dept_name) REFERENCES department
);

-- Takes table (which student takes which course)
CREATE TABLE takes (
    ID          varchar(5),
    course_id   varchar(8),
    sec_id      varchar(8),
    semester    varchar(6),
    year        numeric(4,0),
    grade       varchar(2),
    PRIMARY KEY (ID, course_id, sec_id, semester, year),  -- composite PK!
    FOREIGN KEY (ID) REFERENCES student,
    FOREIGN KEY (course_id, sec_id, semester, year) REFERENCES section
);
```

> 💡 Notice `takes` has a **composite primary key** — 5 columns together make it unique!

### Table Modifications

```sql
-- INSERT: Add a new row
INSERT INTO instructor VALUES ('10211', 'Smith', 'Biology', 66000);

-- DELETE: Remove all rows from student
DELETE FROM student;

-- DROP TABLE: Delete the entire table (structure + data)
DROP TABLE r;

-- ALTER TABLE: Add a new column
ALTER TABLE r ADD A D;   -- Add attribute A with domain D
-- All existing rows get NULL for the new column

-- ALTER TABLE: Remove a column
ALTER TABLE r DROP A;    -- Remove attribute A
```

---

## 3.3 Basic Query Structure (SELECT-FROM-WHERE) 📝

This is the **HEART** of SQL. Every query follows this pattern:

```sql
SELECT A1, A2, ..., An    -- What columns to show
FROM   r1, r2, ..., rm    -- Which tables to look in
WHERE  P;                  -- What conditions to filter by
```

### The SELECT Clause

```sql
-- Find names of all instructors
SELECT name
FROM instructor;

-- Select ALL columns (use *)
SELECT *
FROM instructor;

-- Remove duplicates with DISTINCT
SELECT DISTINCT dept_name
FROM instructor;

-- Keep all duplicates with ALL (default behavior)
SELECT ALL dept_name
FROM instructor;
```

### Arithmetic in SELECT

```sql
-- Calculate monthly salary
SELECT ID, name, salary/12
FROM instructor;

-- Give the calculated column a name using AS
SELECT ID, name, salary/12 AS monthly_salary
FROM instructor;
```

### The WHERE Clause — Filtering Rows

```sql
-- Find all CS instructors
SELECT name
FROM instructor
WHERE dept_name = 'Comp. Sci.';

-- Combine conditions with AND, OR, NOT
SELECT name
FROM instructor
WHERE dept_name = 'Comp. Sci.' AND salary > 80000;

-- Comparison operators: <, <=, >, >=, =, <> (not equal)
```

### The FROM Clause — Cartesian Product

```sql
-- Cartesian product of instructor and teaches
SELECT *
FROM instructor, teaches;
-- This creates EVERY possible pair! Usually combined with WHERE.

-- Meaningful query: Find which instructor teaches what
SELECT name, course_id
FROM instructor, teaches
WHERE instructor.ID = teaches.ID;

-- Add more conditions
SELECT name, course_id
FROM instructor, teaches
WHERE instructor.ID = teaches.ID AND instructor.dept_name = 'Art';
```

---

## 3.4 Additional Basic Operations ✨

### Rename Using AS

```sql
-- Rename a column
SELECT name AS instructor_name, salary/12 AS monthly_salary
FROM instructor;

-- Rename a table (useful for self-joins!)
SELECT DISTINCT T.name
FROM instructor AS T, instructor AS S
WHERE T.salary > S.salary AND S.dept_name = 'Comp. Sci.';
```

**What does the self-join query above do?**
- It creates TWO copies of the instructor table (T and S)
- For each instructor T, it checks if T's salary is more than some instructor S in Comp. Sci.
- It returns names of instructors earning more than at least one CS instructor

> 💡 The keyword `AS` is optional! `instructor T` is same as `instructor AS T`

### String Operations — Pattern Matching with LIKE

```sql
-- Find instructors whose name contains "dar"
SELECT name
FROM instructor
WHERE name LIKE '%dar%';
```

**Pattern characters**:
- `%` → matches ANY substring (zero or more characters)
- `_` → matches ANY single character

```
EXAMPLES:
'Intro%'     → matches "Introduction", "Intro to CS", "Intro"
'%Comp%'     → matches "Computer", "Comp. Sci.", "Decompress"
'___'        → matches any string of EXACTLY 3 characters
'___%'       → matches any string of AT LEAST 3 characters
```

**Escape characters** for matching literal % or _:
```sql
LIKE '100\%' ESCAPE '\'    -- matches the string "100%"
```

> ⚠️ **IMPORTANT**: Patterns in LIKE are **case-sensitive**!

### ORDER BY — Sorting Results

```sql
-- Sort alphabetically by name
SELECT DISTINCT name
FROM instructor
ORDER BY name;

-- Sort descending
ORDER BY name DESC;

-- Sort by multiple columns
ORDER BY dept_name, name;

-- Default is ASC (ascending)
```

### BETWEEN — Range Comparison

```sql
-- Find salaries between 90000 and 100000 (inclusive)
SELECT name
FROM instructor
WHERE salary BETWEEN 90000 AND 100000;

-- Same as:
WHERE salary >= 90000 AND salary <= 100000;
```

### Tuple Comparison

```sql
-- Compare multiple values at once
SELECT name, course_id
FROM instructor, teaches
WHERE (instructor.ID, dept_name) = (teaches.ID, 'Biology');
```

---

## 3.5 Set Operations ⊕

These work like the set operations you learned in math class!

### UNION (OR — combine both)

```sql
-- Courses offered in Fall 2017 OR Spring 2018
(SELECT course_id FROM section WHERE semester = 'Fall' AND year = 2017)
UNION
(SELECT course_id FROM section WHERE semester = 'Spring' AND year = 2018);
```

### INTERSECT (AND — in both)

```sql
-- Courses offered in Fall 2017 AND Spring 2018
(SELECT course_id FROM section WHERE semester = 'Fall' AND year = 2017)
INTERSECT
(SELECT course_id FROM section WHERE semester = 'Spring' AND year = 2018);
```

### EXCEPT (MINUS — in first but not second)

```sql
-- Courses offered in Fall 2017 but NOT in Spring 2018
(SELECT course_id FROM section WHERE semester = 'Fall' AND year = 2017)
EXCEPT
(SELECT course_id FROM section WHERE semester = 'Spring' AND year = 2018);
```

> ⚠️ **IMPORTANT**: All three operations **automatically remove duplicates!**

### Keep Duplicates? Use ALL

```sql
UNION ALL       -- keeps all duplicates
INTERSECT ALL   -- keeps duplicates (minimum count from both)
EXCEPT ALL      -- keeps duplicates (difference in counts)
```

---

## 3.6 NULL Values 🚫

NULL is a special value meaning "unknown" or "doesn't exist".

### Rules About NULL

```
Any arithmetic with NULL = NULL
   5 + NULL  →  NULL
   NULL × 0  →  NULL

Any comparison with NULL = UNKNOWN (not true, not false!)
   5 < NULL   →  UNKNOWN
   NULL = NULL →  UNKNOWN  (yes, NULL is NOT equal to NULL!)
   NULL <> NULL → UNKNOWN
```

### Three-Valued Logic (True, False, Unknown)

```
AND:
  true  AND unknown  = unknown
  false AND unknown  = false
  unknown AND unknown = unknown

OR:
  true  OR unknown  = true
  false OR unknown  = unknown
  unknown OR unknown = unknown

NOT:
  NOT unknown = unknown
```

> ⚠️ **CRITICAL**: If a WHERE clause evaluates to **unknown**, the tuple is **NOT included** in the result (treated as false)!

### Check for NULL

```sql
-- Find instructors with NULL salary
SELECT name
FROM instructor
WHERE salary IS NULL;

-- Find instructors with non-NULL salary
SELECT name
FROM instructor
WHERE salary IS NOT NULL;
```

> ❌ **NEVER write** `WHERE salary = NULL` — this gives UNKNOWN, not what you want!

---

## 3.7 Aggregate Functions 📊 (⚠️ HEAVILY TESTED!)

Aggregate functions operate on a set of values and return ONE value.

| Function | Purpose | Example |
|----------|---------|---------|
| `AVG()` | Average | `AVG(salary)` = 74833 |
| `MIN()` | Minimum | `MIN(salary)` = 40000 |
| `MAX()` | Maximum | `MAX(salary)` = 95000 |
| `SUM()` | Sum | `SUM(salary)` = 598667 |
| `COUNT()` | Count | `COUNT(*)` = 8 |

### Basic Examples

```sql
-- Average salary in CS department
SELECT AVG(salary)
FROM instructor
WHERE dept_name = 'Comp. Sci.';

-- Count distinct instructors who taught in Spring 2018
SELECT COUNT(DISTINCT ID)
FROM teaches
WHERE semester = 'Spring' AND year = 2018;

-- Count total number of courses
SELECT COUNT(*)
FROM course;
```

### GROUP BY — Aggregate Per Group

```sql
-- Average salary of instructors in EACH department
SELECT dept_name, AVG(salary) AS avg_salary
FROM instructor
GROUP BY dept_name;
```

**Result**:
```
┌────────────┬────────────┐
│ dept_name  │ avg_salary │
├────────────┼────────────┤
│ Comp. Sci. │ 77333.33   │
│ Finance    │ 85000.00   │
│ Music      │ 40000.00   │
│ Physics    │ 91000.00   │
│ Biology    │ 72000.00   │
└────────────┴────────────┘
```

> ⚠️ **GOLDEN RULE**: Every column in SELECT that is NOT inside an aggregate function MUST appear in GROUP BY!

```sql
-- ❌ WRONG! ID is not in GROUP BY or aggregate
SELECT dept_name, ID, AVG(salary)
FROM instructor
GROUP BY dept_name;

-- ✅ CORRECT
SELECT dept_name, AVG(salary)
FROM instructor
GROUP BY dept_name;
```

### HAVING — Filter Groups

```sql
-- Departments where average salary > 42000
SELECT dept_name, AVG(salary) AS avg_salary
FROM instructor
GROUP BY dept_name
HAVING AVG(salary) > 42000;
```

> 💡 **WHERE vs HAVING**:
> - `WHERE` filters **individual rows** (BEFORE grouping)
> - `HAVING` filters **groups** (AFTER grouping)

### Complete Query Execution Order

```
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
  1       2        3          4        5         6

Step 1: Get all rows from the tables
Step 2: Filter rows with WHERE
Step 3: Group remaining rows with GROUP BY
Step 4: Filter groups with HAVING
Step 5: Select the columns/expressions
Step 6: Sort the result with ORDER BY
```

---

## 3.8 Nested Subqueries 🪆 (⚠️ VERY IMPORTANT!)

A **subquery** is a query inside another query. Like Russian dolls! 🪆

Subqueries can appear in three places:
1. In the **WHERE** clause
2. In the **FROM** clause
3. In the **SELECT** clause

### 3.8.1 Set Membership — IN and NOT IN

```sql
-- Courses offered in Fall 2017 AND Spring 2018 (using IN)
SELECT DISTINCT course_id
FROM section
WHERE semester = 'Fall' AND year = 2017
  AND course_id IN (
      SELECT course_id
      FROM section
      WHERE semester = 'Spring' AND year = 2018
  );

-- Courses offered in Fall 2017 but NOT in Spring 2018
SELECT DISTINCT course_id
FROM section
WHERE semester = 'Fall' AND year = 2017
  AND course_id NOT IN (
      SELECT course_id
      FROM section
      WHERE semester = 'Spring' AND year = 2018
  );
```

**IN also works with explicit sets:**
```sql
-- Names that are neither Mozart nor Einstein
SELECT DISTINCT name
FROM instructor
WHERE name NOT IN ('Mozart', 'Einstein');
```

### 3.8.2 Set Comparison — SOME and ALL

#### > SOME means "greater than at least one"
```sql
-- Find instructors with salary greater than SOME (at least one) Biology instructor
SELECT name
FROM instructor
WHERE salary > SOME (
    SELECT salary
    FROM instructor
    WHERE dept_name = 'Biology'
);
```

**How to read this**: "Find instructors whose salary is greater than the salary of AT LEAST ONE Biology instructor"

#### > ALL means "greater than every single one"
```sql
-- Find instructors with salary greater than ALL Biology instructors
SELECT name
FROM instructor
WHERE salary > ALL (
    SELECT salary
    FROM instructor
    WHERE dept_name = 'Biology'
);
```

**How to read this**: "Find instructors whose salary is greater than the salary of EVERY Biology instructor"

#### Quick Reference:
```
= SOME  ≡  IN
≠ SOME  ≢  NOT IN  (careful! they're NOT the same!)
≠ ALL   ≡  NOT IN
= ALL   ≢  IN      (careful! they're NOT the same!)
```

### 3.8.3 Test for Empty Relations — EXISTS

```sql
-- Find courses offered in both Fall 2017 and Spring 2018
SELECT course_id
FROM section AS S
WHERE semester = 'Fall' AND year = 2017
  AND EXISTS (
      SELECT *
      FROM section AS T
      WHERE semester = 'Spring' AND year = 2018
        AND S.course_id = T.course_id   -- correlated subquery!
  );
```

**EXISTS** returns TRUE if the subquery returns at least one row.

**NOT EXISTS** returns TRUE if the subquery returns ZERO rows.

#### Famous Query: "Find all students who have taken ALL Biology courses"

```sql
SELECT DISTINCT S.ID, S.name
FROM student AS S
WHERE NOT EXISTS (
    (SELECT course_id FROM course WHERE dept_name = 'Biology')
    EXCEPT
    (SELECT T.course_id FROM takes AS T WHERE S.ID = T.ID)
);
```

**How this works (plain English)**:
1. Get ALL Biology courses
2. SUBTRACT the courses this student has taken
3. If NOTHING remains (NOT EXISTS), the student took ALL of them!

> 💡 **Math insight**: (X − Y) = ∅ means X ⊆ Y (X is a subset of Y)

### 3.8.4 Test for Duplicates — UNIQUE

```sql
-- Courses offered at most once in 2017
SELECT T.course_id
FROM course AS T
WHERE UNIQUE (
    SELECT R.course_id
    FROM section AS R
    WHERE T.course_id = R.course_id AND R.year = 2017
);
```

### 3.8.5 Subqueries in FROM Clause

```sql
-- Departments where average salary > 42000 (without HAVING!)
SELECT dept_name, avg_salary
FROM (
    SELECT dept_name, AVG(salary) AS avg_salary
    FROM instructor
    GROUP BY dept_name
)
WHERE avg_salary > 42000;
```

> 💡 This is an alternative to using HAVING — sometimes easier to read!

### 3.8.6 WITH Clause (Common Table Expressions)

```sql
-- Find department with maximum budget
WITH max_budget(value) AS (
    SELECT MAX(budget) FROM department
)
SELECT department.dept_name
FROM department, max_budget
WHERE department.budget = max_budget.value;
```

**Complex WITH example:**
```sql
-- Departments where total salary > average of all department totals
WITH dept_total(dept_name, value) AS (
    SELECT dept_name, SUM(salary)
    FROM instructor
    GROUP BY dept_name
),
dept_total_avg(value) AS (
    SELECT AVG(value) FROM dept_total
)
SELECT dept_name
FROM dept_total, dept_total_avg
WHERE dept_total.value > dept_total_avg.value;
```

### 3.8.7 Scalar Subqueries

A scalar subquery returns exactly ONE value and can be used wherever a value is expected.

```sql
-- List departments with count of instructors
SELECT dept_name,
    (SELECT COUNT(*)
     FROM instructor
     WHERE department.dept_name = instructor.dept_name) AS num_instructors
FROM department;
```

> ⚠️ If the scalar subquery returns MORE than one value, it causes a **runtime error**!

---

## 3.9 Database Modification 🔧

### DELETE — Remove Rows

```sql
-- Delete ALL instructors (table structure remains!)
DELETE FROM instructor;

-- Delete Finance department instructors
DELETE FROM instructor
WHERE dept_name = 'Finance';

-- Delete instructors in Watson building departments
DELETE FROM instructor
WHERE dept_name IN (
    SELECT dept_name
    FROM department
    WHERE building = 'Watson'
);

-- Delete instructors below average salary
DELETE FROM instructor
WHERE salary < (SELECT AVG(salary) FROM instructor);
-- Note: Average is computed FIRST, then deletions happen
```

### INSERT — Add Rows

```sql
-- Insert a specific row
INSERT INTO course
VALUES ('CS-437', 'Database Systems', 'Comp. Sci.', 4);

-- Insert with column names (order doesn't matter)
INSERT INTO course (course_id, title, dept_name, credits)
VALUES ('CS-437', 'Database Systems', 'Comp. Sci.', 4);

-- Insert with NULL value
INSERT INTO student
VALUES ('3003', 'Green', 'Finance', NULL);

-- Insert from a query result
INSERT INTO instructor
SELECT ID, name, dept_name, 18000
FROM student
WHERE dept_name = 'Music' AND tot_cred > 144;
```

> 💡 When inserting from a SELECT, the entire SELECT is evaluated FIRST, then results are inserted.

### UPDATE — Modify Existing Rows

```sql
-- Give 5% raise to ALL instructors
UPDATE instructor
SET salary = salary * 1.05;

-- Give 5% raise to those earning < 70000
UPDATE instructor
SET salary = salary * 1.05
WHERE salary < 70000;

-- Give 5% raise to instructors below average salary
UPDATE instructor
SET salary = salary * 1.05
WHERE salary < (SELECT AVG(salary) FROM instructor);
```

### CASE Statement — Conditional Updates ⭐

```sql
-- Different raises based on salary
UPDATE instructor
SET salary = CASE
    WHEN salary <= 100000 THEN salary * 1.05    -- 5% raise
    ELSE salary * 1.03                            -- 3% raise
END;
```

> 💡 CASE is like if-else in programming!

### Scalar Subqueries in Updates

```sql
-- Recompute total credits for all students
UPDATE student S
SET tot_cred = (
    SELECT SUM(credits)
    FROM takes, course
    WHERE takes.course_id = course.course_id
      AND S.ID = takes.ID
      AND takes.grade <> 'F'
      AND takes.grade IS NOT NULL
);
```

---

## 📝 SQL Cheat Sheet for Quick Revision

```sql
-- CREATE TABLE
CREATE TABLE name (col1 type1, col2 type2, PRIMARY KEY(col1), FOREIGN KEY(col2) REFERENCES other);

-- SELECT basics
SELECT col1, col2 FROM table WHERE condition ORDER BY col1 DESC;

-- DISTINCT, BETWEEN, LIKE
SELECT DISTINCT col FROM table WHERE col BETWEEN 10 AND 20;
SELECT * FROM table WHERE name LIKE '%abc%';

-- Aggregate + GROUP BY + HAVING
SELECT dept, AVG(salary) FROM instructor GROUP BY dept HAVING AVG(salary) > 50000;

-- Set operations
(query1) UNION (query2);
(query1) INTERSECT (query2);
(query1) EXCEPT (query2);

-- Subqueries
WHERE col IN (subquery);
WHERE col > SOME (subquery);
WHERE col > ALL (subquery);
WHERE EXISTS (subquery);
WHERE NOT EXISTS (subquery);

-- WITH (CTE)
WITH temp(col) AS (subquery) SELECT * FROM temp;

-- Modification
INSERT INTO table VALUES (...);
UPDATE table SET col = value WHERE condition;
DELETE FROM table WHERE condition;

-- CASE
UPDATE table SET col = CASE WHEN condition THEN value1 ELSE value2 END;
```

---

## 🎯 Most Likely Exam Questions from Chapter 3

1. Write SQL to create tables with appropriate constraints
2. Write queries using SELECT, WHERE, GROUP BY, HAVING
3. Write queries using UNION, INTERSECT, EXCEPT
4. Write queries using nested subqueries (IN, SOME, ALL, EXISTS)
5. Write UPDATE/DELETE queries with subqueries
6. Explain the difference between WHERE and HAVING
7. Write a query using the CASE statement
8. Explain how NULL values work in SQL
9. What is the difference between UNION and UNION ALL?
10. Write a query using WITH clause

---

*Previous → [Chapter 2](./MIDSEM_CH2_RELATIONAL_MODEL.md) | Next → [Chapter 4: Intermediate SQL](./MIDSEM_CH4_INTERMEDIATE_SQL.md)* 📚
