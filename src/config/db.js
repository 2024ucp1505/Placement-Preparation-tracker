/* ============================================================
   src/config/db.js — Mongoose Connection
   Exports connectDB(), an async function that opens the
   Mongoose connection to MongoDB Atlas.

   Called once at startup in server.js — the server only
   begins listening after this resolves successfully.
   ============================================================ */

'use strict';

const mongoose = require('mongoose');
const config   = require('./index');

/**
 * connectDB — Connect to MongoDB Atlas using the URI from .env.
 * Exits the process with code 1 on failure so nodemon/PM2
 * can restart cleanly.
 */
async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

/* ── Log connection events after initial connect ────────────── */
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️   MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅  MongoDB reconnected.');
});

module.exports = connectDB;
