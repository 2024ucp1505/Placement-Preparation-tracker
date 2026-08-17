/* ============================================================
   src/routes/questionRoutes.js
   Maps HTTP verbs + paths to controller functions.
   Validation middleware runs before every write operation.
   ============================================================ */

'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/questionController');
const validate   = require('../middleware/validateQuestion');

/* ── READ ───────────────────────────────────────────────────── */
router.get('/',    controller.getAllQuestions);    // GET  /api/questions
router.get('/:id', controller.getQuestionById);   // GET  /api/questions/:id

/* ── WRITE (validation runs first) ─────────────────────────── */
router.post('/',    validate, controller.createQuestion);    // POST   /api/questions
router.put('/:id',  validate, controller.updateQuestion);   // PUT    /api/questions/:id
router.delete('/:id', controller.deleteQuestion);           // DELETE /api/questions/:id

module.exports = router;
