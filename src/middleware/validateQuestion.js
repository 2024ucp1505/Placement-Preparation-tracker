/* ============================================================
   src/middleware/validateQuestion.js
   Validates the request body before it reaches the controller.
   Returns 400 Bad Request with field-level error messages if
   any required field is missing or malformed.
   Calls next() if everything is valid.
   ============================================================ */

'use strict';

/* Allowed values for enum fields */
const VALID_COMPANIES   = ['Amazon', 'Google', 'Microsoft', 'Adobe', 'Flipkart', 'Walmart', 'Other'];
const VALID_TOPICS      = ['Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Binary Search', 'Trees', 'Graphs', 'DP', 'Greedy', 'Backtracking', 'Heap', 'Other'];
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const VALID_STATUSES    = ['Solved', 'Unsolved'];

/**
 * URL format check — very permissive, just ensures the string
 * starts with http:// or https://
 */
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * validateQuestion middleware
 * Attached to POST /api/questions and PUT /api/questions/:id
 */
function validateQuestion(req, res, next) {
  const { company, topic, title, link, difficulty, status } = req.body;
  const errors = {};

  /* ── Required field checks ──────────────────────────────── */
  if (!company || !company.trim()) {
    errors.company = 'Company is required.';
  } else if (!VALID_COMPANIES.includes(company.trim())) {
    errors.company = `Company must be one of: ${VALID_COMPANIES.join(', ')}.`;
  }

  if (!topic || !topic.trim()) {
    errors.topic = 'Topic is required.';
  } else if (!VALID_TOPICS.includes(topic.trim())) {
    errors.topic = `Topic must be one of: ${VALID_TOPICS.join(', ')}.`;
  }

  if (!title || !title.trim()) {
    errors.title = 'Question title is required.';
  } else if (title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters.';
  }

  if (!difficulty || !difficulty.trim()) {
    errors.difficulty = 'Difficulty is required.';
  } else if (!VALID_DIFFICULTIES.includes(difficulty.trim())) {
    errors.difficulty = `Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}.`;
  }

  if (!status || !status.trim()) {
    errors.status = 'Status is required.';
  } else if (!VALID_STATUSES.includes(status.trim())) {
    errors.status = `Status must be one of: ${VALID_STATUSES.join(', ')}.`;
  }

  /* ── Optional field checks ──────────────────────────────── */
  if (link && link.trim() && !isValidUrl(link.trim())) {
    errors.link = 'Link must be a valid URL (http:// or https://).';
  }

  /* ── If any errors, return 400 ──────────────────────────── */
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error:  'Validation failed. Please fix the following fields.',
      fields: errors,
    });
  }

  /* ── Sanitise — trim all strings before passing to controller ── */
  req.body.company    = company.trim();
  req.body.topic      = topic.trim();
  req.body.title      = title.trim();
  req.body.link       = (link || '').trim();
  req.body.difficulty = difficulty.trim();
  req.body.status     = status.trim();

  next();
}

module.exports = validateQuestion;
