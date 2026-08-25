'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/userModel');
require('./src/models/questionModel'); // This registers the model
const Question = mongoose.models.Question;
const seedQuestions = require('./src/data/seedQuestions');
const dsaQuestions = require('./src/data/dsaQuestions');

const emailToSeed = process.argv[2];

if (!emailToSeed) {
  console.error('❌ Please provide an email address.');
  console.error('Usage: node seed_dsa.js <email>');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-tracker');
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: emailToSeed });
    if (!user) {
      console.error(`❌ User with email ${emailToSeed} not found in the database.`);
      console.error('Make sure you have logged in via Google at least once with this email.');
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.displayName} (${user._id})`);

    // 1. Clear existing Core/Dev questions for this user to re-seed the new markdown parser ones
    await Question.deleteMany({ userId: user._id, category: { $in: ['Core', 'Development'] } });
    console.log('🗑️  Cleared old Core and Development questions.');

    // 2. Insert the fresh 370+ markdown questions
    const coreDevDocs = seedQuestions.map(q => ({ ...q, userId: user._id }));
    await Question.insertMany(coreDevDocs);
    console.log(`✅ Seeded ${coreDevDocs.length} Core and Development questions from markdown files.`);

    // 3. Clear existing DSA questions (optional, but good for a clean slate)
    await Question.deleteMany({ userId: user._id, category: 'DSA' });
    
    // 4. Insert full DSA questions
    const dsaDocs = dsaQuestions.map(q => ({ ...q, userId: user._id }));
    await Question.insertMany(dsaDocs);
    console.log(`✅ Seeded ${dsaDocs.length} comprehensive DSA questions.`);

    console.log('🎉 Seeding complete! You can now refresh your dashboard.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
