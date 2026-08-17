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

const model = require('../models/questionModel');


/* ── GET /api/questions ──────────────────────────────────────
   Returns all questions, filtered by optional query params.
   Query params: search, company, topic, difficulty, status
   ──────────────────────────────────────────────────────────── */
function getAllQuestions(req, res, next) {
  try {
    const filters = {
      search:     req.query.search     || '',
      company:    req.query.company    || '',
      topic:      req.query.topic      || '',
      difficulty: req.query.difficulty || '',
      status:     req.query.status     || '',
    };

    const questions = model.getAll(filters);
    res.status(200).json(questions);
  } catch (err) {
    next(err);
  }
}


/* ── GET /api/questions/:id ──────────────────────────────────
   Returns a single question by numeric ID.
   ──────────────────────────────────────────────────────────── */
function getQuestionById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID — must be a number.' });
    }

    const question = model.getById(id);

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
function createQuestion(req, res, next) {
  try {
    const { company, topic, title, link, difficulty, status } = req.body;

    // Business rule: no duplicate company + title combinations
    if (model.isDuplicate(company, title, null)) {
      return res.status(409).json({
        error: `A question titled "${title}" for ${company} already exists.`,
      });
    }

    const newQuestion = model.create({ company, topic, title, link, difficulty, status });

    console.log(`✅ Created question [${newQuestion.id}]: "${newQuestion.title}" — ${newQuestion.company}`);
    res.status(201).json(newQuestion);
  } catch (err) {
    next(err);
  }
}


/* ── PUT /api/questions/:id ──────────────────────────────────
   Updates an existing question.
   Body is already validated and sanitised by the middleware.
   ──────────────────────────────────────────────────────────── */
function updateQuestion(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID — must be a number.' });
    }

    const { company, topic, title, link, difficulty, status } = req.body;

    // Duplicate check — exclude the question being updated
    if (model.isDuplicate(company, title, id)) {
      return res.status(409).json({
        error: `Another question titled "${title}" for ${company} already exists.`,
      });
    }

    const updated = model.update(id, { company, topic, title, link, difficulty, status });

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
function deleteQuestion(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID — must be a number.' });
    }

    const deleted = model.remove(id);

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
