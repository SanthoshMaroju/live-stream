const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      username,
      email,
      password
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Check if user has a password (not a social login user trying to log in with email/password)
    if (!user.password) {
        return res.status(400).json({ msg: 'Please use social login for this account' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth Callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }), // Redirect on failure
  (req, res) => {
    // Successful authentication, generate JWT
    const payload = {
      user: {
        id: req.user.id // req.user is set by Passport after successful authentication
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        // For a real frontend, you'd redirect with the token (e.g., in a query param or cookie)
        // For now, we'll just send it as JSON or redirect to a success page.
        res.json({ token, user: req.user }); // Sending user data for demonstration
        // Or redirect to your frontend with the token:
        // res.redirect(`http://localhost:3000/auth/success?token=${token}`);
      }
    );
  }
);

// @route   GET /api/auth/facebook
// @desc    Authenticate with Facebook
// @access  Public
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['public_profile'] }) // Changed scope from ['email', 'public_profile']
);

// @route   GET /api/auth/facebook/callback
// @desc    Facebook OAuth Callback
// @access  Public
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, generate JWT
    const payload = {
      user: {
        id: req.user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: req.user });
      }
    );
  }
);

module.exports = router;