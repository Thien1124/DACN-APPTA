const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

module.exports = function passportConfig() {
  // ========== GOOGLE STRATEGY ==========
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('✅ Google OAuth callback received');
      console.log('Profile:', {
        id: profile.id,
        email: profile.emails && profile.emails[0] && profile.emails[0].value,
        name: profile.displayName
      });

      const providerId = profile.id;
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      const name = profile.displayName || 'Google User';
      const avatar = profile.photos && profile.photos[0] && profile.photos[0].value;

      if (!email) {
        return done(new Error('No email found in Google profile'));
      }

      // Find or create user
      let user = await User.findOne({
        $or: [
          { provider: 'google', providerId },
          { email: email.toLowerCase() }
        ]
      });

      if (user) {
        // Update existing user
        user.provider = 'google';
        user.providerId = providerId;
        user.avatar = user.avatar || avatar;
        user.emailVerified = true;
        user.isActive = true;
        await user.save();
        console.log('✅ Updated existing user:', user.email);
      } else {
        // Create new user
        user = await User.create({
          email: email.toLowerCase(),
          name: name || email.split('@')[0],
          provider: 'google',
          providerId,
          avatar,
          emailVerified: true,
          isActive: true,
          role: 'user'
        });
        console.log('✅ Created new user:', user.email);
      }

      return done(null, user);

    } catch (err) {
      console.error('❌ Google OAuth error:', err);
      return done(err, null);
    }
  }));

  // ========== FACEBOOK STRATEGY ==========
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'photos', 'email'],
    enableProof: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('✅ Facebook OAuth callback received');
      console.log('Profile:', {
        id: profile.id,
        email: profile.emails && profile.emails[0] && profile.emails[0].value,
        name: profile.displayName
      });

      const providerId = profile.id;
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      const name = profile.displayName || 'Facebook User';
      const avatar = profile.photos && profile.photos[0] && profile.photos[0].value;

      // Find user by Facebook ID first
      let user = await User.findOne({ provider: 'facebook', providerId });

      // If not found by Facebook ID, try email
      if (!user && email) {
        user = await User.findOne({ email: email.toLowerCase() });
        
        if (user) {
          // Link Facebook to existing account
          user.provider = 'facebook';
          user.providerId = providerId;
          user.avatar = user.avatar || avatar;
          user.emailVerified = true;
          user.isActive = true;
          await user.save();
          console.log('✅ Linked Facebook account to:', user.email);
        }
      }

      // If still no user, create new one
      if (!user) {
        user = await User.create({
          email: email ? email.toLowerCase() : undefined,
          name: name,
          provider: 'facebook',
          providerId,
          avatar,
          emailVerified: true,
          isActive: true,
          role: 'user'
        });
        console.log('✅ Created new Facebook user:', email || providerId);
      }

      return done(null, user);

    } catch (err) {
      console.error('❌ Facebook OAuth error:', err);
      return done(err, null);
    }
  }));
};