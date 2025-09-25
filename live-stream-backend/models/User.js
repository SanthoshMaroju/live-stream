const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    // Email is required if it's a local account (no social IDs)
    // If a social ID is present, email is optional (can be null)
    required: function() { return !this.googleId && !this.facebookId && !this.githubId; },
    unique: true,
    trim: true,
    lowercase: true,
    sparse: true // Allows multiple documents to have null for this field if not required, while maintaining uniqueness for non-null values
  },
  password: {
    type: String,
    required: function() { return !this.googleId && !this.facebookId && !this.githubId; } // Required if not social login
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);