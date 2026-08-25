# 📖 Chapter 5: Advanced SQL
## 🎯 Complete Mid-Sem Study Material (Book + PPT Combined)

---

## 🧠 What Will You Learn?

This chapter covers the "expert" level SQL topics:
- **Accessing SQL from Programming Languages** (JDBC, ODBC, Embedded SQL)
- **Functions and Procedures** (Like functions in any programming language!)
- **Triggers** (Automatic actions when data changes)
- **Recursive Queries** (Querying hierarchical data)
- **Advanced Aggregation** (Ranking, Windowing, OLAP)

> ⚠️ **EXAM TIP**: Functions/Procedures, Triggers, and Recursive Queries are the most commonly asked topics from this chapter!

---

## 5.1 Accessing SQL from a Programming Language 💻

### Why Do We Need This?

Two main reasons:
1. **SQL can't do everything** — You can't print reports, show GUIs, or do complex calculations in pure SQL
2. **Non-declarative actions** — like interacting with users, sending emails, etc. need a programming language

### Ways to Access SQL from Programs

| Method | Description | Example |
|--------|-------------|---------|
| **JDBC** | Java API for database access | Java applications |
| **ODBC** | Standard API (works with many languages) | C, C++, Python, etc. |
| **Embedded SQL** | SQL statements inside host language code | COBOL, C, Java |

---

### 5.1.1 JDBC (Java Database Connectivity)

JDBC is how Java programs talk to databases.

**Steps to use JDBC:**

```
Step 1: Open a connection to the database
Step 2: Create a Statement object
Step 3: Execute queries and get results
Step 4: Handle errors (exceptions)
Step 5: Close the connection
```

#### Basic JDBC Code:

```java
public static void JDBCexample(String dbid, String userid, String passwd) {
    try (
        // Step 1: Connect to database
        Connection conn = DriverManager.getConnection(
            "jdbc:oracle:thin:@db.yale.edu:2000:univdb", userid, passwd);
        
        // Step 2: Create statement
        Statement stmt = conn.createStatement();
    ) {
        // Step 3: Execute query
        ResultSet rset = stmt.executeQuery(
            "SELECT dept_name, AVG(salary) FROM instructor GROUP BY dept_name");
        
        // Step 3: Process results
        while (rset.next()) {
            System.out.println(rset.getString("dept_name") + " " + 
                             rset.getFloat(2));
        }
    } catch (SQLException sqle) {
        // Step 4: Handle errors
        System.out.println("SQLException: " + sqle);
    }
    // Step 5: Connection auto-closed by try-with-resources!
}
```

**Key JDBC methods:**
```
executeQuery(sql)    → For SELECT (returns ResultSet)
executeUpdate(sql)   → For INSERT/UPDATE/DELETE (returns row count)
getString("column")  → Get string value from result
getInt("column")     → Get integer value from result
getFloat(2)          → Get float value from 2nd column
```

#### Handling NULL in JDBC:
```java
int a = rs.getInt("a");
if (rs.wasNull()) {
    System.out.println("Got null value");
}
```

### 5.1.2 Prepared Statements (⚠️ SECURITY IMPORTANT!)

**Prepared statements** use placeholders (`?`) instead of concatenating strings.

```java
PreparedStatement pStmt = conn.prepareStatement(
    "INSERT INTO instructor VALUES (?, ?, ?, ?)");
pStmt.setString(1, "88877");    // First ?
pStmt.setString(2, "Perry");     // Second ?
pStmt.setString(3, "Finance");   // Third ?
pStmt.setInt(4, 125000);         // Fourth ?
pStmt.executeUpdate();
```

### ⚠️ SQL Injection — A Major Security Threat!

**NEVER** build queries by concatenating user input!

```java
// ❌ DANGEROUS! SQL Injection vulnerability!
String query = "SELECT * FROM instructor WHERE name = '" + name + "'";

// What if user enters: X' OR 'Y' = 'Y
// The query becomes:
// SELECT * FROM instructor WHERE name = 'X' OR 'Y' = 'Y'
// This returns ALL rows! 😱

// Even worse, user could enter:
// X'; UPDATE instructor SET salary = salary + 10000; --
// This would give everyone a raise! 💸😱

// ✅ SAFE! Always use PreparedStatement
PreparedStatement pStmt = conn.prepareStatement(
    "SELECT * FROM instructor WHERE name = ?");
pStmt.setString(1, name);
```

> 💡 **Golden Rule**: ALWAYS use prepared statements when handling user input!

