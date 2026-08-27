# 📖 Chapter 13: Data Storage Structures
## 🎯 Complete End-Sem Study Material (Book + PPT Combined)

---

## 🧠 What Will You Learn?

This chapter covers how data is **organized within files and blocks**:
- **Database Storage Architecture** (Blocks, Files, Records — the big picture)
- **File Organization** (Fixed-Length & Variable-Length Records)
- **Slotted Page Structure** (How blocks store records internally)
- **Storing Large Objects** (BLOBs and CLOBs)
- **Record Organization in Files** (Heap, Sequential, Multitable Clustering, B+-tree, Hashing)
- **Table Partitioning** (Splitting relations for performance)
- **Data Dictionary Storage** (System catalog / metadata)
- **Buffer Manager** (How memory manages disk blocks — Pin/Unpin, LRU/MRU)
- **Column-Oriented Storage** (Columnar representation for analytics)
- **Main-Memory Databases** (When entire DB fits in RAM)

> ⚠️ **EXAM TIP**: Slotted Page Structure, Buffer Manager (LRU/MRU), File Organizations (Heap, Sequential, Clustering), and Column-Oriented Storage are the MOST asked topics!

---

## 13.1 Database Storage Architecture 🏗️

### The Big Picture

```
Database = Collection of FILES
File     = Sequence of RECORDS (mapped onto disk BLOCKS)
Record   = Sequence of FIELDS (attributes)
Block    = Fixed-length storage unit (typically 4-8 KB)
```

### Key Concepts from the Book

1. **Block-structured devices**: Both magnetic disks and SSDs read/write data in units of **blocks** (not individual bytes)
2. **Records are smaller than blocks**: We assume no record is larger than a block (for most data-processing applications this is realistic)
3. **No cross-block records**: Each record must be **entirely contained in a single block** — this simplifies and speeds up access
4. **OS files as intermediate layer**: Most databases use OS files to store records, abstracting away some block-level details
5. **Main-memory databases**: If entire DB fits in RAM, we can optimize for in-memory data structures (Section 13.7)

### How Many Records Fit in a Block?

```
Records per block = ⌊Block Size / Record Size⌋

Example:
  Block size = 4096 bytes
  Record size = 53 bytes
  Records per block = ⌊4096 / 53⌋ = 77 records
  Wasted space per block = 4096 - (77 × 53) = 15 bytes
```

> 💡 **Key rule**: We allocate only as many records as can FIT ENTIRELY in the block. Remaining bytes are left unused. This avoids records crossing block boundaries (which would need 2 block accesses).

---

## 13.2 Fixed-Length Records 📏

### The Instructor File Example (from Book)

```
type instructor = record
    ID        varchar(5);      → 5 bytes
    name      varchar(20);     → 20 bytes
    dept_name varchar(20);     → 20 bytes
    salary    numeric(8,2);    → 8 bytes
end                            → Total: 53 bytes per record
```

(Here we allocate MAX bytes for each varchar field → fixed-length approach)

### Storage Strategy

```
Record i is stored starting at byte: n × (i)
where n = size of each record, i starts from 0

Example (n = 53 bytes):
Record 0 → bytes 0-52     (10101, Srinivasan, Comp.Sci., 65000)
Record 1 → bytes 53-105   (12121, Wu, Finance, 90000)
Record 2 → bytes 106-158  (15151, Mozart, Music, 40000)
...
```

- ✅ Record access is **simple** (direct byte calculation)
- ⚠️ Records may cross block boundaries → **Don't allow this!**

### Two Problems with Simple Approach

| Problem | Description |
|---------|-------------|
| **Cross-block records** | If block size isn't a multiple of 53, records will span 2 blocks → 2 I/O ops to read one record |
| **Deletion gaps** | Deleting a record leaves a gap that's hard to fill |

### Deletion Strategies for Fixed-Length Records

| Strategy | How It Works | Pros/Cons |
|----------|-------------|-----------|
| **Move records up** | Move records i+1...n to fill gap (Figure 13.2) | ❌ Expensive (shifts many records across blocks) |
| **Move last record** | Move record n to deleted position i (Figure 13.3) | ✅ Fast, ❌ Changes record number → breaks external refs |
| **Free list** ⭐ | Link all free record slots via header | ✅ Best! No data movement, O(1) insert |

### Free List Approach (Best Method)

