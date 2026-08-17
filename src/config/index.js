/* ============================================================
   src/config/index.js
   Central configuration — read from .env
   All other modules import config from here, never process.env directly.
   ============================================================ */

'use strict';

require('dotenv').config();

const config = {
  port:    process.env.PORT    || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // ── Future DB config (uncomment when adding a database) ──
  // dbUrl:  process.env.DB_URL,
  // dbName: process.env.DB_NAME || 'placement_tracker',
};

module.exports = config;
