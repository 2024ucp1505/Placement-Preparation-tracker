/* ============================================================
   src/models/questionModel.js — Data Layer (Model)

   This module is the ONLY place in the app that owns data.
   Currently backed by an in-memory array.

   ┌──────────────────────────────────────────────────────────┐
   │  TO SWAP IN A DATABASE                                   │
   │  1. Install your DB driver (mongoose / pg / better-sqlite3) │
   │  2. Replace the in-memory logic inside each function     │
   │  3. Make each function async (controllers already await) │
   │  4. No other file needs to change.                       │
   └──────────────────────────────────────────────────────────┘

   Public interface (5 methods):
     getAll(filters)    → Question[]
     getById(id)        → Question | null
     create(data)       → Question
     update(id, data)   → Question | null
     remove(id)         → boolean
   ============================================================ */

'use strict';

/* ── In-Memory Store ──────────────────────────────────────────
   TODO: Replace with a real DB connection when ready.
   e.g.  const db = require('../config/db');
   ──────────────────────────────────────────────────────────── */
let questions = [];


/* ── Question Schema ──────────────────────────────────────────
   Every question object must conform to this shape:
   {
     id:         number   (timestamp, unique)
     company:    string
     topic:      string
     title:      string
     link:       string   (optional — may be empty string)
     difficulty: "Easy" | "Medium" | "Hard"
     status:     "Solved" | "Unsolved"
   }
   ──────────────────────────────────────────────────────────── */


/**
 * getAll — Return all questions, optionally filtered.
 *
 * @param {object} filters
 * @param {string} [filters.search]     - substring match on title/company/topic
 * @param {string} [filters.company]    - exact match
 * @param {string} [filters.topic]      - exact match
 * @param {string} [filters.difficulty] - exact match
 * @param {string} [filters.status]     - exact match
 * @returns {object[]} filtered questions array
 *
 * TODO: replace body with → return await db.find(filters);
 */
function getAll(filters = {}) {
  let result = questions;

  const { search, company, topic, difficulty, status } = filters;

  if (company) {
    result = result.filter(q => q.company === company);
  }
  if (topic) {
    result = result.filter(q => q.topic === topic);
  }
  if (difficulty) {
    result = result.filter(q => q.difficulty === difficulty);
  }
  if (status) {
    result = result.filter(q => q.status === status);
  }
  if (search) {
    const term = search.toLowerCase();
    result = result.filter(q =>
      q.title.toLowerCase().includes(term)   ||
      q.company.toLowerCase().includes(term) ||
      q.topic.toLowerCase().includes(term)
    );
  }

  return result;
}


/**
 * getById — Return a single question by numeric ID.
 *
 * @param {number} id
 * @returns {object|null} question or null if not found
 *
 * TODO: replace body with → return await db.findById(id);
 */
function getById(id) {
  return questions.find(q => q.id === id) ?? null;  // TODO: DB call
}


/**
 * create — Add a new question and return it.
 *
 * @param {object} data - validated question fields
 * @returns {object} the newly created question
 *
 * TODO: replace body with → return await db.create(data);
 */
function create(data) {
  // TODO: DB call
  const question = {
    id:         Date.now(),   // unique numeric timestamp
    company:    data.company,
    topic:      data.topic,
    title:      data.title,
    link:       data.link || '',
    difficulty: data.difficulty,
    status:     data.status,
  };

  questions.push(question);
  return question;
}


/**
 * update — Update an existing question's fields.
 *
 * @param {number} id
 * @param {object} data - validated updated fields
 * @returns {object|null} updated question, or null if not found
 *
 * TODO: replace body with → return await db.findByIdAndUpdate(id, data, { new: true });
 */
function update(id, data) {
  // TODO: DB call
  const index = questions.findIndex(q => q.id === id);
  if (index === -1) return null;

  // Merge — keep existing fields, overwrite only what was sent
  questions[index] = {
    ...questions[index],
    company:    data.company,
    topic:      data.topic,
    title:      data.title,
    link:       data.link ?? questions[index].link,
    difficulty: data.difficulty,
    status:     data.status,
  };

  return questions[index];
}


/**
 * remove — Delete a question by ID.
 *
 * @param {number} id
 * @returns {boolean} true if deleted, false if not found
 *
 * TODO: replace body with → const res = await db.findByIdAndDelete(id); return !!res;
 */
function remove(id) {
  // TODO: DB call
  const before = questions.length;
  questions = questions.filter(q => q.id !== id);
  return questions.length < before;
}


/**
 * isDuplicate — Check if a question with same company+title already exists.
 * Used by the controller to enforce uniqueness.
 *
 * @param {string} company
 * @param {string} title
 * @param {number|null} excludeId - skip this id (used during edits)
 * @returns {boolean}
 */
function isDuplicate(company, title, excludeId = null) {
  return questions.some(q => {
    if (q.id === excludeId) return false;
    return (
      q.company.toLowerCase() === company.toLowerCase() &&
      q.title.toLowerCase()   === title.toLowerCase()
    );
  });
}


module.exports = { getAll, getById, create, update, remove, isDuplicate };
