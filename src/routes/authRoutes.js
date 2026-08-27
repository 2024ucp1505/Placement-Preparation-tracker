'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();

// Trigger Google Sign-In
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard.
    res.redirect('/dashboard');
  }
);

// Check Session / Current User
router.get('/current_user', (req, res) => {
  res.send(req.user || null);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send('Error logging out');
    res.redirect('/');
  });
});

module.exports = router;