```
┌──────────────────────────────────────────┐
│ File Header → points to first free slot  │
│     ↓                                    │
│ Record 0: [DATA - Srinivasan]            │
│ Record 1: [DATA - Wu]                    │
│ Record 2: [DELETED] ──→ points to Rec 4  │
│ Record 3: [DATA - Einstein]              │
│ Record 4: [DELETED] ──→ points to NULL   │
│ Record 5: [DATA - Gold]                  │
│ ...                                      │
└──────────────────────────────────────────┘
```

**How it works:**
- File header stores pointer to **first deleted record slot**
- Each deleted slot stores pointer to **next deleted slot**
- Forms a **linked list** of free space
- **Insert**: Take first slot from free list, place record there
- **Delete**: Add slot to front of free list

> 💡 We reuse the **space of deleted records** to store the free-list pointers — no extra storage needed!

---

## 13.3 Variable-Length Records 📐

### Why Variable-Length Records?

1. **VARCHAR** fields — store only actual characters, not max length
2. **Multiple record types** in one file (e.g., multitable clustering)
3. **Repeating fields** (allowed in some older data models)

### Record Format (⭐ Important for Exam!)

```
┌────────────────────────────────────────────────────────────────┐
│ Fixed-length   │ (Offset,Length) │ Null    │ Variable-length   │
│ attributes     │ for each var    │ Bitmap  │ attribute values  │
│ (stored first) │ attribute       │         │ (stored at end)   │
└────────────────────────────────────────────────────────────────┘
```

### Detailed Byte-Level Example

```
Record for instructor (ID=10101, name="Srinivasan", dept="Comp.Sci.", salary=65000):

Byte layout:
┌─────────────────────────────────────────────────────────────┐
│ Offset₁=21 │ Offset₂=31 │ Offset₃=40 │ 65000  │ Null │ 10101 │ Srinivasan │ Comp.Sci. │
│ Length₁=5  │ Length₂=10 │ Length₃=9  │(fixed) │ Bitmap│(var)  │   (var)    │   (var)   │
└─────────────────────────────────────────────────────────────┘
  ← (Offset,Length) pairs →  ← Fixed → ← Bitmap → ← Actual variable data →
```

**How (Offset, Length) works:**
- Each variable-length attribute gets a pair: **(byte offset, byte length)**
- Offset = where the actual data starts within this record
- Length = how many bytes the actual data occupies
- Fixed-length attributes (like salary) stored directly after the offset/length pairs

### Null Bitmap

- **One bit per attribute** in the record
- Bit = 1 → attribute is **NULL** (no value stored)
- Bit = 0 → attribute has a value
- Saves space: NULL attributes don't consume data space, only 1 bit

> 💡 **Null bitmap is always present** even when there are no null values, because the record format must be consistent.

---

## 13.4 Slotted Page Structure ⭐ (VERY IMPORTANT!)

This is how we store **variable-length records** within a **block/page**.

### Visual Diagram

```
┌──────────────────────────────────────────────────────────┐
│ BLOCK HEADER              │         FREE SPACE           │
│ ┌───────────────────────┐ │                              │
│ │ # record entries = 3  │ │                              │
│ │ end of free space ────│─│──────→ ┌──────┐             │
│ │ slot[0]: loc, size    │ │        │Rec 2 │             │
│ │ slot[1]: loc, size    │ │  ┌─────┤      │             │
│ │ slot[2]: loc, size    │ │  │     └──────┘             │
│ └───────────────────────┘ │  │  ┌──────┐                │
│                           │  │  │Rec 1 │                │
│  Header grows →           │  │  └──────┘  ┌──────────┐  │
│                           │  │            │  Rec 0   │  │
│                           │  │            └──────────┘  │
│                           │  │    ← Records grow        │
└──────────────────────────────────────────────────────────┘
```

### Header Contains:
1. **Number of record entries** in the block
2. **End of free space** pointer (where free space ends / records begin)
3. **Location and size** of each record (one slot entry per record)

### Key Properties (Exam Favourite!):

| Property | Explanation |
|----------|-------------|
| **Records grow from end** | New records are placed starting from the END of the block, growing toward the header |
| **Header grows from start** | Slot entries in header grow from the START toward the records |
| **Free space is in the middle** | Between end of header and start of records |
| **Records can be MOVED** | Within a page, records can be shifted to eliminate gaps → keep free space contiguous |
| **External pointers → header slot** | Pointers from outside the block should point to the HEADER ENTRY (slot), NOT directly to the record |
| **Deleted record = slot size set to -1** | Mark deleted by setting size in slot array to -1; slot entry itself can be reused |