### 5.1.3 ODBC (Open DataBase Connectivity)

- **Standard API** for connecting applications to databases
- Works with C, C++, Python, and many other languages
- Similar concept to JDBC but language-independent

### 5.1.4 Embedded SQL

SQL statements embedded directly inside a host programming language:

```c
// In C language
EXEC SQL
    DECLARE c CURSOR FOR
    SELECT ID, name
    FROM student
    WHERE tot_cred > :credit_amount;
END_EXEC

EXEC SQL OPEN c;          // Execute the query
EXEC SQL FETCH c INTO :si, :sn;  // Get one row
EXEC SQL CLOSE c;         // Clean up
```

**Key points:**
- Variables prefixed with `:` are host language variables
- `EXEC SQL` marks the beginning of SQL code
- Cursor is used to iterate through results row by row

### Transaction Control in JDBC

```java
conn.setAutoCommit(false);   // Disable auto-commit

// Do multiple operations...
stmt.executeUpdate("UPDATE ...");
stmt.executeUpdate("INSERT ...");

conn.commit();    // Make all changes permanent
// OR
conn.rollback();  // Undo all changes

conn.setAutoCommit(true);    // Re-enable auto-commit
```

---

## 5.2 Functions and Procedures 🔧 (⚠️ EXAM FAVOURITE!)

### What Are They?

Just like functions in C/Java/Python, SQL allows you to create reusable code blocks!

| Feature | Function | Procedure |
|---------|----------|-----------|
| **Returns value?** | Yes, returns a value | No (but can use OUT parameters) |
| **Can be used in SELECT?** | Yes | No |
| **Syntax** | `CREATE FUNCTION` | `CREATE PROCEDURE` |

### 5.2.1 SQL Functions

#### Example: Count instructors in a department

```sql
-- Define the function
CREATE FUNCTION dept_count(dept_name VARCHAR(20))
    RETURNS INTEGER
BEGIN
    DECLARE d_count INTEGER;
    SELECT COUNT(*) INTO d_count
    FROM instructor
    WHERE instructor.dept_name = dept_name;
    RETURN d_count;
END;
```

**How to USE the function:**

```sql
-- Find departments with more than 12 instructors
SELECT dept_name, budget
FROM department
WHERE dept_count(dept_name) > 12;
```

> 💡 **Think of it like**: `dept_count('Comp. Sci.')` returns 3 (number of CS instructors)

#### Table Functions (Return a Table!)

```sql
-- Function that returns a TABLE
CREATE FUNCTION instructor_of(dept_name CHAR(20))
RETURNS TABLE (
    ID VARCHAR(5),
    name VARCHAR(20),
    dept_name VARCHAR(20),
    salary NUMERIC(8,2)
)
RETURN TABLE (
    SELECT ID, name, dept_name, salary
    FROM instructor
    WHERE instructor.dept_name = instructor_of.dept_name
);

-- Usage: Get all Music instructors as a table
SELECT *
FROM TABLE(instructor_of('Music'));
```

### 5.2.2 SQL Procedures

```sql
-- Define a procedure (uses IN and OUT parameters)
CREATE PROCEDURE dept_count_proc(
    IN dept_name VARCHAR(20),    -- Input parameter
    OUT d_count INTEGER           -- Output parameter
)
BEGIN
    SELECT COUNT(*) INTO d_count
    FROM instructor
    WHERE instructor.dept_name = dept_count_proc.dept_name;
END;
```

**Calling a procedure:**
```sql
DECLARE d_count INTEGER;
CALL dept_count_proc('Comp. Sci.', d_count);
```

### 5.2.3 Language Constructs in SQL

SQL also supports programming constructs:

#### Variables and Assignment
```sql
DECLARE n INTEGER DEFAULT 0;
SET n = n + 1;
```

#### IF-THEN-ELSE
```sql
IF condition THEN
    statements;
ELSEIF condition THEN
    statements;
ELSE
    statements;
END IF;
```

#### WHILE Loop
```sql
WHILE condition DO
    statements;
END WHILE;
```

#### FOR Loop (iterate over query results)
```sql
DECLARE n INTEGER DEFAULT 0;
FOR r AS
    SELECT budget FROM department
    WHERE dept_name = 'Music'
DO
    SET n = n + r.budget;
END FOR;
```

### 5.2.4 External Language Routines

You can write functions/procedures in C, Java, etc.:

