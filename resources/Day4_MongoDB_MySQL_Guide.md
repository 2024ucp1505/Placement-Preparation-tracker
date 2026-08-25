# 📙 Day 4 — MongoDB + MySQL: The Data Layer
> **7-Day Full Stack Interview Prep** | Theory AM · Build PM

---

## 📚 Table of Contents

### 📖 MongoDB
1. [Document Model](#1-document-model)
2. [Collections vs Tables](#2-collections-vs-tables)
3. [BSON](#3-bson)
4. [CRUD Operations](#4-crud-operations)
5. [Aggregation Pipeline](#5-aggregation-pipeline)
6. [Indexes](#6-indexes)
7. [Schema Design — Embed vs Reference](#7-schema-design--embed-vs-reference)
8. [Mongoose ODM](#8-mongoose-odm)
9. [Mongoose Schema + Validation](#9-mongoose-schema--validation)
10. [populate()](#10-populate)
11. [Transactions in MongoDB](#11-transactions-in-mongodb)
12. [Replica Sets](#12-replica-sets)
13. [Sharding Basics](#13-sharding-basics)
14. [MongoDB Atlas](#14-mongodb-atlas)

### ⚡ MySQL / SQL
15. [SELECT / INSERT / UPDATE / DELETE](#15-select--insert--update--delete)
16. [WHERE / GROUP BY / HAVING / ORDER BY](#16-where--group-by--having--order-by)
17. [JOINs](#17-joins)
18. [Subqueries](#18-subqueries)
19. [UNION](#19-union)
20. [Indexes in SQL](#20-indexes-in-sql)
21. [PRIMARY KEY / FOREIGN KEY](#21-primary-key--foreign-key)
22. [Constraints](#22-constraints)
23. [Normalization — 1NF to 3NF](#23-normalization--1nf-to-3nf)
24. [ACID Properties](#24-acid-properties)
25. [Transactions — COMMIT / ROLLBACK](#25-transactions--commit--rollback)
26. [Stored Procedures](#26-stored-procedures)
27. [Views](#27-views)
28. [EXPLAIN Query Plan](#28-explain-query-plan)

### 🔥 Key Differences & When to Use What
29. [SQL vs NoSQL](#29-sql-vs-nosql)
30. [ACID vs BASE](#30-acid-vs-base)
31. [Horizontal vs Vertical Scaling](#31-horizontal-vs-vertical-scaling)
32. [When MongoDB > SQL](#32-when-mongodb--sql)
33. [When SQL > MongoDB](#33-when-sql--mongodb)
34. [ORMs — Sequelize / Prisma](#34-orms--sequelize--prisma)
35. [N+1 Problem](#35-n1-problem)
36. [Connection Pooling](#36-connection-pooling)
37. [Query Optimization](#37-query-optimization)
38. [Denormalization Trade-offs](#38-denormalization-trade-offs)
39. [CAP Theorem](#39-cap-theorem)

### [🏗️ Build Project](#build-project)
### [🧪 Quiz — 25 Questions](#quiz--25-questions)

---

# MONGODB

---

## 1. Document Model

MongoDB is a **document database** — data is stored as **BSON documents** (binary JSON objects), not rows and columns.

```
SQL (relational)                   MongoDB (document)
─────────────────────────────      ────────────────────────────────
Table: users                       Collection: users
┌────┬────────┬───────┐            {
│ id │  name  │ email │              _id: ObjectId("..."),
├────┼────────┼───────┤              name: "Alice",
│  1 │ Alice  │ a@... │              email: "a@...",
└────┴────────┴───────┘              address: {           ← embedded document
                                       city: "Delhi",
                                       pin: "110001"
                                     },
                                     tags: ["admin","user"] ← array
                                   }
```

**Key characteristics:**
- **Schema-flexible** — documents in the same collection can have different fields.
- **Self-contained** — related data can be embedded directly (no JOINs needed for reads).
- **Hierarchical** — supports nested documents and arrays natively.
- Documents can be up to **16 MB** each.

---

## 2. Collections vs Tables

| Concept | MongoDB | SQL |
|---|---|---|
| Database | Database | Database / Schema |
| Group of records | **Collection** | Table |
| Single record | **Document** | Row |
| Field name | **Field** / Key | Column |
| Unique identifier | `_id` (ObjectId) | Primary Key |
| Schema | Flexible (per document) | Fixed (defined upfront) |

```javascript
// MongoDB — no schema declaration needed, just insert
db.users.insertOne({ name: "Alice", email: "a@x.com" });
db.users.insertOne({ name: "Bob",   phone: "9999" }); // different fields — totally fine

// SQL — schema must match table definition
INSERT INTO users (name, email) VALUES ('Alice', 'a@x.com');
```

---

## 3. BSON

**BSON** (Binary JSON) is the binary-encoded serialisation format MongoDB uses to store documents.

**Why not plain JSON?**
- BSON supports **additional data types** JSON doesn't have: `Date`, `ObjectId`, `Binary`, `Decimal128`, `Int32/Int64`, `Timestamp`, `Regex`.
- BSON is **faster to parse** for databases — length-prefixed, so fields can be skipped without parsing.
- BSON is **more space-efficient** for binary data.

```javascript
// What you write (JS/JSON-like):
{ name: "Alice", createdAt: new Date(), score: 95.5 }

// How MongoDB stores it (BSON — binary):
// - name    → type 0x02 (String) + length + bytes
// - createdAt → type 0x09 (UTC DateTime) + 8-byte int
// - score   → type 0x01 (Double) + 8-byte float

// ObjectId — 12-byte unique identifier:
// [4 bytes timestamp][5 bytes random][3 bytes incrementing counter]
ObjectId("64c7f2a1b3e4d5f6a7b8c9d0")
//        ^^^^^^^^ timestamp → contains creation time!
const id = new ObjectId("64c7f2a1b3e4d5f6a7b8c9d0");
id.getTimestamp(); // → creation date, no separate createdAt needed!
```

---

## 4. CRUD Operations

```javascript
// ─── CREATE ───────────────────────────────────────────
db.users.insertOne({ name: "Alice", age: 28, city: "Delhi" });
// returns: { acknowledged: true, insertedId: ObjectId("...") }

db.users.insertMany([
  { name: "Bob",   age: 32 },
  { name: "Carol", age: 25 },
]);

// ─── READ ─────────────────────────────────────────────
db.users.find({});                             // all documents
db.users.find({ city: "Delhi" });              // filter
db.users.find({ age: { $gte: 25, $lt: 35 } }); // range query
db.users.find({ tags: { $in: ["admin"] } });   // array contains
db.users.find({ name: /^A/ });                 // regex

// Projection — select fields (1 = include, 0 = exclude)
db.users.find({ city: "Delhi" }, { name: 1, email: 1, _id: 0 });

db.users.findOne({ _id: ObjectId("...") });    // single doc
db.users.countDocuments({ city: "Delhi" });    // count

// Sorting, skipping, limiting
db.users.find({}).sort({ age: -1 }).skip(10).limit(10);

// ─── UPDATE ───────────────────────────────────────────
db.users.updateOne(
  { _id: ObjectId("...") },         // filter
  { $set: { city: "Mumbai" } }      // update operator
);

db.users.updateMany(
  { city: "Delhi" },
  { $inc: { age: 1 } }              // increment
);

// Common update operators:
// $set   — set a field value
// $unset — remove a field
// $inc   — increment a number
// $push  — append to an array
// $pull  — remove from an array
// $addToSet — add to array only if not already present

db.users.findOneAndUpdate(
  { email: "a@x.com" },
  { $set: { active: true } },
  { returnDocument: "after", upsert: true } // create if not found
);

// ─── DELETE ───────────────────────────────────────────
db.users.deleteOne({ _id: ObjectId("...") });
db.users.deleteMany({ active: false });
```

---

## 5. Aggregation Pipeline

The **aggregation pipeline** is MongoDB's way to process and transform documents through a series of stages. Think of it as a Unix pipe for your data.

```
Collection ──▶ $match ──▶ $group ──▶ $project ──▶ $sort ──▶ Result
```

### Core Stages

```javascript
db.orders.aggregate([

  // $match — filter documents (like WHERE in SQL)
  { $match: { status: "completed", date: { $gte: new Date("2024-01-01") } } },

  // $group — aggregate values (like GROUP BY + aggregate functions)
  {
    $group: {
      _id: "$customerId",            // group by this field
      totalSpent: { $sum: "$amount" },
      orderCount: { $count: {} },
      avgAmount:  { $avg: "$amount" },
      lastOrder:  { $max: "$date" },
    }
  },

  // $project — reshape documents (like SELECT)
  {
    $project: {
      _id: 0,
      customerId: "$_id",
      totalSpent: 1,
      orderCount: 1,
      avgAmount:  { $round: ["$avgAmount", 2] }
    }
  },

  // $sort — order results
  { $sort: { totalSpent: -1 } },

  // $limit / $skip — pagination
  { $skip: 0 },
  { $limit: 10 },
]);
```

### $lookup — the JOIN equivalent

```javascript
// Join orders with users collection
db.orders.aggregate([
  {
    $lookup: {
      from: "users",              // collection to join
      localField: "userId",       // field in orders
      foreignField: "_id",        // field in users
      as: "user"                  // output array field name
    }
  },
  { $unwind: "$user" },           // flatten the array to single object
  { $project: { amount: 1, "user.name": 1, "user.email": 1 } }
]);
```

### Other useful stages

```javascript
// $unwind — deconstruct an array field into separate documents
db.posts.aggregate([
  { $unwind: "$tags" },           // one doc per tag
  { $group: { _id: "$tags", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

// $addFields — add computed fields
{ $addFields: { fullName: { $concat: ["$firstName", " ", "$lastName"] } } }

// $facet — multiple aggregation pipelines in one query
{
  $facet: {
    byCategory: [{ $group: { _id: "$category", count: { $sum: 1 } } }],
    byStatus:   [{ $group: { _id: "$status",   count: { $sum: 1 } } }],
  }
}
```

---

## 6. Indexes

An **index** is a data structure (B-Tree by default) that allows MongoDB to find documents without scanning the entire collection.

```javascript
// Without index: COLLSCAN — scans every document (O(n))
// With index:    IXSCAN   — follows B-tree path (O(log n))

// Single field index
db.users.createIndex({ email: 1 });        // 1 = ascending, -1 = descending
db.users.createIndex({ email: 1 }, { unique: true }); // enforce uniqueness

// Compound index — order matters!
db.orders.createIndex({ userId: 1, date: -1 });
// Supports queries on: userId alone, or userId + date
// Does NOT efficiently support: date alone

// Text index — full-text search
db.posts.createIndex({ title: "text", body: "text" });
db.posts.find({ $text: { $search: "mongodb aggregation" } });

// Geospatial index — location-based queries
db.places.createIndex({ location: "2dsphere" });
db.places.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [77.2, 28.6] },
      $maxDistance: 5000  // 5km
    }
  }
});

// TTL index — auto-expire documents
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
// MongoDB automatically deletes docs 1 hour after createdAt

// Sparse index — only indexes docs where field exists
db.users.createIndex({ phone: 1 }, { sparse: true });

// Check indexes and query plans
db.users.getIndexes();
db.users.find({ email: "a@x.com" }).explain("executionStats");
// Look for: winningPlan.stage = "IXSCAN" ✅, not "COLLSCAN" ❌
```

**Index trade-offs:**
- ✅ Faster reads / queries
- ❌ Slower writes (index must be updated on insert/update/delete)
- ❌ More disk space and RAM usage
- Rule: index fields you frequently query/sort/filter on. Don't over-index.

---

## 7. Schema Design — Embed vs Reference

The most important MongoDB design decision. Unlike SQL (always normalise), MongoDB gives you a choice.

### Embed (denormalise)
```javascript
// Posts with embedded comments
{
  _id: ObjectId("..."),
  title: "My Post",
  body: "...",
  comments: [                    // embedded array
    { author: "Bob", text: "Great!", date: ISODate("...") },
    { author: "Carol", text: "Thanks!", date: ISODate("...") },
  ]
}
// ✅ One query to get post + all comments
// ✅ Atomic updates on post + comments together
// ❌ Document size grows — 16MB limit
// ❌ Can't query comments independently (no separate index)
// ❌ High-cardinality arrays = large docs
```

### Reference (normalise)
```javascript
// Posts collection
{ _id: ObjectId("post1"), title: "My Post", authorId: ObjectId("user1") }

// Users collection
{ _id: ObjectId("user1"), name: "Alice", email: "a@x.com" }

// ✅ Independent querying of each collection
// ✅ No document size limit concern
// ✅ Author data updated in one place
// ❌ Needs $lookup / .populate() — multiple queries
```

### Decision guide

| Factor | Embed | Reference |
|---|---|---|
| Relationship | 1-to-few | 1-to-many / many-to-many |
| Data changes often? | ❌ (embedded copies go stale) | ✅ (single source of truth) |
| Query together? | ✅ Always | ❌ Sometimes |
| Max items in array | Small, bounded | Unbounded |
| Access independently? | ❌ No | ✅ Yes |

> **Rule of thumb:** Embed data that you always read together and rarely update independently. Reference data that changes frequently or has high cardinality.

---

## 8. Mongoose ODM

**Mongoose** is an Object Document Mapper (ODM) for MongoDB in Node.js — it adds schema validation, middleware (hooks), virtuals, and query building on top of the native driver.

```javascript
const mongoose = require('mongoose');

// Connect
await mongoose.connect(process.env.MONGO_URI);
// mongoose.connect returns a promise; mongoose handles reconnects automatically

// Disconnect
await mongoose.disconnect();

// Connection events
mongoose.connection.on('connected',    () => console.log('MongoDB connected'));
mongoose.connection.on('error',        err => console.error('MongoDB error:', err));
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));
```

---

## 9. Mongoose Schema + Validation

```javascript
const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age too large'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    password: { type: String, required: true, select: false }, // excluded by default
    active:   { type: Boolean, default: true },
    posts:    [{ type: Schema.Types.ObjectId, ref: 'Post' }],  // reference
    address:  {                                                  // embedded sub-document
      city:    String,
      country: { type: String, default: 'India' },
    },
  },
  {
    timestamps: true,  // adds createdAt and updatedAt automatically
    versionKey: false, // removes __v field
  }
);

// ─── Virtuals — computed properties not stored in DB
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ─── Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Static methods
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

// ─── Middleware (hooks)
// Pre-save — hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // only hash if changed
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Post-save — logging, events
userSchema.post('save', function (doc) {
  console.log(`User saved: ${doc.email}`);
});

// ─── Query middleware
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } }); // exclude inactive users from all find queries
  next();
});

const User = model('User', userSchema);
module.exports = User;
```

---

## 10. populate()

`populate()` replaces a referenced ObjectId with the actual document from another collection — like an auto-JOIN.

```javascript
const postSchema = new Schema({
  title:    String,
  body:     String,
  author:   { type: Schema.Types.ObjectId, ref: 'User' },   // reference
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
});

// Basic populate
const post = await Post.findById(id).populate('author');
// post.author is now a full User object, not just an ObjectId

// Selective populate — only get specific fields
const post = await Post
  .findById(id)
  .populate('author', 'name email -password'); // select name+email, exclude password

// Deep populate — chain populations
const post = await Post
  .findById(id)
  .populate({
    path: 'comments',
    populate: {
      path: 'author',   // populate author inside each comment
      select: 'name'
    }
  });

// Multiple populates
const post = await Post
  .findById(id)
  .populate('author', 'name')
  .populate('category', 'name slug');
```

> **Performance note:** `populate()` makes separate queries per populated field — it's NOT a true JOIN. For complex data access patterns, consider `$lookup` in the aggregation pipeline instead.

---

## 11. Transactions in MongoDB

MongoDB supports **multi-document ACID transactions** (since v4.0, requires replica set).

```javascript
const session = await mongoose.startSession();

try {
  session.startTransaction();

  // All operations in same session = same transaction
  const user = await User.create([{ name: 'Alice', balance: 1000 }], { session });

  await Account.create([{
    userId: user[0]._id,
    type: 'savings',
    balance: 1000
  }], { session });

  // Transfer money atomically
  await Account.updateOne(
    { userId: senderId },
    { $inc: { balance: -500 } },
    { session }
  );
  await Account.updateOne(
    { userId: recipientId },
    { $inc: { balance: 500 } },
    { session }
  );

  await session.commitTransaction();
  console.log('Transaction committed!');

} catch (error) {
  await session.abortTransaction(); // all changes rolled back
  console.error('Transaction aborted:', error);
  throw error;

} finally {
  session.endSession();
}
```

**When do you need transactions?**
- Transferring money / points between accounts
- Creating an order + decrementing inventory simultaneously
- Any operation that must succeed or fail as a whole across multiple documents/collections

**Without transactions:** MongoDB guarantees atomicity only at the **single document** level. Multi-document operations without transactions can leave data in inconsistent states if something fails midway.

---

## 12. Replica Sets

A **replica set** is a group of MongoDB servers that maintain the same data — providing **high availability** and **data redundancy**.

```
Primary ──────────────────────────────────────────────────
   │                                                      │
   │ replication (oplog)                                  │
   ▼                                                      ▼
Secondary 1 (reads)                              Secondary 2 (reads)
 (hot standby)                                   (hot standby)

If Primary goes down → election → Secondary becomes new Primary (in ~10 seconds)
```

**Key points:**
- **Primary:** handles all writes and (by default) reads.
- **Secondary:** replicate data from primary via the **oplog** (operations log). Can serve reads with `readPreference: secondary`.
- **Arbiter:** votes in elections but holds no data.
- Minimum recommended: **3 members** (1 primary + 2 secondaries) for automatic failover.
- Required for **transactions** in MongoDB.

```javascript
// Connect to replica set in Mongoose
mongoose.connect('mongodb://host1:27017,host2:27017,host3:27017/mydb?replicaSet=rs0');

// Read preference
mongoose.connect(uri, { readPreference: 'secondaryPreferred' });
// reads go to secondary when available, primary as fallback
```

---

## 13. Sharding Basics

**Sharding** is MongoDB's approach to **horizontal scaling** — distributing data across multiple servers (shards) to handle datasets that exceed a single server's capacity.

```
Client
  │
  ▼
mongos (router) ─── config servers (metadata)
  │
  ├── Shard 1 (data for users A–G)
  ├── Shard 2 (data for users H–P)
  └── Shard 3 (data for users Q–Z)
```

**Shard key:** the field MongoDB uses to determine which shard a document goes to.

```javascript
// Enable sharding on a database
sh.enableSharding("mydb");

// Shard a collection by a key
sh.shardCollection("mydb.users", { country: 1 });  // range-based sharding
sh.shardCollection("mydb.events", { userId: "hashed" }); // hash-based (even distribution)
```

**Types:**
- **Range sharding** — documents with similar shard key values go to same shard. Good for range queries, bad if key is monotonically increasing (hotspot).
- **Hash sharding** — hashes the shard key for even distribution. Good for write throughput, bad for range queries.

> **Interview tip:** Shard key choice is critical and irreversible. A poor shard key causes hotspots (one shard gets all traffic). Good shard keys: high cardinality, evenly distributed, frequently used in queries.

---

## 14. MongoDB Atlas

**MongoDB Atlas** is MongoDB's fully managed cloud database service (AWS, GCP, Azure).

**What it provides:**
- Automated provisioning, backups, and patching
- Built-in replica sets (minimum 3 nodes)
- Auto-scaling (storage and compute)
- **Atlas Search** — full-text search (built on Lucene)
- **Atlas Data API** — REST API without a driver
- **Atlas Triggers** — event-driven functions on DB changes
- **Charts** — built-in data visualisation
- Free tier: M0 (512 MB, shared cluster)

```javascript
// Atlas connection string (from Atlas UI)
mongoose.connect(
  'mongodb+srv://username:password@cluster0.abc123.mongodb.net/mydb?retryWrites=true&w=majority'
);
// mongodb+srv:// = DNS SRV lookup → auto-discovers all nodes in the cluster
```

---

# MYSQL / SQL

---

## 15. SELECT / INSERT / UPDATE / DELETE

```sql
-- ─── CREATE TABLE ─────────────────────────────────────
CREATE TABLE users (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  age        INT,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─── INSERT ───────────────────────────────────────────
INSERT INTO users (name, email, age) VALUES ('Alice', 'a@x.com', 28);

-- Multiple rows
INSERT INTO users (name, email) VALUES
  ('Bob',   'b@x.com'),
  ('Carol', 'c@x.com');

-- ─── SELECT ───────────────────────────────────────────
SELECT * FROM users;
SELECT name, email FROM users WHERE age > 25;
SELECT DISTINCT city FROM users;              -- unique values
SELECT COUNT(*) FROM users;                   -- aggregate
SELECT name, age, UPPER(name) AS upper_name FROM users;

-- ─── UPDATE ───────────────────────────────────────────
UPDATE users SET age = 29 WHERE email = 'a@x.com';
UPDATE users SET active = 0 WHERE last_login < '2023-01-01';

-- ─── DELETE ───────────────────────────────────────────
DELETE FROM users WHERE id = 5;
DELETE FROM users WHERE active = 0;
TRUNCATE TABLE users;  -- delete ALL rows, reset AUTO_INCREMENT (no WHERE)
```

---

## 16. WHERE / GROUP BY / HAVING / ORDER BY

```sql
-- WHERE — filter individual rows (before grouping)
SELECT * FROM orders
WHERE status = 'completed'
  AND amount > 100
  AND created_at BETWEEN '2024-01-01' AND '2024-12-31';

-- Operators: =, !=, <, >, <=, >=, BETWEEN, IN, LIKE, IS NULL, IS NOT NULL
SELECT * FROM users WHERE name LIKE 'A%';         -- starts with A
SELECT * FROM users WHERE city IN ('Delhi', 'Mumbai');
SELECT * FROM users WHERE phone IS NULL;

-- ORDER BY — sort results
SELECT * FROM users ORDER BY age DESC;              -- descending
SELECT * FROM users ORDER BY city ASC, name ASC;   -- multi-column sort

-- GROUP BY — aggregate rows with same value
SELECT city, COUNT(*) AS user_count, AVG(age) AS avg_age
FROM users
GROUP BY city;
-- Returns one row per distinct city value

-- HAVING — filter on aggregated results (WHERE for groups)
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city
HAVING COUNT(*) > 10;   -- only cities with more than 10 users
-- ⚠️ WHERE filters BEFORE grouping; HAVING filters AFTER grouping

-- Full query — execution order:
-- FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
SELECT city, COUNT(*) AS cnt
FROM users
WHERE active = 1           -- 1. filter rows
GROUP BY city              -- 2. group
HAVING cnt > 5             -- 3. filter groups
ORDER BY cnt DESC          -- 4. sort
LIMIT 10;                  -- 5. paginate
```

---

## 17. JOINs

JOINs combine rows from two or more tables based on a related column.

```sql
-- Tables:
-- users:   id, name, email
-- orders:  id, user_id, amount, status

-- ─── INNER JOIN — only matching rows in BOTH tables ───
SELECT u.name, o.amount, o.status
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
-- Users with NO orders are excluded; Orders with no matching user are excluded

-- ─── LEFT JOIN — all rows from LEFT + matching from right ─
SELECT u.name, o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- All users included; users with no orders get NULL in order columns

-- ─── RIGHT JOIN — all rows from RIGHT + matching from left ─
SELECT u.name, o.amount
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
-- All orders included (rarely used; usually rewrite as LEFT JOIN)

-- ─── FULL OUTER JOIN — all rows from BOTH tables ─────
SELECT u.name, o.amount
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;
-- MySQL doesn't support FULL OUTER JOIN directly — emulate:
SELECT u.name, o.amount FROM users u LEFT JOIN orders o ON u.id = o.user_id
UNION
SELECT u.name, o.amount FROM users u RIGHT JOIN orders o ON u.id = o.user_id;

-- ─── SELF JOIN — join a table with itself ─────────────
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- ─── Multiple JOINs ───────────────────────────────────
SELECT u.name, o.id AS order_id, p.name AS product
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.status = 'completed';
```

```
Venn Diagram Summary:
INNER JOIN  =  A ∩ B  (intersection only)
LEFT JOIN   =  A + A∩B  (all of A, matching from B)
RIGHT JOIN  =  B + A∩B  (all of B, matching from A)
FULL JOIN   =  A ∪ B  (everything from both)
```

---

## 18. Subqueries

A **subquery** is a query nested inside another query.

```sql
-- Subquery in WHERE — users who have placed orders
SELECT name FROM users
WHERE id IN (SELECT DISTINCT user_id FROM orders);

-- Subquery in WHERE — users who spent more than average
SELECT name FROM users
WHERE id IN (
  SELECT user_id FROM orders
  GROUP BY user_id
  HAVING SUM(amount) > (SELECT AVG(amount) FROM orders)
);

-- Correlated subquery — references outer query (runs once per row)
SELECT u.name,
  (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
FROM users u;
-- ⚠️ N+1 problem! Correlated subqueries are slow on large tables

-- Subquery in FROM (derived table)
SELECT city, avg_age
FROM (
  SELECT city, AVG(age) AS avg_age
  FROM users
  GROUP BY city
) AS city_stats
WHERE avg_age > 30;

-- EXISTS — check if subquery returns any row (faster than IN for large sets)
SELECT name FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.amount > 1000);
```

---

## 19. UNION

`UNION` combines result sets of two `SELECT` statements.

```sql
-- UNION — removes duplicates (like DISTINCT)
SELECT name FROM customers
UNION
SELECT name FROM suppliers;

-- UNION ALL — keeps duplicates (faster, no de-dup step)
SELECT name, 'customer' AS type FROM customers
UNION ALL
SELECT name, 'supplier' AS type FROM suppliers;

-- Rules:
-- 1. Both SELECTs must have same number of columns
-- 2. Columns must have compatible data types
-- 3. Column names come from the FIRST SELECT
-- 4. Can ORDER BY at the end (applies to full result)

SELECT name FROM customers
UNION ALL
SELECT name FROM suppliers
ORDER BY name;
```

---

## 20. Indexes in SQL

```sql
-- Create index
CREATE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at); -- compound

-- Drop index
DROP INDEX idx_users_email ON users;

-- MySQL auto-creates indexes on PRIMARY KEY and UNIQUE constraints
-- Check indexes
SHOW INDEX FROM users;

-- When MySQL uses an index (sargable conditions):
WHERE email = 'a@x.com'           -- ✅ equality
WHERE age BETWEEN 20 AND 30       -- ✅ range
WHERE name LIKE 'Al%'             -- ✅ prefix wildcard

-- When MySQL CANNOT use an index:
WHERE UPPER(name) = 'ALICE'       -- ❌ function on column
WHERE name LIKE '%alice%'         -- ❌ leading wildcard
WHERE age + 1 = 29                -- ❌ arithmetic on column

-- Covering index — all needed columns are in the index (no table lookup needed)
CREATE INDEX idx_covering ON orders(user_id, status, amount);
SELECT amount FROM orders WHERE user_id = 1 AND status = 'completed';
-- MySQL satisfies this query entirely from the index — very fast!
```

---

## 21. PRIMARY KEY / FOREIGN KEY

```sql
-- PRIMARY KEY — unique identifier for each row, not null
CREATE TABLE users (
  id    INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY (email)
);

-- FOREIGN KEY — enforces referential integrity
CREATE TABLE orders (
  id      INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount  DECIMAL(10,2),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE    -- delete orders when user deleted
    ON UPDATE CASCADE    -- update user_id in orders if user's id changes
);

-- ON DELETE / ON UPDATE options:
-- CASCADE    — propagate delete/update to child rows
-- SET NULL   — set child FK column to NULL
-- RESTRICT   — block delete/update if child rows exist (default)
-- NO ACTION  — same as RESTRICT in MySQL

-- Composite primary key
CREATE TABLE order_items (
  order_id   INT,
  product_id INT,
  quantity   INT,
  PRIMARY KEY (order_id, product_id),  -- composite PK
  FOREIGN KEY (order_id)   REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 22. Constraints

```sql
CREATE TABLE products (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,                           -- NOT NULL
  sku         VARCHAR(50)  NOT NULL UNIQUE,                    -- UNIQUE
  price       DECIMAL(10,2) NOT NULL DEFAULT 0.00,            -- DEFAULT
  stock       INT          NOT NULL DEFAULT 0,
  category_id INT,
  CONSTRAINT chk_price CHECK (price >= 0),                    -- CHECK
  CONSTRAINT chk_stock CHECK (stock >= 0),
  FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL
);

-- NOT NULL     — column cannot be empty
-- UNIQUE       — no two rows can have same value (nulls allowed, and are always unique)
-- DEFAULT      — value used when not specified on INSERT
-- CHECK        — custom validation condition (MySQL 8.0.16+ enforces fully)
-- PRIMARY KEY  — NOT NULL + UNIQUE + clustered index
-- FOREIGN KEY  — referential integrity

-- Named constraints (easier to drop/reference)
ALTER TABLE products
  ADD CONSTRAINT chk_price CHECK (price >= 0);

ALTER TABLE products
  DROP CONSTRAINT chk_price;
```

---

## 23. Normalization — 1NF to 3NF

Normalization organises a database to **reduce data redundancy** and **improve data integrity** by following a set of rules (normal forms).

### First Normal Form (1NF)
- Each column contains **atomic** (indivisible) values.
- Each column contains values of a **single type**.
- Each row is **unique** (has a primary key).

```sql
-- ❌ Violates 1NF — multiple values in one cell
id | name  | phones
1  | Alice | 9999, 8888   ← not atomic!

-- ✅ 1NF
id | name  | phone
1  | Alice | 9999
1  | Alice | 8888   ← separate rows
```

### Second Normal Form (2NF)
- Must be in 1NF.
- Every non-key column must depend on the **entire** primary key (no partial dependency).
- Only relevant when the primary key is **composite**.

```sql
-- ❌ Violates 2NF (composite PK: order_id + product_id)
order_id | product_id | quantity | product_name
-- product_name depends only on product_id, not on the full PK!

-- ✅ 2NF — separate table for products
orders_items: (order_id, product_id, quantity)
products:     (product_id, product_name)
```

### Third Normal Form (3NF)
- Must be in 2NF.
- No **transitive dependencies** — non-key columns must depend only on the primary key, not on other non-key columns.

```sql
-- ❌ Violates 3NF
id | name | zip   | city
-- city depends on zip, not on id → transitive dependency!

-- ✅ 3NF
users:  (id, name, zip)
zips:   (zip, city)
```

> **Boyce-Codd Normal Form (BCNF):** stricter version of 3NF — every determinant must be a candidate key.

**OLTP databases** are typically normalised to 3NF for data integrity.
**OLAP / reporting databases** are often intentionally denormalised (star schema) for query speed.

---

## 24. ACID Properties

**ACID** is a set of properties that guarantee database transactions are processed reliably.

| Property | Meaning | Example |
|---|---|---|
| **Atomicity** | All operations succeed or all fail — no partial transactions | Transfer ₹500: debit + credit both happen or neither does |
| **Consistency** | Transaction brings DB from one valid state to another — all constraints satisfied | After transfer, total money in system stays the same |
| **Isolation** | Concurrent transactions don't interfere with each other | Two users checking out the last item can't both succeed |
| **Durability** | Once committed, data persists even if the system crashes | After commit, the data survives a power failure |

```sql
-- Without ACID — nightmare scenario:
-- Thread 1: reads balance = 1000, subtracts 500
-- Thread 2: reads balance = 1000, subtracts 800  ← reads before Thread 1 commits!
-- Thread 1: writes 500
-- Thread 2: writes 200  ← ❌ should be -300 → violates consistency

-- With ACID transactions: this is prevented by locking / MVCC
```

### Isolation Levels (Read Phenomena)

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|---|---|---|---|
| READ UNCOMMITTED | ✅ possible | ✅ possible | ✅ possible |
| READ COMMITTED | ❌ prevented | ✅ possible | ✅ possible |
| REPEATABLE READ | ❌ prevented | ❌ prevented | ✅ possible (MySQL MVCC mostly prevents) |
| SERIALIZABLE | ❌ prevented | ❌ prevented | ❌ prevented |

MySQL InnoDB default: **REPEATABLE READ**

---

## 25. Transactions — COMMIT / ROLLBACK

```sql
-- Start a transaction
START TRANSACTION;   -- or BEGIN;

-- Transfer ₹500 from Alice to Bob
UPDATE accounts SET balance = balance - 500 WHERE user_id = 1;

-- Check for errors before continuing
-- If Alice's balance would go negative, ROLLBACK

UPDATE accounts SET balance = balance + 500 WHERE user_id = 2;

-- All good → commit
COMMIT;

-- ── Error handling (in application code) ──────────────
START TRANSACTION;
UPDATE accounts SET balance = balance - 500 WHERE user_id = 1;
-- if error: ROLLBACK;
UPDATE accounts SET balance = balance + 500 WHERE user_id = 2;
-- if error: ROLLBACK;
COMMIT;

-- SAVEPOINT — partial rollback
START TRANSACTION;
INSERT INTO orders (...) VALUES (...);
SAVEPOINT after_order;

INSERT INTO payments (...) VALUES (...);
-- Payment fails:
ROLLBACK TO SAVEPOINT after_order;  -- keeps the order, undoes payment
-- Try again or ROLLBACK fully
COMMIT;

-- Autocommit (MySQL default = ON — each statement is its own transaction)
SET autocommit = 0;  -- disable for explicit transaction control
```

---

## 26. Stored Procedures

A **stored procedure** is a reusable SQL script stored in the database, called by name.

```sql
-- Create stored procedure
DELIMITER $$

CREATE PROCEDURE GetUserOrders(
  IN  p_user_id INT,
  IN  p_status  VARCHAR(50),
  OUT p_count   INT
)
BEGIN
  -- Select orders
  SELECT o.id, o.amount, o.created_at
  FROM orders o
  WHERE o.user_id = p_user_id
    AND (p_status IS NULL OR o.status = p_status)
  ORDER BY o.created_at DESC;

  -- Set output parameter
  SELECT COUNT(*) INTO p_count
  FROM orders
  WHERE user_id = p_user_id;
END$$

DELIMITER ;

-- Call the procedure
CALL GetUserOrders(1, 'completed', @total);
SELECT @total;  -- read output parameter

-- Drop
DROP PROCEDURE IF EXISTS GetUserOrders;
```

**Pros:** reduced network round-trips, reusable logic, security (grant execute without exposing tables).
**Cons:** hard to version control, logic in DB is harder to test, vendor lock-in.

---

## 27. Views

A **view** is a stored SQL query that behaves like a virtual table.

```sql
-- Create a view
CREATE VIEW active_users AS
SELECT id, name, email, created_at
FROM users
WHERE active = 1;

-- Use it like a table
SELECT * FROM active_users WHERE name LIKE 'A%';
SELECT COUNT(*) FROM active_users;

-- Updatable views — you can INSERT/UPDATE/DELETE (with restrictions)
UPDATE active_users SET name = 'Alice B.' WHERE id = 1;
-- Internally updates the users table

-- Non-updatable (e.g., involves GROUP BY, DISTINCT, aggregates)
CREATE VIEW city_stats AS
SELECT city, COUNT(*) AS cnt, AVG(age) AS avg_age
FROM users
GROUP BY city;
-- SELECT only — can't INSERT/UPDATE

-- Drop view
DROP VIEW IF EXISTS active_users;
```

**Benefits:**
- Abstract complex joins into a simple interface
- Security — expose only specific columns/rows to certain users
- Simplify queries for reporting

---

## 28. EXPLAIN Query Plan

`EXPLAIN` shows how MySQL executes a query — critical for performance tuning.

```sql
EXPLAIN SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.active = 1
GROUP BY u.id;
```

**Key columns to read:**

| Column | What to look for |
|---|---|
| `type` | `system` > `const` > `eq_ref` > `ref` > `range` > `index` > **`ALL`** (bad!) |
| `key` | Which index is used (`NULL` = no index!) |
| `rows` | Estimated rows scanned — lower is better |
| `Extra` | `Using index` ✅, `Using filesort` ⚠️, `Using temporary` ⚠️ |

```sql
-- type: ALL = full table scan = add an index!
-- type: ref = index used = good
-- key: NULL = no index = bad (consider adding one)

-- EXPLAIN ANALYZE (MySQL 8.0+) — actually runs the query and shows real times
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 1 AND status = 'completed';

-- If you see "Using filesort" or "Using temporary":
-- → ORDER BY or GROUP BY can't use an index → consider adding a compound index
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

---

# KEY DIFFERENCES & WHEN TO USE WHAT

---

## 29. SQL vs NoSQL

| Feature | SQL (MySQL, PostgreSQL) | NoSQL (MongoDB) |
|---|---|---|
| Data model | Tables + rows (relational) | Documents / Key-Value / Column / Graph |
| Schema | Fixed, defined upfront | Flexible, can vary per doc |
| Relationships | JOINs (normalised) | Embedded or referenced |
| Scaling | Vertical (mostly) | Horizontal (built-in sharding) |
| Transactions | ACID, mature | Multi-doc ACID (needs replica set) |
| Query language | SQL (standardised) | Query API (MongoDB-specific) |
| Best for | Structured data, complex joins | Unstructured/semi-structured, rapid schema changes |

---

## 30. ACID vs BASE

**ACID** (SQL / strong consistency):
- **A**tomicity — all or nothing
- **C**onsistency — rules always enforced
- **I**solation — concurrent transactions don't interfere
- **D**urability — committed data survives crashes

**BASE** (NoSQL / eventual consistency):
- **B**asically **A**vailable — system always responds (even with stale data)
- **S**oft state — state may change without input (data syncing)
- **E**ventual consistency — system will eventually become consistent

```
ACID: Bank transfer
  "I need to know the balance is EXACTLY correct right now."

BASE: Social media like count
  "It's OK if the like count is 999 vs 1000 for a few seconds."
```

> Choosing between ACID and BASE is a business decision about how much consistency vs availability matters for your use case.

---

## 31. Horizontal vs Vertical Scaling

| | Vertical Scaling (Scale Up) | Horizontal Scaling (Scale Out) |
|---|---|---|
| Method | Bigger machine (more CPU, RAM) | More machines |
| Cost | Expensive, has hardware limits | Cheaper at scale |
| Complexity | Simple | Complex (data distribution, consistency) |
| SQL databases | Natural fit | Hard (sharding is complex) |
| MongoDB | Supported | Native (sharding, replica sets) |
| Downtime | Usually requires restart | Can be done live |

```
Vertical:   [Server 1: 8 core → 32 core]

Horizontal: [Server 1: 8 core] + [Server 2: 8 core] + [Server 3: 8 core]
```

---

## 32. When MongoDB > SQL

Use **MongoDB** when:
- **Schema flexibility** is needed — fields vary across documents (product catalog with different attributes per category)
- **Rapid iteration** — schema changes often during development
- **Document-oriented data** — data naturally nested (user with embedded address, order with embedded line items)
- **Horizontal scaling** is a priority — massive write throughput, huge datasets
- **Unstructured/semi-structured data** — logs, events, IoT sensor data, CMS content
- **Real-time analytics** — flexible queries on evolving data shapes
- **Geospatial queries** — native 2dsphere indexes

---

## 33. When SQL > MongoDB

Use **SQL** when:
- **Complex relationships** with many-to-many joins are central (e.g., ERP, CRM, accounting)
- **Data integrity** is critical — foreign keys, constraints, strict ACID across all operations
- **Reporting and analytics** — complex GROUP BY, window functions, JOINs across many tables
- **Structured, stable schema** — data model is well-defined and unlikely to change
- **Regulatory compliance** — financial systems, healthcare (HIPAA) often require relational guarantees
- **Team expertise** — SQL knowledge is ubiquitous; MongoDB expertise is less common

---

## 34. ORMs — Sequelize / Prisma

**ORMs** (Object-Relational Mappers) let you interact with SQL databases using JavaScript objects instead of raw SQL.

### Sequelize (mature, widely used)
```javascript
const { DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);

class User extends Model {}
User.init({
  name:  { type: DataTypes.STRING,  allowNull: false },
  email: { type: DataTypes.STRING,  allowNull: false, unique: true },
  age:   { type: DataTypes.INTEGER, validate: { min: 0 } },
}, { sequelize, modelName: 'User', timestamps: true });

// CRUD
const user  = await User.create({ name: 'Alice', email: 'a@x.com' });
const users = await User.findAll({ where: { age: { [Op.gte]: 25 } } });
const alice = await User.findOne({ where: { email: 'a@x.com' } });
await User.update({ age: 30 }, { where: { id: user.id } });
await user.destroy();

// Associations
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
const userWithOrders = await User.findByPk(id, { include: Order });
```

### Prisma (modern, type-safe)
```javascript
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  orders    Order[]
  createdAt DateTime @default(now())
}

model Order {
  id     Int    @id @default(autoincrement())
  amount Float
  userId Int
  user   User   @relation(fields: [userId], references: [id])
}

// Usage (fully type-safe)
const user = await prisma.user.create({ data: { name: 'Alice', email: 'a@x.com' } });
const users = await prisma.user.findMany({ where: { orders: { some: { amount: { gt: 100 } } } } });
const userWithOrders = await prisma.user.findUnique({
  where: { id: 1 },
  include: { orders: true }
});
```

| | Sequelize | Prisma |
|---|---|---|
| Type safety | Partial | Excellent (auto-generated types) |
| Learning curve | Medium | Low (intuitive API) |
| Raw SQL | Easy | `prisma.$queryRaw` |
| Migrations | Manual | `prisma migrate dev` |
| Maturity | Very mature | Modern, rapidly evolving |

---

## 35. N+1 Problem

The **N+1 problem** occurs when fetching a list of N records and then making an additional query for each one — resulting in N+1 total queries instead of 1 or 2.

```javascript
// ❌ N+1 Problem (SQL example)
const users = await User.findAll();          // Query 1: SELECT * FROM users (N rows)
for (const user of users) {
  user.orders = await Order.findAll({        // Query 2..N+1: one query PER user!
    where: { userId: user.id }
  });
}
// 100 users = 101 queries!

// ✅ Fix — eager loading (1-2 queries total)
const users = await User.findAll({
  include: [{ model: Order }]               // JOIN in one query
});

// ✅ Fix — DataLoader (batching, used in GraphQL)
const DataLoader = require('dataloader');
const orderLoader = new DataLoader(async (userIds) => {
  const orders = await Order.findAll({ where: { userId: userIds } });
  return userIds.map(id => orders.filter(o => o.userId === id));
});
// All N userIds are collected and fetched in ONE batch query

// MongoDB N+1 — same problem
// ❌
const posts = await Post.find({});
for (const post of posts) {
  post.author = await User.findById(post.authorId); // N extra queries
}

// ✅ Fix — populate or $lookup
const posts = await Post.find({}).populate('authorId', 'name email');
```

---

## 36. Connection Pooling

Opening a new database connection for every request is expensive (TCP handshake, auth, session setup — ~50-100ms).

**Connection pooling** maintains a pool of reusable, pre-opened connections.

```javascript
// Mongoose — built-in pooling
mongoose.connect(uri, {
  maxPoolSize: 10,         // max simultaneous connections (default: 5)
  minPoolSize: 2,          // always keep 2 connections open
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// MySQL2 + pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydb',
  connectionLimit: 10,     // max connections in pool
  queueLimit: 0,           // unlimited queue when pool is full
});

// Use promise pool
const [rows] = await pool.promise().query('SELECT * FROM users WHERE id = ?', [id]);
// Connection automatically returned to pool after query
```

**What the pool does:**
1. App requests a connection
2. Pool checks if a free connection exists → gives it immediately
3. If pool is full → request waits in queue
4. After query → connection returned to pool (not closed)
5. Idle connections are kept alive with heartbeat queries

---

## 37. Query Optimization

```javascript
// ─── MongoDB ──────────────────────────────────────────

// 1. Use indexes — always explain first
db.orders.find({ userId: id, status: 'completed' }).explain('executionStats');
// Look for: IXSCAN, totalDocsExamined should ≈ nReturned

// 2. Projection — don't fetch fields you don't need
db.users.find({}, { password: 0, __v: 0 });  // exclude heavy/sensitive fields

// 3. Limit results
db.posts.find({}).sort({ date: -1 }).limit(20);

// 4. Use aggregation pipeline over multiple queries

// 5. Avoid $where (JavaScript evaluation — can't use index)
// ❌ db.users.find({ $where: "this.age > 25" })
// ✅ db.users.find({ age: { $gt: 25 } })

// ─── SQL ──────────────────────────────────────────────

-- 1. Use EXPLAIN to find slow queries
EXPLAIN SELECT ...;

-- 2. Add indexes on WHERE / JOIN / ORDER BY columns
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status); -- compound

-- 3. Avoid SELECT * — select only needed columns
SELECT id, name, email FROM users;  -- not SELECT *

-- 4. Use JOINs instead of correlated subqueries
-- ❌ Correlated subquery (N queries)
SELECT u.name, (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) FROM users u;
-- ✅ JOIN (1 query)
SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;

-- 5. LIMIT your results
SELECT * FROM orders ORDER BY created_at DESC LIMIT 50;

-- 6. Use connection pooling (see above)

-- 7. Avoid functions on indexed columns in WHERE
-- ❌ WHERE YEAR(created_at) = 2024  (function on column — can't use index)
-- ✅ WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'
```

---

## 38. Denormalization Trade-offs

**Denormalization** intentionally introduces redundancy to improve read performance.

```sql
-- Normalised (3NF) — data in one place, slow reads (need JOINs)
orders table: id, user_id, product_id, quantity, price
users table:  id, name, email
products table: id, name, sku

-- Denormalised — data duplicated, fast reads (no JOINs needed)
orders table: id, user_id, user_name, user_email, product_id, product_name, product_sku, quantity, price
-- user_name, user_email are duplicated from users
-- product_name, product_sku are duplicated from products
```

**Benefits of denormalisation:**
- Faster reads (no JOINs, fewer queries)
- Simpler queries
- Better for analytics / data warehouses (star schema)

**Costs of denormalisation:**
- Data redundancy — same data in multiple places
- Update anomalies — update user's name → must update all orders too
- More storage

**When to denormalise:**
- Read-heavy workloads where read latency is critical
- Reporting / analytics databases (OLAP)
- MongoDB schemas (embed commonly accessed together data)
- Cache layers (Redis storing pre-computed aggregations)

---

## 39. CAP Theorem

The **CAP Theorem** states that a distributed system can guarantee at most **two** of these three properties:

```
          Consistency
          (all nodes see
          the same data)
               △
              / \
             /   \
            /     \
           /  Can't \
          /  have all \
         /     three   \
        ◁───────────────▷
  Availability        Partition
  (system always       Tolerance
  responds)           (works despite
                       network splits)
```

| System Type | Gives up | Examples |
|---|---|---|
| **CP** (Consistency + Partition) | Availability | MongoDB (default), HBase, Zookeeper |
| **AP** (Availability + Partition) | Consistency | Cassandra, CouchDB, DynamoDB |
| **CA** (Consistency + Availability) | Partition tolerance | Traditional SQL (single node) |

> **Network partitions always happen in distributed systems** — so the real choice is **CP vs AP**.

```
CP — Bank transfer system:
  "I'd rather be unavailable than show you the wrong balance."

AP — Social media feed:
  "I'd rather show you slightly stale data than be down."
```

**In practice:** Modern databases offer tunable consistency — MongoDB lets you set `writeConcern` and `readConcern` to trade between C and A.

---

# BUILD PROJECT

---

## 🏗️ Connecting Day 2 Blog API to MongoDB + Mongoose

> **Goal:** Add a real database to the Day 2 blog REST API. Replace the in-memory array with MongoDB collections. Add JWT auth with a real User model.

### Project Structure

```
blog-api/
├── src/
│   ├── config/
│   │   └── db.js            ← MongoDB connection
│   ├── models/
│   │   ├── User.js          ← Mongoose User schema
│   │   └── Post.js          ← Mongoose Post schema
│   ├── middleware/
│   │   ├── auth.js          ← JWT verification middleware
│   │   └── errorHandler.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── postController.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── post.routes.js
│   └── app.js
├── .env
└── package.json
```

### Step 1 — Database Connection

```javascript
// config/db.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1); // exit — can't run without a DB
  }
}

module.exports = connectDB;
```

### Step 2 — User Model

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, 'Name is required'], trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true,
                match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
    password: { type: String, required: [true, 'Password is required'],
                minlength: 6, select: false },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method — compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method — generate JWT
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);
```

### Step 3 — Post Model

```javascript
// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true, trim: true, maxlength: 200 },
    body:    { type: String, required: true },
    author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags:    [{ type: String, trim: true }],
    published: { type: Boolean, default: false },
    views:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for text search
postSchema.index({ title: 'text', body: 'text' });
// Index for efficient listing by author
postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
```

### Step 4 — Auth Controller

```javascript
// controllers/authController.js
const User = require('../models/User');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user  = await User.create({ name, email, password });
    const token = user.generateToken();

    res.status(201).json({
      status: 'success',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    // Duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = user.generateToken();
    res.json({
      status: 'success',
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) { next(err); }
};
```

### Step 5 — Auth Middleware

```javascript
// middleware/auth.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer '))
      token = req.headers.authorization.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### Step 6 — Posts Controller

```javascript
// controllers/postController.js
const Post = require('../models/Post');

exports.getAllPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, tag } = req.query;
    const filter = { published: true };
    if (search) filter.$text = { $search: search };
    if (tag)    filter.tags  = tag;

    const posts = await Post
      .find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-body');               // exclude body for list view

    const total = await Post.countDocuments(filter);
    res.json({ posts, page: Number(page), total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post
      .findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },       // increment view count
        { new: true }
      )
      .populate('author', 'name email');

    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) { next(err); }
};

exports.createPost = async (req, res, next) => {
  try {
    const post = await Post.create({ ...req.body, author: req.user._id });
    res.status(201).json(post);
  } catch (err) { next(err); }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Not authorized' });

    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    res.json(updated);
  } catch (err) { next(err); }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Not authorized' });

    await post.deleteOne();
    res.status(204).send();
  } catch (err) { next(err); }
};
```

### Bonus — Equivalent MySQL Schema

```sql
-- Users table (equivalent to User model)
CREATE TABLE users (
  id         INT          PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Posts table (equivalent to Post model)
CREATE TABLE posts (
  id         INT          PRIMARY KEY AUTO_INCREMENT,
  title      VARCHAR(200) NOT NULL,
  body       TEXT         NOT NULL,
  author_id  INT          NOT NULL,
  published  TINYINT(1)   DEFAULT 0,
  views      INT          DEFAULT 0,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tags (many-to-many, normalised)
CREATE TABLE tags (
  id   INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
  post_id INT,
  tag_id  INT,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);

-- Full-text search index
ALTER TABLE posts ADD FULLTEXT INDEX ft_title_body (title, body);

-- Equivalent queries
-- Get all published posts with author name (= .find().populate())
SELECT p.id, p.title, p.views, p.created_at, u.name AS author, u.email
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.published = 1
ORDER BY p.created_at DESC
LIMIT 10 OFFSET 0;

-- Full-text search (= $text: { $search: "..." })
SELECT * FROM posts
WHERE MATCH(title, body) AGAINST('mongodb aggregation' IN BOOLEAN MODE);

-- Get a post and increment views (= findByIdAndUpdate + $inc)
UPDATE posts SET views = views + 1 WHERE id = 5;
SELECT p.*, u.name, u.email FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = 5;
```

---

# QUIZ — 25 QUESTIONS

---

**Q1.** When would you choose MongoDB over MySQL?

<details>
<summary>Answer</summary>

Choose **MongoDB** when:
- **Schema flexibility** is needed — different products have different attributes (a shoe has size/colour, a book has ISBN/pages).
- **Rapid development** — schema can evolve without migrations.
- **Hierarchical / document-oriented data** — blog post with embedded comments, e-commerce order with line items — reads the whole thing in one query.
- **Horizontal scaling** is a priority — built-in sharding handles terabytes/petabytes.
- **Unstructured data** — logs, events, IoT data, CMS content.
- **High write throughput** — insert-heavy workloads.

Choose **MySQL** when:
- **Complex relationships** — many-to-many with aggregate queries across many tables.
- **Data integrity** is paramount — foreign keys, constraints, full ACID across everything.
- **Structured, stable schema** — e.g., payroll, banking, inventory management.
- **Complex reporting** — GROUP BY, window functions, JOIN across 5+ tables.

</details>

---

**Q2.** Explain the aggregation pipeline.

<details>
<summary>Answer</summary>

The **aggregation pipeline** is MongoDB's data processing system — a sequence of stages where each stage transforms the documents it receives and passes results to the next.

Think of it as Unix pipes for data:
```
Collection → $match → $group → $project → $sort → $limit → result
```

**Core stages:**
- `$match` — filter documents (like `WHERE`)
- `$group` — aggregate values, like `GROUP BY` + `SUM`, `AVG`, `COUNT`
- `$project` — reshape documents, add/remove/rename fields (like `SELECT`)
- `$sort` — order results
- `$limit` / `$skip` — pagination
- `$lookup` — join another collection (like `JOIN`)
- `$unwind` — deconstruct an array field into separate documents
- `$addFields` — add computed fields without removing others
- `$facet` — run multiple sub-pipelines in parallel

**Example — top-spending customers:**
```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$userId", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } },
  { $limit: 10 },
  { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
  { $unwind: "$user" },
  { $project: { _id: 0, name: "$user.name", total: 1 } }
]);
```

Performance tip: put `$match` and `$limit` as early as possible — reduces documents flowing through the pipeline.

</details>

---

**Q3.** What are MongoDB indexes and how do they work?

<details>
<summary>Answer</summary>

An **index** is a data structure (B-Tree by default) that stores a small portion of the data in an easy-to-traverse form, allowing MongoDB to find documents without scanning the entire collection.

**Without index:** COLLSCAN — reads every document O(n).
**With index:** IXSCAN — traverses B-tree path O(log n).

**Types:**
- **Single field:** `{ email: 1 }` — ascending on one field.
- **Compound:** `{ userId: 1, date: -1 }` — multiple fields; order matters for sort and range queries.
- **Text:** `{ title: "text", body: "text" }` — full-text search.
- **Geospatial (2dsphere):** for location-based queries.
- **TTL:** auto-expire documents after a duration.
- **Sparse:** only indexes documents where the field exists.
- **Unique:** enforces uniqueness constraint.

**Trade-off:** indexes speed up reads but slow down writes (insert/update/delete must update the index). Every extra index costs RAM and disk.

```javascript
db.orders.find({ userId: id }).explain('executionStats');
// Check: winningPlan.stage = "IXSCAN" ✅ vs "COLLSCAN" ❌
// Check: totalDocsExamined ≈ nReturned (ideal)
```

</details>

---

**Q4.** Embed vs reference — how do you decide?

<details>
<summary>Answer</summary>

**Embed** when:
- The data is always read together (post + its top 3 comments)
- The relationship is one-to-few (bounded, small arrays)
- Data doesn't change independently (static address on an order snapshot)
- You want atomic updates on both at once

**Reference** when:
- High cardinality — one-to-many where the array could grow unbounded (a user's orders)
- Data is updated independently (user profile changes shouldn't affect all their posts)
- The sub-data is queried independently (you want to search comments collection)
- Multiple documents refer to the same data (avoid duplication)

**Decision checklist:**
1. Do you always read them together? → Embed
2. Can the array grow unbounded? → Reference
3. Does the data change often? → Reference
4. Is the relationship many-to-many? → Reference
5. Is the document at risk of hitting 16MB? → Reference

Example: a blog post should **embed** the first few comments (fast first load), but **reference** the full comment collection once it grows.

</details>

---

**Q5.** Explain JOINs with examples.

<details>
<summary>Answer</summary>

JOINs combine rows from two tables based on a related column.

```sql
-- INNER JOIN — rows that match in BOTH tables
SELECT u.name, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
-- Only users who have orders; only orders with a valid user

-- LEFT JOIN — all rows from LEFT, NULL if no match on right
SELECT u.name, o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- All users; users with no orders get NULL for o.amount

-- RIGHT JOIN — all rows from RIGHT, NULL if no match on left
SELECT u.name, o.amount
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
-- All orders; orders with no matching user get NULL for u.name

-- FULL OUTER JOIN — all rows from both (MySQL: emulate with UNION)
SELECT u.name, o.amount FROM users u LEFT JOIN orders o ON u.id = o.user_id
UNION
SELECT u.name, o.amount FROM users u RIGHT JOIN orders o ON u.id = o.user_id;

-- SELF JOIN — table joined with itself
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

Memory aid:
- **INNER** = only the overlap
- **LEFT** = everything from the left table + overlap
- **RIGHT** = everything from the right table + overlap
- **FULL** = everything from both

</details>

---

**Q6.** What is normalization? Why denormalize?

<details>
<summary>Answer</summary>

**Normalization** is the process of structuring a relational database to reduce data redundancy and improve data integrity.

**Normal Forms:**
- **1NF** — atomic values, no repeating groups, has a primary key.
- **2NF** — 1NF + no partial dependencies (every non-key column depends on the full PK).
- **3NF** — 2NF + no transitive dependencies (non-key columns only depend on the PK, not on other non-key columns).

**Why denormalize?**
- **Read performance** — JOINs are expensive. Pre-joining data in one table eliminates them.
- **Analytics/reporting (OLAP)** — star schema with fact + dimension tables, intentionally denormalised.
- **NoSQL (MongoDB)** — embedding is denormalization by design; common read patterns drive schema.

**Trade-off:**
- Normalised: fewer anomalies (update in one place), slower reads (more JOINs).
- Denormalised: faster reads, but data duplication means updates must touch multiple places → risk of inconsistency.

Rule: **normalise for writes/integrity** (OLTP), **denormalise for reads/performance** (OLAP/caching).

</details>

---

**Q7.** Explain ACID properties.

<details>
<summary>Answer</summary>

**ACID** guarantees reliable transaction processing:

**Atomicity** — all operations in a transaction succeed or all are rolled back. No partial states.
```sql
-- Transfer ₹500: BOTH updates happen, or neither does
UPDATE accounts SET balance = balance - 500 WHERE id = 1;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;
```

**Consistency** — a transaction brings the database from one valid state to another. All rules (constraints, cascades, triggers) are enforced.

**Isolation** — concurrent transactions don't interfere. Isolation levels control the trade-off:
- READ COMMITTED (default Postgres) — no dirty reads
- REPEATABLE READ (default MySQL InnoDB) — same query returns same result within transaction
- SERIALIZABLE — strictest; transactions execute as if one at a time

**Durability** — once a transaction is committed, it persists even if the system crashes (written to disk / WAL log before commit is acknowledged).

</details>

---

**Q8.** What is the N+1 problem? How do you fix it?

<details>
<summary>Answer</summary>

The **N+1 problem** is when code executes 1 query to fetch a list of N records, then N additional queries to fetch related data for each record — N+1 total queries.

```javascript
// ❌ N+1 — fetches users (1 query), then orders per user (N queries)
const users = await User.findAll(); // 1 query
for (const user of users) {
  user.orders = await Order.findAll({ where: { userId: user.id } }); // N queries
}
// 100 users = 101 database round-trips!
```

**Fixes:**

**1. Eager loading (JOINs / $lookup)**
```javascript
// Sequelize — include (uses a JOIN or separate batched query)
const users = await User.findAll({ include: [{ model: Order }] });

// Mongoose — populate (extra query, but batched)
const posts = await Post.find({}).populate('author', 'name email');
```

**2. DataLoader (batching — GraphQL):**
```javascript
const loader = new DataLoader(async (userIds) => {
  const orders = await Order.findAll({ where: { userId: userIds } });
  return userIds.map(id => orders.filter(o => o.userId === id));
});
// All N user IDs collected into one query
```

**3. SQL — use JOIN + GROUP BY instead of correlated subquery:**
```sql
-- ❌ Correlated subquery (N queries)
SELECT *, (SELECT COUNT(*) FROM orders WHERE user_id = u.id) FROM users u;

-- ✅ JOIN
SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;
```

</details>

---

**Q9.** What is a transaction? How does it work in MongoDB?

<details>
<summary>Answer</summary>

A **transaction** is a sequence of database operations treated as a single logical unit — either all succeed (commit) or all fail (rollback).

**MongoDB transactions** (multi-document, since v4.0) require a **replica set** or sharded cluster.

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Transfer credits between accounts atomically
  await Account.updateOne(
    { userId: fromId },
    { $inc: { balance: -100 } },
    { session }
  );
  await Account.updateOne(
    { userId: toId },
    { $inc: { balance: 100 } },
    { session }
  );

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction(); // all changes undone
  throw error;
} finally {
  session.endSession();
}
```

**Key points:**
- All operations must use the same session object.
- MongoDB guarantees atomicity for **single-document** operations natively (no transaction needed for one document).
- Multi-document transactions have performance overhead — use only when necessary.
- Transactions must complete within 60 seconds (configurable `transactionLifetimeLimitSeconds`).

Without transactions, multi-document operations in MongoDB can fail midway and leave data inconsistent.

</details>

---

**Q10.** Explain the CAP Theorem.

<details>
<summary>Answer</summary>

The **CAP Theorem** states that a distributed system can guarantee only **two** of these three properties simultaneously:

**C — Consistency:** Every read receives the most recent write or an error.
**A — Availability:** Every request receives a response (not guaranteed to be latest data).
**P — Partition Tolerance:** System continues to operate despite network partitions.

Since **network partitions always happen** in distributed systems, the real choice is **CP vs AP**:

**CP systems** (choose consistency over availability):
- Return an error or timeout rather than stale data.
- MongoDB (strong consistency mode), HBase, Zookeeper.
- Use case: banking, inventory (correctness critical).

**AP systems** (choose availability over strict consistency):
- Return possibly stale data rather than error.
- Cassandra, CouchDB, DynamoDB.
- Use case: social media feeds, shopping carts (availability critical).

**Example:**
```
Two MongoDB nodes, network split:
  CP: "I can't reach the primary → refuse reads/writes → consistent but unavailable"
  AP: "I'll serve reads from secondary → available but possibly stale data"
```

MongoDB's behaviour is tunable via `writeConcern` (how many nodes must acknowledge a write) and `readConcern` (how fresh the data must be for a read).

</details>

---

**Q11.** What is the aggregation pipeline's `$lookup` and when would you use it?

<details>
<summary>Answer</summary>

`$lookup` performs a **left outer join** to another collection in the same database.

```javascript
db.orders.aggregate([
  {
    $lookup: {
      from: "users",          // collection to join with
      localField: "userId",   // field in the orders collection
      foreignField: "_id",    // field in the users collection
      as: "user"              // output array field name
    }
  },
  { $unwind: "$user" },       // flatten array to single object
  { $project: { amount: 1, "user.name": 1, "user.email": 1 } }
]);
```

**Use `$lookup` instead of `.populate()` when:**
- You need to filter, project, or aggregate on the joined data.
- Performance matters (single database round-trip vs multiple queries from populate).
- You want to combine `$lookup` with other pipeline stages.

**Limitation:** `$lookup` cannot span across shards (as of MongoDB 6.x without specific configuration). For sharded collections, denormalization/embedding is often preferable.

</details>

---

**Q12.** What is a covering index in SQL?

<details>
<summary>Answer</summary>

A **covering index** is an index that contains all the columns a query needs — so MySQL can answer the query entirely from the index without accessing the actual table rows.

```sql
CREATE INDEX idx_orders_covering ON orders(user_id, status, amount);

SELECT amount FROM orders WHERE user_id = 1 AND status = 'completed';
-- All columns (user_id, status, amount) are in the index
-- MySQL reads ONLY the index — no table lookup! (Extra: "Using index")
```

How to spot it in `EXPLAIN`:
- `Extra: Using index` = covering index ✅ (fastest)
- `Extra: Using index condition` = index push-down (fast)
- `key: NULL` = no index = COLLSCAN ❌

**When to use:** for frequently executed queries where the table access is the bottleneck, add the queried columns + selected columns to the index.

</details>

---

**Q13.** What is connection pooling and why is it important?

<details>
<summary>Answer</summary>

**Connection pooling** maintains a set of reusable, pre-opened database connections instead of creating a new connection for every request.

**Why it matters:**
- Opening a new TCP connection + TLS handshake + authentication takes ~50-100ms.
- Without pooling: each request creates and destroys a connection → massive overhead.
- With pooling: connections are reused → most requests get a connection in microseconds.

```javascript
// Mongoose (MongoDB) — built-in pool
mongoose.connect(uri, { maxPoolSize: 10, minPoolSize: 2 });

// mysql2 — explicit pool
const pool = mysql2.createPool({ connectionLimit: 10 });
const [rows] = await pool.promise().query('SELECT ...');
```

**Pool lifecycle:**
1. App starts → pool opens `minPoolSize` connections.
2. Request comes in → borrow a connection from pool.
3. Query executes.
4. Connection returned to pool (not closed).
5. If all connections in use → new request waits in queue.

**Pool sizing:** too small = requests queue up; too large = DB overwhelmed. Rule of thumb: `poolSize = (core_count × 2) + effective_spindle_count`.

</details>

---

**Q14.** How do you perform pagination in MongoDB? What are the trade-offs?

<details>
<summary>Answer</summary>

**Method 1 — Offset pagination (skip/limit)**
```javascript
const page  = 2;
const limit = 10;
const posts = await Post.find({})
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)  // skip 10 docs for page 2
  .limit(limit);
```
- ✅ Simple; allows jumping to any page.
- ❌ Slow for large offsets — MongoDB must scan and discard all skipped docs.
- ❌ Inconsistent — if docs are inserted/deleted mid-pagination, pages overlap or miss items.

**Method 2 — Cursor pagination (keyset)**
```javascript
// First page
const posts = await Post.find({}).sort({ createdAt: -1 }).limit(10);
const lastPost = posts[posts.length - 1];

// Next page — use last seen cursor value
const nextPosts = await Post
  .find({ createdAt: { $lt: lastPost.createdAt } })
  .sort({ createdAt: -1 })
  .limit(10);
```
- ✅ O(log n) — uses index efficiently at any offset.
- ✅ Consistent — inserts/deletes don't affect already-seen pages.
- ❌ No "jump to page N" — forward-only navigation.
- ❌ More complex implementation.

**Rule:** offset pagination for small data / simple UIs; cursor pagination for infinite scroll / large datasets.

</details>

---

**Q15.** What is Mongoose's `pre` and `post` middleware? Give examples.

<details>
<summary>Answer</summary>

Mongoose middleware (hooks) are functions executed before or after a specific operation.

**Types:** document middleware (`save`, `validate`, `remove`), query middleware (`find`, `findOne`, `update`, `delete`), aggregate middleware.

```javascript
// pre('save') — hash password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// pre('save') — set updatedAt timestamp
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// post('save') — send welcome email
userSchema.post('save', async function (doc) {
  await sendWelcomeEmail(doc.email);
});

// pre(/^find/) — exclude inactive users from ALL find queries
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// pre('findOneAndDelete') — cascade delete related documents
postSchema.pre('findOneAndDelete', async function (next) {
  await Comment.deleteMany({ postId: this.getFilter()._id });
  next();
});
```

Middleware is ideal for: hashing passwords, auditing, cascading deletes, auto-populating fields, data transformation.

</details>

---

**Q16.** What is the difference between `findByIdAndUpdate` and `findOneAndUpdate`?

<details>
<summary>Answer</summary>

Both update a document and return it, but:

```javascript
// findByIdAndUpdate — shorthand for _id lookup
const user = await User.findByIdAndUpdate(
  '64c7f2a1b3e4d5f6a7b8c9d0',  // shorthand for { _id: '64c...' }
  { $set: { name: 'Alice B.' } },
  { new: true, runValidators: true }
);

// findOneAndUpdate — arbitrary filter
const user = await User.findOneAndUpdate(
  { email: 'a@x.com' },  // find by any field
  { $set: { name: 'Alice B.' } },
  { new: true, runValidators: true, upsert: true }
);
```

**Important options:**
- `new: true` — return the updated document (default: returns the original document pre-update).
- `runValidators: true` — run schema validators on update (NOT run by default on updates!).
- `upsert: true` — create the document if it doesn't exist.

**`findByIdAndUpdate` is exactly `findOneAndUpdate({ _id: id }, ...)`** — convenience only.

</details>

---

**Q17.** What is SQL injection and how do you prevent it?

<details>
<summary>Answer</summary>

**SQL injection** is an attack where malicious SQL is inserted into a query via user input, allowing an attacker to read/modify/delete data.

```javascript
// ❌ VULNERABLE — string concatenation
const query = `SELECT * FROM users WHERE email = '${req.body.email}'`;
// Attacker inputs: ' OR '1'='1
// Query becomes: SELECT * FROM users WHERE email = '' OR '1'='1'
// Returns ALL users!
```

**Prevention:**

**1. Parameterised queries / prepared statements (best):**
```javascript
// mysql2 — parameterised
const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

// Sequelize — always parameterised internally
const user = await User.findOne({ where: { email } });
```

**2. ORM / ODM (inherently safe — no raw string queries):**
```javascript
// Mongoose — not vulnerable to classic SQL injection (NoSQL, different attack surface)
// But vulnerable to NoSQL injection:
// ❌ User.findOne({ email: req.body.email }) where body.email = { $gt: '' }
// ✅ Validate/sanitise inputs with express-validator
```

**3. Input validation — reject unexpected formats:**
```javascript
const { body } = require('express-validator');
body('email').isEmail().normalizeEmail();
body('age').isInt({ min: 0, max: 120 });
```

**4. Least privilege — DB user only has needed permissions.**

</details>

---

**Q18.** What is the difference between OLTP and OLAP?

<details>
<summary>Answer</summary>

| | OLTP (Online Transaction Processing) | OLAP (Online Analytical Processing) |
|---|---|---|
| Purpose | Day-to-day operations | Analytics, reporting |
| Operations | INSERT/UPDATE/DELETE | Complex SELECT, aggregations |
| Data volume | Current, small per transaction | Historical, large datasets |
| Schema | Normalised (3NF) | Denormalised (star/snowflake schema) |
| Response time | Milliseconds | Seconds to minutes |
| Users | Many concurrent (thousands) | Few analytical users |
| Examples | E-commerce orders, banking | Business intelligence, dashboards |
| DB examples | MySQL, PostgreSQL | BigQuery, Redshift, Snowflake |

**Star Schema (OLAP):**
```
               Fact Table
            [orders: order_id, amount, date_id, user_id, product_id]
                    │
         ┌──────────┼──────────┐
         ▼          ▼          ▼
     dim_users  dim_dates  dim_products
     (name,     (year,     (name, category,
      region)    month)     price)
```

Denormalised on purpose — no JOINs through normalised chains; one big JOIN star reads are very fast.

</details>

---

**Q19.** How do indexes affect write performance?

<details>
<summary>Answer</summary>

Indexes speed up reads but **slow down writes** because every index must be updated whenever data changes.

**On INSERT:**
- Row is written to the table.
- Every index on the table must add the new entry.
- 5 indexes = 6 write operations instead of 1.

**On UPDATE:**
- If an indexed column changes, the old index entry is removed and a new one inserted.
- If a non-indexed column changes, indexes are unaffected.

**On DELETE:**
- All index entries for the deleted row must be removed.

**Quantitative impact:**
```sql
-- Table with 10 million rows and 8 indexes
INSERT INTO orders (...) VALUES (...);
-- Must update the B-tree for each index → 8× more I/O than no indexes
```

**Best practices:**
- Index only columns you query/filter/sort on frequently.
- Remove unused indexes (`SHOW INDEX FROM table` → check `Cardinality`).
- For bulk inserts, consider dropping indexes, inserting, then re-creating.
- MongoDB: `{ background: true }` when creating indexes on large collections.

</details>

---

**Q20.** What is the difference between `DELETE`, `TRUNCATE`, and `DROP` in SQL?

<details>
<summary>Answer</summary>

| | DELETE | TRUNCATE | DROP |
|---|---|---|---|
| What it does | Removes rows | Removes all rows | Removes the entire table/structure |
| WHERE clause | ✅ Yes | ❌ No | ❌ N/A |
| Transaction | ✅ Can rollback | ❌ Auto-commits (mostly) | ❌ Auto-commits |
| Triggers | ✅ Fires row-level triggers | ❌ Does not fire triggers | ❌ N/A |
| Speed | Slow (logs each row) | Fast (deallocates pages) | Instant |
| AUTO_INCREMENT reset | ❌ No | ✅ Yes (resets to 1) | ✅ (table gone) |

```sql
DELETE FROM users WHERE active = 0;  -- delete specific rows, logged, rollbackable
TRUNCATE TABLE sessions;              -- delete ALL rows, fast, resets auto-increment
DROP TABLE old_logs;                  -- removes the table entirely (structure + data)
```

Use `DELETE` when you need conditional deletion or rollback capability.
Use `TRUNCATE` when clearing a table for a fresh start (e.g., test teardown).
Use `DROP` when the table is no longer needed at all.

</details>

---

**Q21.** What is a replica set in MongoDB and how does failover work?

<details>
<summary>Answer</summary>

A **replica set** is a group of MongoDB instances that maintain the same data via replication, providing **high availability** and **data redundancy**.

**Members:**
- **Primary** — handles all writes; can serve reads.
- **Secondary** — replicate data from the primary via the **oplog** (operation log). Can serve reads with appropriate `readPreference`.
- **Arbiter** — participates in elections, holds no data. Used to achieve odd number of voting members without extra storage.

**Replication flow:**
1. Write goes to primary.
2. Primary records the operation in its **oplog**.
3. Secondaries tail the oplog and apply the same operations.

**Failover (automatic):**
1. Secondaries detect that the primary is unreachable (via heartbeat, every 2 seconds).
2. An **election** is held — the secondary with the most up-to-date oplog typically wins.
3. The elected secondary becomes the new primary.
4. Entire process takes ~10-30 seconds.

**Minimum recommended: 3 members** to ensure a majority for elections even if one node is down.

```javascript
// Read from secondaries (allow stale reads for scalability)
mongoose.connect(uri, { readPreference: 'secondaryPreferred' });
```

</details>

---

**Q22.** What are window functions in SQL?

<details>
<summary>Answer</summary>

Window functions perform calculations across a set of rows **related to the current row**, without collapsing rows like `GROUP BY` does.

```sql
-- ROW_NUMBER — rank within a partition
SELECT
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rank_in_dept
FROM employees;
-- Each department gets independently numbered rows

-- RANK — with gaps for ties
RANK() OVER (ORDER BY salary DESC)         -- 1, 2, 2, 4 (skips 3)

-- DENSE_RANK — without gaps
DENSE_RANK() OVER (ORDER BY salary DESC)   -- 1, 2, 2, 3

-- Running total
SELECT
  date,
  amount,
  SUM(amount) OVER (ORDER BY date) AS running_total
FROM orders;

-- Moving average
SELECT
  date,
  amount,
  AVG(amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS 7day_avg
FROM daily_sales;

-- LAG / LEAD — access previous/next row
SELECT
  date, amount,
  LAG(amount) OVER (ORDER BY date)  AS prev_day,
  LEAD(amount) OVER (ORDER BY date) AS next_day
FROM daily_sales;
```

Window functions are extremely powerful for analytics. Available in MySQL 8.0+, PostgreSQL, SQL Server.

</details>

---

**Q23.** How do you handle schema migrations in MongoDB vs MySQL?

<details>
<summary>Answer</summary>

**MySQL / SQL migrations:**
- Schema is strict — you must `ALTER TABLE` to change structure.
- Use a migration tool: **Flyway**, **Liquibase**, **Sequelize migrations**, **Prisma migrate**.

```javascript
// Prisma migration workflow:
// 1. Edit schema.prisma
// 2. npx prisma migrate dev --name add_user_role
// → creates migration SQL file, runs it, updates DB schema

// Sequelize migration
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('user', 'admin'),
      defaultValue: 'user',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'role');
  },
};
```

**MongoDB migrations:**
- Schema is flexible — new documents can have new fields without changing existing ones.
- But migrations still happen! Two strategies:

1. **Lazy migration** — update documents as they're accessed:
```javascript
userSchema.pre('save', function (next) {
  if (!this.role) this.role = 'user'; // add missing field on read
  next();
});
```

2. **Batch migration script** — run once for bulk update:
```javascript
await User.updateMany({ role: { $exists: false } }, { $set: { role: 'user' } });
```

Tools: **migrate-mongo** for versioned MongoDB migrations.

</details>

---

**Q24.** What is the N+1 problem in GraphQL and how does DataLoader solve it?

<details>
<summary>Answer</summary>

In GraphQL, when resolving a list of items and each item needs a related resource, the resolver runs **once per item** — causing N+1 database queries.

```javascript
// ❌ Without DataLoader — N+1 queries
const resolvers = {
  Query: {
    posts: () => Post.find({}),  // 1 query (returns 100 posts)
  },
  Post: {
    author: (post) => User.findById(post.authorId), // 100 separate queries!
  },
};

// ✅ With DataLoader — batches all author lookups into ONE query
const userLoader = new DataLoader(async (userIds) => {
  const users = await User.find({ _id: { $in: userIds } });
  const userMap = users.reduce((map, u) => ({ ...map, [u._id]: u }), {});
  return userIds.map(id => userMap[id]);
});

const resolvers = {
  Post: {
    author: (post) => userLoader.load(post.authorId), // queued, not executed yet
    // DataLoader collects ALL authorIds, fires ONE query, returns mapped results
  },
};
```

**DataLoader workflow:**
1. All `loader.load(key)` calls in the same tick are collected.
2. On the next tick, the batch function is called with all collected keys.
3. Results are mapped back to each individual caller.

Result: 100 posts + 1 batched user query = **2 queries** instead of 101.

</details>

---

**Q25.** Design question: You're building a social media platform. Would you choose MongoDB or MySQL for the posts + followers data? Justify your choice.

<details>
<summary>Answer</summary>

**I would use both — polyglot persistence:**

**MongoDB for posts/content:**
- Posts have varying structure (text, photos, videos, polls — different fields).
- Embedded likes count and top comments = fast single-document reads for feed.
- High write throughput needed (millions of posts/day) → MongoDB sharding handles this well.
- Schema evolves often (adding stories, reels, etc.) → flexible schema ideal.
- Geospatial features for local posts.

**MySQL/PostgreSQL for social graph (followers/following):**
- The follower relationship is a pure many-to-many relational table:
  ```sql
  CREATE TABLE followers (
    follower_id INT, following_id INT,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id)
  );
  ```
- Queries like "who are mutual friends", "do A and B follow each other", "suggest people A might know" are complex graph queries well-suited for relational indexes.
- ACID needed: follow/unblock/block must be consistent.

**Redis as cache layer:**
- Cache feed for each user (pre-computed).
- Store session tokens, rate limiting counters.
- Pub/Sub for real-time notifications.

**Interview summary:** "Use MongoDB for flexible, high-volume content with varying schema. Use PostgreSQL for the social graph where relationships and complex JOIN queries dominate. Add Redis for caching and real-time features."

</details>

---

## 🎯 Quick Cheat Sheet

```
📌 MongoDB = document DB; BSON; flexible schema; horizontal scale
📌 SQL = relational; strict schema; JOINs; ACID; vertical scale (primarily)

── MongoDB ─────────────────────────────────────────────────────────────
📌 _id = ObjectId (12-byte: 4 timestamp + 5 random + 3 counter)
📌 CRUD: insertOne/Many, find/findOne, updateOne/Many ($set/$inc/$push), deleteOne/Many
📌 Aggregation: $match → $group → $project → $sort → $limit/$skip → $lookup
📌 Indexes: single, compound, text, geo, TTL, sparse, unique
📌 Index trade-off: faster reads, slower writes, more RAM/disk
📌 Embed: always read together, one-to-few, bounded array
📌 Reference: one-to-many, high cardinality, independent queries, often updated
📌 populate() = separate query per field; $lookup = single aggregation pipeline
📌 Transactions: requires replica set; startSession → startTransaction → commit/abort
📌 Replica set: primary + secondaries; auto-failover via election (~10-30s)
📌 Sharding: distributes data across nodes; choose shard key carefully (high cardinality)

── SQL ─────────────────────────────────────────────────────────────────
📌 INNER JOIN = intersection | LEFT = all left + match | FULL = union
📌 WHERE filters rows; HAVING filters groups (after GROUP BY)
📌 Execution order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
📌 1NF: atomic values | 2NF: no partial deps | 3NF: no transitive deps
📌 ACID: Atomicity + Consistency + Isolation + Durability
📌 Isolation levels: READ UNCOMMITTED < READ COMMITTED < REPEATABLE READ < SERIALIZABLE
📌 EXPLAIN: look for type=ALL (bad), key=NULL (bad), "Using index" (good)
📌 Sargable: = / BETWEEN / LIKE 'x%' use indexes | functions on column do NOT
📌 DELETE = conditional, logged | TRUNCATE = all rows, fast | DROP = remove table
📌 Stored proc: reusable SQL in DB | View: virtual table (stored SELECT)

── Key Concepts ─────────────────────────────────────────────────────────
📌 N+1: 1 query for list + N queries per item → fix with eager loading / DataLoader
📌 Connection pool: reuse pre-opened connections; maxPoolSize tuned to workload
📌 ACID vs BASE: strong consistency vs eventual consistency
📌 CAP: distributed system can only guarantee 2 of C/A/P; partition always happens → CP vs AP
📌 Normalise for writes (OLTP), denormalise for reads (OLAP/caching)
📌 Horizontal scaling: add more machines (MongoDB native) | Vertical: bigger machine (SQL traditional)
📌 ORM: Mongoose (MongoDB), Sequelize/Prisma (SQL) → abstract raw queries
📌 SQL injection: always use parameterised queries / ORMs, never string-concatenate
```

---

*Day 4 down — you now own the entire data layer. 🎯*

> **Next:** [Day 5 — Project 1: Deep Dive](./Day5_Project1_DeepDive.md)  
> **Previous:** [Day 3 — React: UI That Makes Sense](./Day3_React_Guide.md)