### Why Point to Header Slot? (Common Exam Question)

```
WRONG approach:                    CORRECT approach:
External ptr → Record directly     External ptr → Slot entry in header
                                          ↓
If record moves within block,      Header slot always points to
pointer becomes INVALID! ❌        current record location ✅
```

> 💡 **If we move a record within the block** (to eliminate gaps), we ONLY update the header slot entry. All external pointers still work because they point to the slot, not the record!

### Deletion in Slotted Page

When a record is deleted:
1. Set the slot's size to **-1** (marks it as deleted)
2. The **record space is freed** — other records can be shifted to reclaim that space
3. Free space is compacted so it's always **contiguous** in the middle

---

## 13.5 Storing Large Objects (LOBs) 📦

For **BLOB** (Binary Large Object) and **CLOB** (Character Large Object) data that can be **megabytes to gigabytes** in size:

| Approach | Description | Example |
|----------|-------------|---------|
| **File system storage** | Store as external files, record holds file path | Images, videos |
| **DB-managed files** | Database manages the external file | Oracle BFILE |
| **Break into pieces** | Split into multiple tuples in a separate relation | PostgreSQL TOAST |

**Key points from Book:**
- Large objects are stored **separately** from the main record
- The record stores only a **pointer** to the large object
- Large objects may be stored in a **separate file** or broken across multiple blocks
- Retrieval is inefficient for very large objects → applications may choose file system storage

---

## 13.6 Organization of Records in Files 📋

### Overview of All File Organizations

| Organization | Description | Best For | Worst For |
|-------------|-------------|----------|-----------|
| **Heap** | Records placed anywhere with free space | Random inserts, bulk loading | Range queries |
| **Sequential** | Records in sorted order by search key | Range queries, sorted output | Random inserts |
| **Multitable Clustering** | Records of different relations in same block | Join queries on those relations | Queries on single relation |
| **B⁺-tree** | Ordered storage using balanced tree | General purpose, both range & point | Very high overhead |
| **Hashing** | Hash function determines block | Point queries (equality) | Range queries |

---

### 13.6.1 Heap File Organization

- Records placed **anywhere** there is free space
- Records usually **don't move** once placed
- No ordering of any kind

**Free Space Map (⭐ Important!):**

```
Each block gets an entry: f = fraction of block that is free (in units of 1/N)

Example with N = 8 (3 bits per entry):
Block:      [0] [1] [2] [3] [4] [5] [6] [7]
Free bits:   2   5   1   4   7   0   3   6
             └── fraction of block free = value / 8

Block 4 has 7/8 free space → best candidate for insertion!
```

**Second-Level Map (for large files):**

```
First-level:  [2] [5] [1] [4]  |  [7] [0] [3] [6]
                    ↓                    ↓
Second-level:      [5]                 [7]    ← MAX of each group
                                        ↑
                            Start search HERE for block with
                            at least X free space
```

**How search works:**
1. Need a block with at least `X` fraction free
2. Check second-level map for groups with max ≥ X
3. Within that group, find specific block with enough space
4. If no block has enough space → allocate new block

> 💡 Free space map is written to disk **periodically**. It's OK if it becomes **stale** — stale values are detected and corrected when the block is actually accessed.

---

### 13.6.2 Sequential File Organization