```sql
CREATE FUNCTION dept_count(dept_name VARCHAR(20))
    RETURNS INTEGER
    LANGUAGE C
    EXTERNAL NAME '/usr/avi/bin/dept_count';
```

**Security concern**: External code can potentially access system memory! Solutions:
1. **Sandbox** — Use safe languages like Java
2. **Separate process** — Run external code in isolated process

---

## 5.3 Triggers 🔔 (⚠️ VERY IMPORTANT FOR EXAMS!)

### What is a Trigger?

A **trigger** is a piece of code that **executes AUTOMATICALLY** when a certain database event occurs.

**Think of it like**: An alarm system — when someone opens the door (event), the alarm goes off (action)!

### Designing a Trigger — Three Things to Specify:

```
1. WHEN should it fire?  → Event (INSERT, UPDATE, DELETE)
2. WHAT condition?       → Condition to check
3. WHAT to do?           → Action to perform
```

### ECA Model (Event-Condition-Action)

```
EVENT:     A database modification (INSERT, UPDATE, DELETE)
CONDITION: A test that is checked (optional)
ACTION:    SQL statements to execute
```

### Trigger Syntax

```sql
CREATE TRIGGER trigger_name
    {BEFORE | AFTER} {INSERT | UPDATE | DELETE} [OF column]
    ON table_name
    REFERENCING NEW ROW AS nrow
    REFERENCING OLD ROW AS orow
    FOR EACH ROW
    WHEN (condition)
BEGIN
    -- action
END;
```

### Example 1: Auto-update total credits

When a student's grade is updated from F/NULL to a passing grade, add the course credits to their total:

```sql
CREATE TRIGGER credits_earned
    AFTER UPDATE OF takes ON (grade)
    REFERENCING NEW ROW AS nrow
    REFERENCING OLD ROW AS orow
    FOR EACH ROW
    WHEN nrow.grade <> 'F' AND nrow.grade IS NOT NULL
         AND (orow.grade = 'F' OR orow.grade IS NULL)
BEGIN ATOMIC
    UPDATE student
    SET tot_cred = tot_cred + 
        (SELECT credits
         FROM course
         WHERE course.course_id = nrow.course_id)
    WHERE student.ID = nrow.ID;
END;
```

**What this does (in plain English):**
1. **When?** → After a grade is UPDATED in the `takes` table
2. **Check**: Is the new grade passing (not F, not NULL) AND was the old grade failing?
3. **If yes**: Add the course credits to the student's total in the `student` table

### Referencing OLD and NEW Values

| Keyword | Meaning | Available For |
|---------|---------|---------------|
| `NEW ROW` | The row AFTER the change | INSERT, UPDATE |
| `OLD ROW` | The row BEFORE the change | DELETE, UPDATE |
| `NEW TABLE` | All new rows (for statement-level) | INSERT, UPDATE |
| `OLD TABLE` | All old rows (for statement-level) | DELETE, UPDATE |

### Row-Level vs Statement-Level Triggers

```sql
-- ROW-LEVEL: Fires ONCE for EACH affected row
FOR EACH ROW

-- STATEMENT-LEVEL: Fires ONCE for the entire statement
FOR EACH STATEMENT
```

**Example**: If `UPDATE instructor SET salary = salary + 1000` affects 50 rows:
- Row-level trigger fires **50 times**
- Statement-level trigger fires **1 time**

### When NOT to Use Triggers ⚠️

Modern databases have better alternatives:
- ❌ Don't use for maintaining summary data → Use **materialized views** instead
- ❌ Don't use for replication → Use **built-in replication** instead
- ❌ Don't use when you can use **application logic** instead

**Risks of triggers:**
- Unintended execution (during data loading/backup)
- Cascading execution (trigger A fires trigger B fires trigger C...)
- Errors can cause critical transactions to fail

---

## 5.4 Recursive Queries 🔄

### The Problem

How to find ALL prerequisites of a course — not just direct ones, but indirect ones too?

```
CS-347 requires CS-301
CS-301 requires CS-201
CS-201 requires CS-101

So CS-347 indirectly requires CS-201 AND CS-101!
```

### Recursive Views (WITH RECURSIVE)

```sql
-- Find ALL prerequisites (direct and indirect) for all courses
WITH RECURSIVE rec_prereq(course_id, prereq_id) AS (
    -- Base case: direct prerequisites
    SELECT course_id, prereq_id
    FROM prereq
    UNION
    -- Recursive case: indirect prerequisites
    SELECT rec_prereq.course_id, prereq.prereq_id
    FROM rec_prereq, prereq
    WHERE rec_prereq.prereq_id = prereq.course_id
)
SELECT *
FROM rec_prereq;
```

