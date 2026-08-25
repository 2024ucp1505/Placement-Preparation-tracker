/* ============================================================
   src/models/questionModel.js — Data Layer (Model)

   Backed by MongoDB via Mongoose.

   The public interface is IDENTICAL to the old in-memory version
   (same 6 exported function names and signatures) so the
   controller and routes do not need any logic changes.

   Public interface:
     getAll(filters)                    → Promise<Question[]>
     getById(id)                        → Promise<Question | null>
     create(data)                       → Promise<Question>
     update(id, data)                   → Promise<Question | null>
     remove(id)                         → Promise<boolean>
     isDuplicate(company, title, excId) → Promise<boolean>
   ============================================================ */

'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/* ── Allowed enum values — mirrors validateQuestion middleware ── */
const VALID_COMPANIES    = ['Amazon', 'Google', 'Microsoft', 'Adobe', 'Flipkart', 'Walmart', 'Other', 'N/A'];
const VALID_TOPICS       = ['Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Binary Search', 'Trees', 'Graphs', 'DP', 'Greedy', 'Backtracking', 'Heap', 'DBMS', 'OS', 'CN', 'OOPS', 'JavaScript', 'NodeJS', 'React', 'MongoDB', 'MySQL', 'Other'];
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const VALID_STATUSES     = ['Solved', 'Unsolved'];
const VALID_CATEGORIES   = ['DSA', 'Core', 'Development'];


/* ── Mongoose Schema ─────────────────────────────────────────
   Describes the shape and rules for a question document.
   Fields match the existing data shape exactly.
   ──────────────────────────────────────────────────────────── */
const questionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required.'],
    },
    company: {
      type:     String,
      required: [true, 'Company is required.'],
      enum:     { values: VALID_COMPANIES, message: 'Invalid company: {VALUE}.' },
      trim:     true,
    },
    topic: {
      type:     String,
      required: [true, 'Topic is required.'],
      enum:     { values: VALID_TOPICS, message: 'Invalid topic: {VALUE}.' },
      trim:     true,
    },
    title: {
      type:      String,
      required:  [true, 'Question title is required.'],
      minlength: [2, 'Title must be at least 2 characters.'],
      trim:      true,
    },
    link: {
      type:    String,
      default: '',
      trim:    true,
    },
    difficulty: {
      type:     String,
      required: [true, 'Difficulty is required.'],
      enum:     { values: VALID_DIFFICULTIES, message: 'Invalid difficulty: {VALUE}.' },
      trim:     true,
    },
    status: {
      type:     String,
      required: [true, 'Status is required.'],
      enum:     { values: VALID_STATUSES, message: 'Invalid status: {VALUE}.' },
      default:  'Unsolved',
      trim:     true,
    },
    category: {
      type:     String,
      enum:     { values: VALID_CATEGORIES, message: 'Invalid category: {VALUE}.' },
      default:  'DSA',
      trim:     true,
    },
    starred: {
      type:     Boolean,
      default:  false,
    },
    notes: {
      type:     String,
      default:  '',
      trim:     true,
    },
    chapter: {
      type:     String,
      default:  '',
      trim:     true,
    },
    content: {
      type:     String,
      default:  '',
      trim:     true,
    }
  },
  {
    timestamps: true,   // adds createdAt and updatedAt automatically
    versionKey: false,  // removes __v from documents
    toJSON: { virtuals: true }, // Add id virtual field (string representation of _id)
    toObject: { virtuals: true }
  }
);

/* ── Compound index — speeds up isDuplicate lookups ─────────── */
questionSchema.index({ userId: 1, company: 1, title: 1 });

/* ── Mongoose Model ──────────────────────────────────────────
   'Question' → collection name becomes 'questions' in MongoDB.
   ──────────────────────────────────────────────────────────── */
const Question = mongoose.model('Question', questionSchema);


