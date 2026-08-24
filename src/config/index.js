/* ============================================================
   src/config/index.js
   Central configuration — read from .env
   All other modules import config from here, never process.env directly.
   ============================================================ */

'use strict';

require('dotenv').config();

/* ── Fail fast if required env vars are missing ─────────────── */
if (!process.env.MONGODB_URI) {
  console.error('\n❌  MONGODB_URI is not set in your .env file.');
  console.error('    Add your MongoDB Atlas connection string and restart.\n');
  process.exit(1);
}

const config = {
  port:     process.env.PORT      || 3000,
  nodeEnv:  process.env.NODE_ENV  || 'development',
  mongoUri: process.env.MONGODB_URI,
};

module.exports = config;

