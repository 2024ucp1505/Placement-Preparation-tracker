'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
