const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  // Google Strategy (no changes needed here for this issue)
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value
        };

        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            done(null, user);
          } else {
            let existingUserByEmail = await User.findOne({ email: profile.emails[0].value });
            if (existingUserByEmail) {
                existingUserByEmail.googleId = profile.id;
                await existingUserByEmail.save();
                done(null, existingUserByEmail);
            } else {
                // Handle potential duplicate username for Google as well, similar to Facebook
                let finalUsername = newUser.username;
                let userCreated = false;
                let attempt = 0;
                let createdUser;

                while (!userCreated && attempt < 5) { // Try a few times
                    try {
                        createdUser = await User.create({ ...newUser, username: finalUsername });
                        userCreated = true;
                    } catch (createErr) {
                        if (createErr.code === 11000 && createErr.message.includes('username_1')) {
                            // Duplicate username, try a new one
                            attempt++;
                            finalUsername = `${newUser.username}_${Math.random().toString(36).substring(2, 7)}`; // Append random string
                            console.warn(`Google Login: Duplicate username "${newUser.username}", trying "${finalUsername}"`);
                        } else {
                            // Other error, rethrow
                            throw createErr;
                        }
                    }
                }

                if (!userCreated) {
                    return done(new Error('Google Login: Failed to create user with unique username after multiple attempts'), null);
                }
                done(null, createdUser);
            }
          }
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );

  // Facebook Strategy // MODIFIED
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: '/api/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'emails'],
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          facebookId: profile.id,
          username: profile.displayName,
          email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null
        };

        try {
          let user = await User.findOne({ facebookId: profile.id });

          if (user) {
            done(null, user);
          } else {
            // Check if a user with this email already exists (e.g., registered locally or via Google)
            if (newUser.email) {
                let existingUserByEmail = await User.findOne({ email: newUser.email });
                if (existingUserByEmail) {
                    existingUserByEmail.facebookId = profile.id;
                    await existingUserByEmail.save();
                    done(null, existingUserByEmail);
                    return;
                }
            }

            // Create new user if no existing user found by Facebook ID or email
            // Handle potential duplicate username
            let finalUsername = newUser.username;
            let userCreated = false;
            let attempt = 0;
            let createdUser;

            while (!userCreated && attempt < 5) { // Try a few times to create a unique username
                try {
                    createdUser = await User.create({ ...newUser, username: finalUsername });
                    userCreated = true;
                } catch (createErr) {
                    if (createErr.code === 11000 && createErr.message.includes('username_1')) {
                        // Duplicate username, try a new one
                        attempt++;
                        finalUsername = `${newUser.username}_${Math.random().toString(36).substring(2, 7)}`; // Append random string
                        console.warn(`Facebook Login: Duplicate username "${newUser.username}", trying "${finalUsername}"`);
                    } else {
                        // Other error, rethrow
                        throw createErr;
                    }
                }
            }

            if (!userCreated) {
                return done(new Error('Facebook Login: Failed to create user with unique username after multiple attempts'), null);
            }
            done(null, createdUser);
          }
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );

  // Serialize and deserialize user (remains the same)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};