**How it works (step by step):**

```
Iteration 1 (Base): 
  CS-347 → CS-301
  CS-301 → CS-201
  CS-201 → CS-101

Iteration 2 (Recursive):
  CS-347 → CS-201  (through CS-301)
  CS-301 → CS-101  (through CS-201)

Iteration 3 (Recursive):
  CS-347 → CS-101  (through CS-301 → CS-201)

No more new results → STOP! (Fixed point reached)
```

> This is called the **transitive closure** of the prereq relation.

### Why Recursion is Necessary

Without recursion, you'd need a **fixed number of joins**:

```sql
-- This only finds 2 levels deep!
SELECT p1.course_id, p2.prereq_id
FROM prereq p1, prereq p2
WHERE p1.prereq_id = p2.course_id;

-- But what if there are 10 levels? Or 100?
-- You can't know in advance how many joins needed!
-- RECURSION solves this elegantly!
```

---

## 5.5 Advanced Aggregation Features 📊

### 5.5.1 Ranking Functions

#### RANK() — Rank with Gaps

```sql
-- Rank students by GPA (highest first)
SELECT ID, rank() OVER (ORDER BY GPA DESC) AS s_rank
FROM student_grades
ORDER BY s_rank;
```

**Result:**
```
┌──────┬────────┐
│  ID  │ s_rank │
├──────┼────────┤
│ S001 │   1    │  GPA: 9.5
│ S002 │   1    │  GPA: 9.5 (same → same rank!)
│ S003 │   3    │  GPA: 9.0 (rank 2 is SKIPPED!)
│ S004 │   4    │  GPA: 8.5
└──────┴────────┘
```

> Notice: Two students share rank 1, and rank 2 is skipped! (Gap)

#### DENSE_RANK() — Rank WITHOUT Gaps

```sql
SELECT ID, dense_rank() OVER (ORDER BY GPA DESC) AS s_rank
FROM student_grades;
```

```
┌──────┬────────┐
│  ID  │ s_rank │
├──────┼────────┤
│ S001 │   1    │  GPA: 9.5
│ S002 │   1    │  GPA: 9.5
│ S003 │   2    │  GPA: 9.0 (rank 2, NO gap!)
│ S004 │   3    │  GPA: 8.5
└──────┴────────┘
```

#### Ranking WITHIN Partitions

```sql
-- Rank students within EACH department
SELECT ID, dept_name,
    rank() OVER (PARTITION BY dept_name ORDER BY GPA DESC) AS dept_rank
FROM dept_grades
ORDER BY dept_name, dept_rank;
```

This ranks students **separately for each department** — like ranking within each class!

#### Other Ranking Functions

| Function | Description |
|----------|-------------|
| `rank()` | Rank with gaps |
| `dense_rank()` | Rank without gaps |
| `row_number()` | Unique number for each row (arbitrary for ties) |
| `percent_rank()` | Rank as percentage |
| `cume_dist()` | Cumulative distribution |
| `ntile(n)` | Divide into n equal buckets |

#### NTILE Example:
```sql
-- Divide students into 4 quartiles
SELECT ID, ntile(4) OVER (ORDER BY GPA DESC) AS quartile
FROM student_grades;
```

```
Quartile 1: Top 25% students (highest GPA)
Quartile 2: Next 25%
Quartile 3: Next 25%
Quartile 4: Bottom 25%
```

### NULL Handling in Ranking:
```sql
-- Put NULLs at the end
rank() OVER (ORDER BY GPA DESC NULLS LAST)

-- Put NULLs at the beginning
rank() OVER (ORDER BY GPA DESC NULLS FIRST)
```

### 5.5.2 Windowing Functions 🪟

Used for **moving calculations** (like moving averages).

```sql
-- Moving average: average of current day + previous day + next day
SELECT date, SUM(value) OVER
    (ORDER BY date ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS moving_avg
FROM sales;
```

**Window Specifications:**
```sql
ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING    -- 3-day window
ROWS UNBOUNDED PRECEDING                     -- all rows up to current
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  -- running total
```

#### Windowing with Partitions:
```sql
-- Running balance for each account
SELECT account_number, date_time,
    SUM(value) OVER (
        PARTITION BY account_number
        ORDER BY date_time
        ROWS UNBOUNDED PRECEDING
    ) AS balance
FROM transaction
ORDER BY account_number, date_time;
```

