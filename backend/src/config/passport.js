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
    // ✅ Thêm dòng này để bypass proxy issues
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('✅ Google OAuth callback received');
      console.log('📋 Profile ID:', profile.id);
      console.log('📋 Profile email:', profile.emails?.[0]?.value);
      
      const providerId = profile.id;
      const email = profile.emails?.[0]?.value?.toLowerCase();
      const name = profile.displayName || profile.name?.givenName;
      const avatar = profile.photos?.[0]?.value;

      if (!email) {
        console.error('❌ No email found in Google profile');
        return done(new Error('No email found in Google profile'), null);
      }

      // Tìm user theo Google ID
      let user = await User.findOne({ provider: 'google', providerId });

      // Nếu chưa có, tìm theo email để link account
      if (!user && email) {
        user = await User.findOne({ email });
        if (user) {
          // Link Google account với existing user
          user.provider = 'google';
          user.providerId = providerId;
          user.avatar = user.avatar || avatar;
          user.emailVerified = true;
          user.isActive = true;
          await user.save();
          console.log(`✅ Linked Google account to existing user: ${email}`);
          return done(null, user);
        }
      }

      // Nếu vẫn chưa có, tạo user mới
      if (!user) {
        user = await User.create({
          name: name || email.split('@')[0],
          email: email,
          provider: 'google',
          providerId,
          avatar,
          emailVerified: true,
          isActive: true,
          role: 'user'
        });
        console.log(`✅ Created new user via Google: ${email}`);
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
    profileFields: ['id', 'displayName', 'photos', 'email'], // ✅ Đúng rồi
    enableProof: true // ✅ Thêm dòng này cho bảo mật
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const providerId = profile.id;
      const email = profile.emails?.[0]?.value?.toLowerCase();
      const name = profile.displayName;
      const avatar = profile.photos?.[0]?.value;

      let user = await User.findOne({ provider: 'facebook', providerId });

      if (!user && email) {
        user = await User.findOne({ email });
        if (user) {
          user.provider = 'facebook';
          user.providerId = providerId;
          user.avatar = user.avatar || avatar;
          user.emailVerified = true;
          await user.save();
          return done(null, user);
        }
      }

      if (!user) {
        user = await User.create({
          name: name || email?.split('@')[0],
          email: email || undefined,
          provider: 'facebook',
          providerId,
          avatar,
          emailVerified: true
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

};