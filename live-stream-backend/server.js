require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport'); // NEW
const session = require('express-session'); // NEW (requires npm install express-session)

const authRoutes = require('./routes/auth'); // Import auth routes

// Load Passport config
require('./config/passport')(passport); // NEW

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable CORS for all origins

// Express Session Middleware (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat', // Use a strong secret from .env
    resave: false,
    saveUninitialized: false
  })
);

// Passport Middleware
app.use(passport.initialize()); // NEW
app.use(passport.session()); // NEW

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Routes
app.use('/api/auth', authRoutes); // Use the authentication routes

// Basic root route
app.get('/', (req, res) => {
  res.send('Authentication Service Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));