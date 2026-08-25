/* ============================================================
   src/controllers/questionController.js — Controller Layer

   One exported function per route.
   Responsibilities:
     - Receive validated req.body / req.params / req.query
     - Apply business rules (duplicate check, not-found logic)
     - Call the Model
     - Send the HTTP response

   What this file must NOT do:
     - Touch raw storage (array / DB directly)
     - Know how data is persisted (that belongs in the model)
   ============================================================ */

'use strict';

const mongoose = require('mongoose');
const model    = require('../models/questionModel');


/* ── GET /api/questions ──────────────────────────────────────
   Returns all questions, filtered by optional query params.
   Query params: search, company, topic, difficulty, status
   ──────────────────────────────────────────────────────────── */
async function getAllQuestions(req, res, next) {
  try {
    const filters = {
      search:     req.query.search     || '',
      company:    req.query.company    || '',
      topic:      req.query.topic      || '',
      difficulty: req.query.difficulty || '',
      status:     req.query.status     || '',
      category:   req.query.category   || '',
      starred:    req.query.starred    || '',
    };

    const userId = req.user._id;
    const questions = await model.getAll(userId, filters);
    res.status(200).json(questions);
  } catch (err) {
    next(err);
  }
}


/* ── GET /api/questions/:id ──────────────────────────────────
   Returns a single question by numeric ID.
   ──────────────────────────────────────────────────────────── */
async function getQuestionById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }

    const question = await model.getById(userId, id);

    if (!question) {
      return res.status(404).json({ error: `Question with id ${id} not found.` });
    }

    res.status(200).json(question);
  } catch (err) {
    next(err);
  }
}


/* ── POST /api/questions ─────────────────────────────────────
   Creates a new question.
   Body is already validated and sanitised by the middleware.
   ──────────────────────────────────────────────────────────── */
async function createQuestion(req, res, next) {
  try {
    const { company, topic, title, link, difficulty, status, category, starred, notes, chapter, content } = req.body;
    const userId = req.user._id;

    // Business rule: no duplicate company + title combinations
    if (await model.isDuplicate(userId, company, title, null)) {
      return res.status(409).json({
        error: `A question titled "${title}" for ${company} already exists.`,
      });
    }

    const newQuestion = await model.create(userId, { company, topic, title, link, difficulty, status, category, starred, notes, chapter, content });

    console.log(`✅ Created question [${newQuestion._id}]: "${newQuestion.title}" — ${newQuestion.company}`);
    res.status(201).json(newQuestion);
  } catch (err) {
    next(err);
  }
}


/* ── PUT /api/questions/:id ──────────────────────────────────
   Updates an existing question.
   Body is already validated and sanitised by the middleware.
   ──────────────────────────────────────────────────────────── */
async function updateQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }

    const { company, topic, title, link, difficulty, status, category, starred, notes, chapter, content } = req.body;

    // Duplicate check — exclude the question being updated
    if (await model.isDuplicate(userId, company, title, id)) {
      return res.status(409).json({
        error: `Another question titled "${title}" for ${company} already exists.`,
      });
    }

    const updated = await model.update(userId, id, { company, topic, title, link, difficulty, status, category, starred, notes, chapter, content });

    if (!updated) {
      return res.status(404).json({ error: `Question with id ${id} not found.` });
    }

    console.log(`✏️  Updated question [${id}]: "${updated.title}"`);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}


/* ── DELETE /api/questions/:id ───────────────────────────────
   Deletes a question by ID.
   Returns 204 No Content on success (no body).
   ──────────────────────────────────────────────────────────── */
async function deleteQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }

    const deleted = await model.remove(userId, id);

    if (!deleted) {
      return res.status(404).json({ error: `Question with id ${id} not found.` });
    }

    console.log(`🗑️  Deleted question [${id}]`);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}


module.exports = {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
