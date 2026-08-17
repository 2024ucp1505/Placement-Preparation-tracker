/* ============================================================
   server.js — Entry Point
   Boots the Express application:
     1. Load config
     2. Register middleware
     3. Serve static frontend from /public
     4. Mount REST API routes
     5. Attach global error handler
     6. Start listening
   ============================================================ */

'use strict';

const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const config       = require('./src/config');
const questionRoutes = require('./src/routes/questionRoutes');
const errorHandler   = require('./src/middleware/errorHandler');

const app = express();

/* ── Middleware ────────────────────────────────────────────── */
app.use(cors());                          // allow cross-origin during dev
app.use(express.json());                  // parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // parse form bodies

/* ── Static Files (View layer) ─────────────────────────────── */
// Express will serve index.html, style.css, script.js from /public
app.use(express.static(path.join(__dirname, 'public')));

/* ── API Routes ────────────────────────────────────────────── */
app.use('/api/questions', questionRoutes);

/* ── 404 catch-all for unknown API routes ──────────────────── */
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

/* ── SPA fallback — serve index.html for any non-API route ─── */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── Global Error Handler (must be last) ───────────────────── */
app.use(errorHandler);

/* ── Start Server ──────────────────────────────────────────── */
app.listen(config.port, () => {
  console.log(`\n🚀  Placement Tracker server running`);
  console.log(`    Mode : ${config.nodeEnv}`);
  console.log(`    URL  : http://localhost:${config.port}\n`);
});

module.exports = app; // exported for future testing