- Records ordered by a **search key** (which can be any attribute, doesn't have to be primary key)
- 💪 Great for applications needing **sequential processing** of entire file

```
┌────────────────────────────────────┐
│ Brighton │ A-217 │ 750   │ ──→     │
│ Brighton │ A-101 │ 500   │ ──→     │
│ Downtown │ A-110 │ 600   │ ──→     │
│ Mianus   │ A-215 │ 700   │ ──→     │
│ Perryridge│ A-201│ 900   │ ──→     │
│ Perryridge│ A-102│ 400   │ ──→     │
│ Redwood  │ A-222 │ 700   │ ──→     │
│ Round Hill│ A-305│ 350   │ ──→ NULL│
└────────────────────────────────────┘
  Sorted by branch_name (search key)
  Each record has pointer to next in sorted order
```

**Operations:**

| Operation | How | Issues |
|-----------|-----|--------|
| **Deletion** | Use pointer chains — delete from chain, mark record deleted | Space wasted until reorganization |
| **Insertion** | Find correct sorted position → if space in block, insert there. If NOT, insert into **overflow block** and adjust pointers | Overflow blocks degrade performance |
| **Reorganization** | Periodically reorganize file to restore **physical sequential order** | Expensive but necessary |

> ⚠️ **After many inserts/deletes**, the file becomes fragmented with overflow blocks everywhere. Sequential access degrades → need periodic **reorganization** to restore sorted physical order.

---

### 13.6.3 Multitable Clustering File Organization

Store records from **multiple related tables** in the **same file/block**:

```
Normal storage (separate files):     Clustered storage (same file):
                                     
department file:                     Block 1:
 [Comp.Sci, Taylor, budget]          [Comp.Sci, Taylor, budget]  ← dept record
 [Finance, Watson, budget]           [Srinivasan, Comp.Sci, 65000] ← instructor
                                      [Katz, Comp.Sci, 75000]    ← instructor
instructor file:                     Block 2:
 [Srinivasan, Comp.Sci, 65000]       [Finance, Watson, budget]   ← dept record
 [Katz, Comp.Sci, 75000]             [Wu, Finance, 90000]        ← instructor
 [Wu, Finance, 90000]
```

### Trade-offs (⭐ Common Exam Question!)

| Aspect | Effect |
|--------|--------|
| ✅ **Good for** | `department ⋈ instructor` joins — related records in same block, fewer I/O! |
| ✅ **Good for** | Queries like "get Comp.Sci dept AND its instructors" — one block read |
| ❌ **Bad for** | Queries involving **ONLY** department — must skip over instructor records wasting I/O |
| ❌ **Bad for** | Queries involving **ONLY** instructor — scattered across department blocks |
| ⚠️ **Results in** | Variable-size records (different record types mixed together) |

### Pointer Chains in Clustered Files

To speed up queries on just ONE relation within a clustered file:

```
Block 1:                           Block 2:
[dept: Comp.Sci] ──────────→      [dept: Finance] ──────→ ...
[inst: Srinivasan] ─→             [inst: Wu] ─→ NULL
[inst: Katz] ─→ NULL              
                                   
Chain 1: dept records linked together
Chain 2: instructor records linked together
```

> 💡 **Pointer chains** let you follow only records of a particular relation, skipping the other relation's records.

---

### 13.6.4 B⁺-Tree File Organization

- Records stored in **leaf nodes** of a B⁺-tree (not just pointers — actual records!)
- Ordered by search key
- Handles **insertions and deletions** efficiently without reorganization
- Covered in detail in **Chapter 14** (Indexing)

### 13.6.5 Hashing File Organization

- A **hash function** is applied to the search key to determine which **block** the record goes into
- ✅ Excellent for **point queries** (equality lookup: `WHERE ID = 10101`)
- ❌ Terrible for **range queries** (`WHERE salary > 50000`)
- Covered in detail in **Chapter 14** (Indexing)

---

## 13.7 Table Partitioning 📊

**Table Partitioning** = Splitting a relation into smaller sub-relations stored separately

```
transaction table → transaction_2018  (on HDD — old data)
                  → transaction_2019  (on HDD)
                  → transaction_2020  (on SSD — current data, fast access!)
```

### Benefits:

| Benefit | Explanation |
|---------|-------------|
| **Faster queries** | `WHERE year = 2019` accesses ONLY the 2019 partition |
| **Less free-space overhead** | Each partition manages its own free space independently |
| **Storage tiering** | Current year on SSD, older years on cheaper HDD |
| **Parallel I/O** | Different partitions on different disks → parallel access |

### Types of Partitioning:
- **Range partitioning**: By range of values (e.g., year, date range)
- **Hash partitioning**: Hash function on a key distributes records across partitions
- **List partitioning**: Specific values map to specific partitions

> 💡 Partitioning is transparent to queries — you still query the full table name, and the system routes to the right partition(s).

---

## 13.8 Data Dictionary Storage 📖

**Data Dictionary** (also called **System Catalog**) stores **metadata** — data about data.

### What's Stored:

| Category | What's Stored |
|----------|--------------:|
| **Relation info** | Names of relations, attributes, types, lengths |
| **View definitions** | SQL query definitions for views |
| **Integrity constraints** | Primary keys, foreign keys, CHECK, NOT NULL |
| **User info** | Usernames, passwords, authorization/permissions |
| **Statistics** | # of tuples in each relation, # of distinct values per attribute |
| **Physical info** | How relation is stored (heap/sequential/hash), file location on disk |
| **Index info** | What indices exist, index type (B⁺-tree/hash), search key attributes |
| **Buffer info** | Buffer size, replacement policy |

### Relational Representation of Metadata

The data dictionary itself is stored as **regular relations**!

```
Relation_metadata (relation_name, #columns, storage_type, file_location)
─────────────────────────────────────────────────────────────────────────
("instructor",    4,      "sequential",   "/data/instructor.dat")
("department",    3,      "heap",         "/data/department.dat")

Attribute_metadata (relation_name, attribute_name, domain_type, position, length)
──────────────────────────────────────────────────────────────────────────────────
("instructor",    "ID",         "varchar",   1,    5)
("instructor",    "name",       "varchar",   2,    20)
("instructor",    "salary",     "numeric",   4,    8)

User_metadata (user_name, encrypted_password, group)
────────────────────────────────────────────────────
("admin",    "x7f2a...",    "superuser")

View_metadata (view_name, definition)
─────────────────────────────────────
("faculty_view",  "SELECT name, dept FROM instructor")
```

> 💡 Data dictionary relations are kept in **specialized in-memory data structures** for very fast access — they're consulted on almost every query!

---

## 13.9 Buffer Manager 🧠 (⚠️ EXAM FAVOURITE!)

### What is a Buffer?

**Buffer** = Portion of **main memory** used to store copies of disk blocks

### How Buffer Manager Works (Step by Step)

```
Program requests block B →
  ├── Is B already IN buffer pool?
  │     └── YES → Return memory address ✅ (buffer hit!)
  │
  └── NO (buffer miss) →
        ├── 1. Is there a free frame in buffer pool?
        │     ├── YES → Use that frame
        │     └── NO → Must EVICT some block from buffer
        │              └── Evicted block written to disk ONLY if MODIFIED (dirty)
        │
        ├── 2. Read block B from disk into the chosen frame
        └── 3. Return memory address of that frame ✅
```

> 💡 **Key insight**: Reading from buffer (memory) is ~1000x faster than reading from disk. The buffer manager tries to keep frequently-used blocks in memory.

### Pin and Unpin Mechanism (⭐ Must Know!)

| Concept | Description |
|---------|-------------|
| **Pin** a block | "I'm using this block — DON'T evict it!" |
| **Unpin** a block | "I'm done with this block — it CAN be evicted now" |
| **Pin count** | Number of active pins on a block — starts at 0 |
| **Evictable** | Block can be evicted ONLY when pin count = **0** |
| **Dirty bit** | Set when block is modified — tells buffer manager to write back before evicting |

**Typical usage pattern:**

```
1. Pin block B          → pin_count(B) becomes 1
2. Read/Write data in B → if write, set dirty bit  
3. Unpin block B        → pin_count(B) back to 0
4. Block B is now evictable (if pin count = 0)
```

**Multiple concurrent users:**
```
User 1: Pin(B) → pin_count(B) = 1
User 2: Pin(B) → pin_count(B) = 2
User 1: Unpin(B) → pin_count(B) = 1   (still NOT evictable!)
User 2: Unpin(B) → pin_count(B) = 0   (NOW evictable ✅)
```

### Shared and Exclusive Locks on Buffer

| Lock Type | Purpose | Rules |
|-----------|---------|-------|
| **Shared Lock** | For **reading** | Multiple readers can hold shared locks simultaneously |
| **Exclusive Lock** | For **writing/modifying** | Only ONE writer at a time; no shared locks can coexist |

```
Lock compatibility matrix:
                  Requesting
                  Shared    Exclusive
Held: None        ✅ Grant   ✅ Grant
Held: Shared      ✅ Grant   ❌ Wait
Held: Exclusive   ❌ Wait    ❌ Wait
```

### Forced Output of Blocks

- **Forced output** = Write a block to disk **even if it's not being evicted**
- Required for **crash recovery** (Chapter 19)
- Buffer manager must support this even when the block is still pinned
- Ensures durability — if system crashes, data written to disk survives

---

## 13.10 Buffer-Replacement Policies 🔄 (⚠️ VERY IMPORTANT!)

When buffer is full and we need to evict a block, which one do we choose?

### LRU (Least Recently Used) — Default Strategy

- Evict the block that was **accessed longest ago**
- Uses a **timestamp** or **stack/queue** to track access order
- ✅ Works well for most random access patterns
- ❌ **BAD for nested loop joins!**

### Why LRU Can Be Bad — The Nested Loop Join Problem (⭐ Exam Favourite!)

```
FOR each block Br of relation r DO          ← Outer loop
    FOR each block Bs of relation s DO      ← Inner loop
        FOR each tuple tr in Br, ts in Bs DO
            IF tr and ts match, add to result
```

**What happens with LRU:**

```
Iteration 1: Read r_block_1, then scan ALL of s (s_block_1, s_block_2, ..., s_block_n)
  → By the time s is fully scanned, r_block_1 is the LEAST recently used → LRU evicts it!

Iteration 2: Need r_block_2, also need to re-scan ALL of s
  → s_block_1 was just used in iteration 1, so it was evicted to make room
  → Must re-read EVERYTHING from disk again!

Result: THRASHING — every block is evicted right before it's needed again ❌
```

### MRU (Most Recently Used) — Better for Joins

- Evict the block that was **used MOST recently**
- Logic: In nested loop join, the most recently used block of `s` won't be needed until the NEXT full scan
- The **current block of r** should be kept (pinned) while scanning s

```
With MRU for nested loop join:
- Pin current r_block
- Scan s blocks: as each s_block is done, it becomes MRU → evict it
- This is optimal because we won't need that s_block again until next outer iteration
- The r_block stays in buffer ✅
```

### All Replacement Strategies Compared

| Strategy | How It Works | When to Use |
|----------|-------------|-------------|
| **LRU** | Evict least recently used | General purpose, random access |
| **MRU** | Evict most recently used | Nested loop joins, repeated sequential scans |
| **Toss-Immediate** | Evict block as soon as last tuple is processed | Sequential scans where block won't be re-read |
| **Query-optimizer hints** | Optimizer tells buffer manager which strategy to use | Best practice — DB knows access pattern! |

> 💡 **Key insight from Book**: Unlike OS page replacement, databases can predict access patterns from the **query plan** — so they make SMARTER eviction decisions than the OS can!

### Additional Buffer Optimizations

| Technique | Description |
|-----------|-------------|
| **Forced output** | Write blocks to disk for recovery even if not evicted |
| **Non-volatile write buffers** | Write to battery-backed RAM first (very fast!), then lazily write to disk |
| **Reorder writes** | NV-RAM allows reordering writes for efficiency (e.g., sort by disk location to minimize seeks) |
| **Log disk** | Sequential log of all block updates — sequential writes are fast (no seeks!) |
| **Journaling file systems** | Write data in-order to NV-RAM or log disk — used by modern OS file systems |

> 💡 **Non-volatile write buffers** (battery-backed RAM or flash) let the database report a write as "complete" before it actually hits the disk platter — dramatically faster, and data is safe because NV-RAM survives power failure.

---

## 13.11 Column-Oriented Storage 📊

### Row vs Column Storage

```
ROW-ORIENTED (Traditional):                COLUMN-ORIENTED:
┌────┬────────┬────────┬────────┐
│ ID │ Name   │ Dept   │ Salary │          ID:     [1, 2, 3, 4, 5]
├────┼────────┼────────┼────────┤          Name:   [A, B, C, D, E]
│ 1  │ A      │ CS     │ 80000  │          Dept:   [CS, EE, CS, ME, EE]
│ 2  │ B      │ EE     │ 75000  │          Salary: [80K, 75K, 90K, 70K, 85K]
│ 3  │ C      │ CS     │ 90000  │
│ 4  │ D      │ ME     │ 70000  │          Each column stored in a
│ 5  │ E      │ EE     │ 85000  │          SEPARATE file/block sequence
└────┴────────┴────────┴────────┘
  All attributes of one row stored         One attribute of ALL rows stored
  contiguously in same block               contiguously in same block
```

### Four Benefits of Columnar Storage (from Book)

| # | Benefit | Explanation |
|---|---------|-------------|
| 1 | **Reduced I/O** | Query `SELECT AVG(salary) FROM instructor` reads ONLY the salary column file. Row store would read entire rows (ID, name, dept, salary) — wasting I/O on unneeded attributes |
| 2 | **Better CPU cache** | Column data is contiguous in memory → CPU cache lines filled with relevant data → fewer cache misses |
| 3 | **Better compression** | Values in a column are same type and often similar → much higher compression ratios (e.g., run-length encoding for sorted columns) |
| 4 | **Vector processing** | Modern CPUs can process arrays of same-type data using SIMD instructions → columnar layout enables this parallelism |

### Three Drawbacks of Columnar Storage

| # | Drawback | Explanation |
|---|----------|-------------|
| 1 | **Tuple reconstruction cost** | To get a full row, must fetch from MULTIPLE column files and stitch them together → expensive random I/O |
| 2 | **Insertion/Update cost** | Inserting one record means writing to EVERY column file separately |
| 3 | **Decompression cost** | Data may need to be decompressed before use (though some operations can work on compressed data) |

### Detailed Comparison

| Feature | Row-Oriented | Column-Oriented |
|---------|-------------|-----------------|
| **Read few columns** | ❌ Reads entire rows | ✅ Reads only needed columns |
| **IO efficiency** | Lower for analytics | ✅ Reduced IO (only relevant columns) |
| **CPU cache** | Worse (mixed types in cache line) | ✅ Better (same type, contiguous) |
| **Compression** | OK | ✅ Much better (10x or more) |
| **INSERT/UPDATE** | ✅ Fast (one write to one block) | ❌ Expensive (write to N column files) |
| **Full row retrieval** | ✅ Fast (single block read) | ❌ Expensive (N separate reads) |
| **Best for** | **OLTP** (transactions, many single-row ops) | **OLAP** (analytics, few columns, many rows) |

### ORC File Format (from Book)

**ORC** (Optimized Row Columnar) is used in big data systems:

```
┌────────────────────────────────────┐
│           ORC FILE                 │
│                                    │
│  ┌──────────────────────┐          │
│  │ STRIPE 1 (≈200MB)    │          │
│  │  ├─ Index data        │         │
│  │  ├─ Column 1 data     │  ← One column stored contiguously within stripe!
│  │  ├─ Column 2 data     │         │
│  │  ├─ Column 3 data     │         │
│  │  └─ Stripe footer     │  ← Min/max values per column (for skipping)
│  └──────────────────────┘          │
│  ┌──────────────────────┐          │
│  │ STRIPE 2 (≈200MB)    │          │
│  │  ├─ Index data        │         │
│  │  ├─ Column 1 data     │         │
│  │  ├─ ...               │         │
│  │  └─ Stripe footer     │         │
│  └──────────────────────┘          │
│  ...                               │
│  ┌──────────────────────┐          │
│  │ FILE FOOTER           │  ← Schema, stripe locations, statistics
│  └──────────────────────┘          │
└────────────────────────────────────┘
```

**Key ideas:**
- File divided into **stripes** (~200 MB each, containing many rows)
- Within each stripe, data is stored **column by column** 
- **Stripe footer** has min/max stats per column → enables **stripe skipping** (if query asks WHERE salary > 100000 and this stripe's max salary is 90000, skip entire stripe!)
- **Parquet** is another popular columnar format (used in Spark, Hadoop)

### Columnar Representation Within Each Block

Even within a block, column-oriented storage can be used:

```
Traditional block:                   Column-oriented block:
┌───────────────────┐               ┌───────────────────┐
│ Row 1: all attrs  │               │ Col 1: val₁,val₂..│
│ Row 2: all attrs  │               │ Col 2: val₁,val₂..│
│ Row 3: all attrs  │               │ Col 3: val₁,val₂..│
│ ...               │               │ ...               │
└───────────────────┘               └───────────────────┘
```

### Hybrid Row/Column Stores

Some modern databases support **BOTH** representations:
- **Transaction tables** (OLTP) → Row-oriented storage
- **Analytics tables** (OLAP) → Column-oriented storage
- Example: **SAP HANA** uses columnar storage as primary, with row store for specific workloads

---

## 13.12 Main-Memory Databases 🧠

When the entire database fits in **main memory**:

### Key Differences from Disk Databases

| Aspect | Disk-Based DB | Main-Memory DB |
|--------|--------------|----------------|
| **Data location** | Disk (with buffer cache) | Entirely in RAM |
| **Access time** | Milliseconds (disk seek) | Nanoseconds (memory access) |
| **Buffer manager** | Critical component | Not needed (everything in memory) |
| **Optimization focus** | Minimize disk I/O | Minimize CPU time, cache misses |
| **Column store benefit** | Reduced I/O | Better cache utilization + compression |

### Important Points (from Book):
1. **Data still written to disk** for durability (recovery from crashes)
2. **Logging** ensures changes survive crashes → write-ahead log to disk/NV-RAM
3. **Column-oriented storage** is especially beneficial — better CPU cache utilization
4. **Storage class memory** (NV-RAM that allows byte-level access) may further optimize main-memory databases
5. Even in main-memory DBs, optimizing for **CPU cache performance** is crucial — column storage helps because contiguous same-type data fills cache lines efficiently

> 💡 "Main-memory DB" doesn't mean data is lost on crash — it means the **working copy** is in RAM for speed, but changes are always **logged to persistent storage** for durability.

---

## 📝 Chapter 13 Quick Revision

| Topic | Key Points |
|-------|-----------:|
| **Database Storage Architecture** | DB → Files → Records → Fields; blocks = unit of I/O; no cross-block records |
| **Fixed-Length Records** | Stored at byte n × i; free list for deletions (best method) |
| **Variable-Length Records** | (offset, length) pairs for var attrs + null bitmap (always present) |
| **Slotted Page** | Header (# records + free space end + slot array); records grow from END; external ptrs → slot entries |
| **Heap File** | Place anywhere; free space map with 2-level structure; stale values OK |
| **Sequential File** | Sorted by search key; pointer chains; overflow blocks; needs periodic reorganization |
| **Multitable Clustering** | Multiple relations in same file; great for joins; bad for single-relation queries |
| **Partitioning** | Split table by criteria (range/hash/list); different storage tiers |
| **Data Dictionary** | System catalog storing metadata AS RELATIONS; kept in memory for speed |
| **Buffer Manager** | Manages memory copies of disk blocks; pin/unpin mechanism |
| **Pin Count** | Block evictable ONLY when pin count = 0; dirty bit for modified blocks |
| **LRU** | Default replacement; bad for nested loop joins (causes thrashing) |
| **MRU** | Better for nested loop joins; evict most recently used block |
| **Column Storage** | Store each column separately; great for OLAP; bad for OLTP/inserts |
| **ORC/Parquet** | Columnar file formats; stripes with per-column storage + min/max stats |
| **Main-Memory DB** | Entire DB in RAM; still log to disk for durability; optimize for CPU cache |

---

## 🎯 Most Likely Exam Questions

1. **Draw and explain the slotted page structure** — What does the header contain? Why point to header slots not records directly?
2. **Compare heap, sequential, and clustering file organizations** — Pros/cons with examples for each
3. **How does the buffer manager work?** — Explain with pin/unpin mechanism and the complete flow diagram
4. **Compare LRU and MRU** — When is LRU bad? Explain the nested loop join thrashing problem with the step-by-step example
5. **Explain fixed-length record deletion strategies** — Move up vs. move last vs. free list (which is best and why?)
6. **How are variable-length records stored?** — Draw and explain the (offset, length) format with null bitmap
7. **What is a free space map?** — How does the two-level structure work? What happens if it's stale?
8. **Compare row-oriented vs column-oriented storage** — Give 4 benefits and 3 drawbacks of columnar. When to use each?
9. **What is multitable clustering?** — Draw the example. When is it good/bad? How do pointer chains help?
10. **What is the data dictionary?** — What metadata does it store? How is it itself stored (as relations)?
11. **Explain the ORC file format** — What are stripes? How does stripe skipping work?
12. **Explain shared and exclusive locks on buffer blocks** — Compatibility matrix
13. **What are main-memory databases?** — How do they differ from disk-based? How is durability ensured?
14. **Explain non-volatile write buffers** — How do they speed up writes? Why are they safe?

---

## 🔥 Practice Exercises (from Book)

**Q13.1** For the instructor record (53 bytes) in a file with no header and block size 512 bytes, how many records fit per block?  
**A**: ⌊512/53⌋ = 9 records. Wasted space = 512 - (9×53) = 35 bytes/block.

**Q13.2** Consider a file of fixed-length records with a free list for deletions. When a record is deleted from block B, what must be updated?  
**A**: Add the slot to the free list (update the previous free-list head pointer AND the header of the file to point to this newly freed slot).

**Q13.3** Why is it important that blocks don't contain records from two different relations (in normal, non-clustered storage)?  
**A**: Simplifies buffer management, deletion, and access patterns. Mixed blocks would mean reading a block brings in irrelevant records, wasting buffer space and I/O.

**Q13.4** When would MRU be preferred over LRU for buffer management?  
**A**: In nested loop joins where the inner relation is repeatedly scanned. LRU causes thrashing because each block is evicted right before it's needed again. MRU evicts the just-used inner block (which won't be needed until the next full scan), keeping the outer block and earlier inner blocks available.

---

*Previous → [Chapter 12](./ENDSEM_CH12_PHYSICAL_STORAGE.md)* | *Next → [Chapter 14](./ENDSEM_CH14_INDEXING.md)* 📚