> 💡 This calculates the running total for **each account separately**!

### 5.5.3 OLAP (Online Analytical Processing)

OLAP is about analyzing data from multiple dimensions.

#### Key Concepts:

| Term | Meaning | Example |
|------|---------|---------|
| **Dimension Attribute** | Categories to group by | item_name, color, size |
| **Measure Attribute** | Values to aggregate | quantity, revenue |
| **Cross-tabulation** | Pivot table | rows=items, columns=colors |
| **Data Cube** | Multi-dimensional cross-tab | 3D or more dimensions |

#### CUBE — All Possible Groupings

```sql
SELECT item_name, color, size, SUM(quantity)
FROM sales
GROUP BY CUBE(item_name, color, size);
```

This generates **8 different GROUP BY combinations** (2³ = 8):
```
{(item_name, color, size), (item_name, color), (item_name, size),
 (color, size), (item_name), (color), (size), ()}
```

> NULL values in the result represent "all" for that dimension.

#### ROLLUP — Hierarchical Groupings

```sql
SELECT item_name, color, size, SUM(quantity)
FROM sales
GROUP BY ROLLUP(item_name, color, size);
```

Generates **4 groupings** (prefixes only):
```
{(item_name, color, size), (item_name, color), (item_name), ()}
```

#### GROUPING() Function

Used to distinguish between a real NULL and "all" NULL:

```sql
SELECT item_name, color, SUM(quantity),
    GROUPING(item_name) AS item_flag,    -- 1 if aggregated (all), 0 otherwise
    GROUPING(color) AS color_flag
FROM sales
GROUP BY CUBE(item_name, color);
```

#### OLAP Operations

| Operation | What It Does |
|-----------|-------------|
| **Pivot** | Change which dimension is on rows vs columns |
| **Slice** | Fix one dimension value |
| **Dice** | Fix multiple dimension values |
| **Roll-up** | Move from detailed to summarized data |
| **Drill-down** | Move from summarized to detailed data |

---

## 📝 Chapter 5 Quick Revision

| Topic | Key Points |
|-------|------------|
| **JDBC** | Java API: Connection → Statement → ResultSet |
| **Prepared Statement** | Use `?` placeholders, prevents SQL injection |
| **SQL Injection** | Never concatenate user input into queries! |
| **SQL Function** | Returns a value, can be used in SELECT |
| **SQL Procedure** | Uses IN/OUT parameters, called with CALL |
| **Trigger** | Auto-executes on INSERT/UPDATE/DELETE |
| **FOR EACH ROW** | Trigger fires for each affected row |
| **FOR EACH STATEMENT** | Trigger fires once for entire statement |
| **WITH RECURSIVE** | Recursive CTEs for hierarchical queries |
| **RANK()** | Ranking with gaps |
| **DENSE_RANK()** | Ranking without gaps |
| **NTILE(n)** | Divide into n buckets |
| **Windowing** | Moving calculations (running sum, average) |
| **CUBE** | All possible group-by combinations |
| **ROLLUP** | Hierarchical group-by (prefixes only) |

---

## 🎯 Most Likely Exam Questions

1. Write a SQL function and show how to use it in a query
2. Write a trigger for a given scenario (most common exam question!)
3. Explain the difference between FUNCTION and PROCEDURE
4. What is SQL injection? How to prevent it?
5. Write a recursive query to find all prerequisites of a course
6. Explain RANK() vs DENSE_RANK() with example
7. Write a query using windowing functions
8. Explain the difference between ROW-LEVEL and STATEMENT-LEVEL triggers
9. What is JDBC? Explain the steps to use it
10. Explain CUBE vs ROLLUP with example

---

*Previous → [Chapter 4](./MIDSEM_CH4_INTERMEDIATE_SQL.md)* 📚

---

# 🎯 ALL CHAPTERS COMPLETE! 

## Recommended Study Plan for Mid-Sem:

```
📅 Day 1: Chapter 1 (Introduction) + Chapter 2 (Relational Model)
📅 Day 2: Chapter 3 (Introduction to SQL) — spend most time here!
📅 Day 3: Chapter 4 (Intermediate SQL) — focus on JOINs and Views
📅 Day 4: Chapter 5 (Advanced SQL) — focus on Triggers and Functions
📅 Day 5: Revision — practice writing SQL queries on paper!
```

**Best of luck with your mid-semester exam! 🎓✨**
