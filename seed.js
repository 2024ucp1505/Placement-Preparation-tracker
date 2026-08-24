'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./src/models/questionModel'); // Note: it exports model functions, wait, questionModel exports { getAll, getById, create, update, remove, isDuplicate }, NOT the Mongoose model directly.

// Wait, the questionModel.js exports functions, not the mongoose model! Let's check how to seed it.
// I can just use the `create` function from questionModel.js.
const model = require('./src/models/questionModel');
const connectDB = require('./src/config/db');

const sampleQuestions = [
  {
    company: 'Amazon',
    topic: 'Arrays',
    title: 'Two Sum',
    link: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'Easy',
    status: 'Solved'
  },
  {
    company: 'Google',
    topic: 'Graphs',
    title: 'Number of Islands',
    link: 'https://leetcode.com/problems/number-of-islands/',
    difficulty: 'Medium',
    status: 'Unsolved'
  },
  {
    company: 'Microsoft',
    topic: 'Linked List',
    title: 'Reverse Linked List',
    link: 'https://leetcode.com/problems/reverse-linked-list/',
    difficulty: 'Easy',
    status: 'Solved'
  },
  {
    company: 'Adobe',
    topic: 'DP',
    title: 'Climbing Stairs',
    link: 'https://leetcode.com/problems/climbing-stairs/',
    difficulty: 'Easy',
    status: 'Unsolved'
  },
  {
    company: 'Flipkart',
    topic: 'Trees',
    title: 'Lowest Common Ancestor',
    link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
    difficulty: 'Medium',
    status: 'Unsolved'
  }
];

async function seedDB() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // We can't easily clear the collection via the model functions since there's no `removeAll`.
    // But we can reach the raw mongoose model or just insert.
    // For simplicity, let's just insert them (it will fail if duplicates exist due to our logic, which is fine, or we can just drop the DB).
    await mongoose.connection.db.dropCollection('questions').catch(() => console.log('Collection might not exist yet, continuing...'));
    console.log('🗑️  Cleared existing questions collection.');

    let count = 0;
    for (const q of sampleQuestions) {
      await model.create(q);
      count++;
    }

    console.log(`✅ Successfully seeded ${count} questions.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedDB();