/* ── Helper: build a MongoDB query object from filter params ─ */
function buildFilter(userId, filters = {}) {
  const query = { userId };

  if (filters.company)    query.company    = filters.company;
  if (filters.topic)      query.topic      = filters.topic;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.status)     query.status     = filters.status;
  if (filters.category)   query.category   = filters.category;
  if (filters.chapter)    query.chapter    = filters.chapter;
  if (filters.starred !== undefined && filters.starred !== '') {
    query.starred = filters.starred === 'true' || filters.starred === true;
  }

  if (filters.search) {
    const regex = new RegExp(filters.search, 'i');  // case-insensitive substring
    query.$or = [
      { title:   regex },
      { company: regex },
      { topic:   regex },
    ];
  }

  return query;
}


/* ── Public Model Functions ──────────────────────────────────
   All functions are async — MongoDB I/O is non-blocking.
   ──────────────────────────────────────────────────────────── */

/**
 * getAll — Return all questions, optionally filtered.
 * Sorted newest-first (createdAt descending).
 *
 * @param {object} filters
 * @returns {Promise<object[]>}
 */
async function getAll(userId, filters = {}) {
  const query = buildFilter(userId, filters);
  // Sort DSA and Revision by newest first. Sort Core/Dev logically (by insertion order).
  if (filters.category === 'Core' || filters.category === 'Development') {
    return Question.find(query).sort({ _id: 1 });
  }
  return Question.find(query).sort({ createdAt: -1 });
}


/**
 * getById — Return a single question by its MongoDB ObjectId string.
 *
 * @param {string} id  - 24-char hex ObjectId string
 * @returns {Promise<object|null>}
 */
async function getById(userId, id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Question.findOne({ _id: id, userId });
}


/**
 * create — Insert a new question document and return it.
 *
 * @param {object} data - validated question fields
 * @returns {Promise<object>} the newly created document
 */
async function create(userId, data) {
  const question = new Question({
    userId,
    company:    data.company,
    topic:      data.topic,
    title:      data.title,
    link:       data.link || '',
    difficulty: data.difficulty,
    status:     data.status,
    category:   data.category || 'DSA',
    starred:    data.starred || false,
    notes:      data.notes || '',
    chapter:    data.chapter || '',
    content:    data.content || '',
  });
  return question.save();
}


/**
 * update — Update an existing question by ObjectId.
 * Returns the updated document, or null if not found.
 *
 * @param {string} id
 * @param {object} data - validated updated fields
 * @returns {Promise<object|null>}
 */
async function update(userId, id, data) {
  if (!mongoose.isValidObjectId(id)) return null;

  return Question.findOneAndUpdate(
    { _id: id, userId },
    {
      company:    data.company,
      topic:      data.topic,
      title:      data.title,
      link:       data.link ?? '',
      difficulty: data.difficulty,
      status:     data.status,
      category:   data.category ?? 'DSA',
      starred:    data.starred ?? false,
      notes:      data.notes ?? '',
      chapter:    data.chapter ?? '',
      content:    data.content ?? '',
    },
    { new: true, runValidators: true }  // return updated doc; enforce schema rules
  );
}


/**
 * remove — Delete a question by ObjectId.
 * Returns true if a document was deleted, false if not found.
 *
 * @param {string} id
 * @returns {Promise<boolean>}
 */
async function remove(userId, id) {
  if (!mongoose.isValidObjectId(id)) return false;
  const deleted = await Question.findOneAndDelete({ _id: id, userId });
  return deleted !== null;
}


/**
 * isDuplicate — Check if company + title already exists.
 * Pass excludeId (string) to skip the document currently being edited.
 *
 * @param {string}      company
 * @param {string}      title
 * @param {string|null} excludeId
 * @returns {Promise<boolean>}
 */
async function isDuplicate(userId, company, title, excludeId = null) {
  const query = {
    userId,
    company: { $regex: new RegExp(`^${company}$`, 'i') },
    title:   { $regex: new RegExp(`^${title}$`,   'i') },
  };

  if (excludeId && mongoose.isValidObjectId(excludeId)) {
    query._id = { $ne: excludeId };
  }

  return !!(await Question.exists(query));
}


module.exports = { getAll, getById, create, update, remove, isDuplicate };
