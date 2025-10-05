/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const passport = require('passport');
// const refresh = require('passport-oauth2-refresh')
const LocalStrategy = require('passport-local').Strategy;
// const OAuth2Strategy = require('passport-oauth2');
// const OAuth2RefreshTokenStrategy = require('passport-oauth2-middleware').Strategy;
const passportJWT = require('passport-jwt');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const config = require('../../config/config');

const cipher = require('./api/common/auth/cipherHelper');
const UserService = require('./api/common/user/userService');
const userService = new UserService();

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
},
(email, password, cb) => {
  console.log('LOCAL STRATEGY - Authentication attempt for email:', email);
  console.log('LOCAL STRATEGY - Password provided:', password ? '***PROVIDED***' : 'NO PASSWORD');
  
  // Special handling for guest user - bypass database lookup and password verification
  if (email === 'guest123@guest.com') {
    console.log('LOCAL STRATEGY - Guest user detected, bypassing authentication');
    const guestUser = {
      id: '507f1f77bcf86cd799439011', // Valid ObjectID for guest user
      _id: '507f1f77bcf86cd799439011',
      role: 'user',
      email: 'guest123@guest.com',
      username: 'Guest User',
      fullName: 'Guest User',
      suid: 'guest_suid'
    };
    console.log('LOCAL STRATEGY - Guest login success:', guestUser);
    return cb(null, guestUser, { message: 'Guest login successful' });
  }
  
  userService
    .findByEmail(email)
    .then(user => {
      console.log('LOCAL STRATEGY - User lookup result:');
      console.log('- User found:', !!user);
      
      if (user) {
        console.log('- User ID:', user._id);
        console.log('- User email:', user.email);
        console.log('- User role:', user.role);
        console.log('- User has salt:', !!user.salt);
        console.log('- User has passwordHash:', !!user.passwordHash);
        console.log('- User fullName:', user.fullName);
        console.log('- User suid:', user.suid);
      } else {
        console.log('- No user found with email:', email);
        return cb(null, false, { message: 'User not found with email: ' + email });
      }

      console.log('LOCAL STRATEGY - Computing password hash...');
      const { passwordHash } = cipher.sha512(password, user.salt);
      console.log('- Computed hash length:', passwordHash ? passwordHash.length : 0);
      console.log('- Stored hash length:', user.passwordHash ? user.passwordHash.length : 0);
      console.log('- Hashes match:', user.passwordHash === passwordHash);

      // Enable guest login by default
      if (user && config.auth.guest_user_enabled && user.email === config.auth.guest_user) {
        console.log(`LOCAL STRATEGY - Guest login enabled: ${config.auth.guest_user_enabled} and guest user allowed ${config.auth.guest_user}`);
        const guestUser = { 
          id: user._id,
          role: user.role,
          email: user.email,
          username: user.fullName,
          suid: user.suid
        };
        console.log('LOCAL STRATEGY - Guest login success:', guestUser);
        return cb(null, guestUser, { message: 'Logged In Successfully' });
      }

      if (!user || user.passwordHash !== passwordHash) {
        console.log('LOCAL STRATEGY - Authentication failed:');
        console.log('- User exists:', !!user);
        console.log('- Password match:', user && user.passwordHash === passwordHash);
        return cb(null, false, { message: 'Incorrect email or password.' });
      }

      const authenticatedUser = { 
        id: user._id,
        role: user.role,
        email: user.email,
        username: user.fullName,
        suid: user.suid
      };
      console.log('LOCAL STRATEGY - Authentication success:', authenticatedUser);
      return cb(null, authenticatedUser, { message: 'Logged In Successfully' });
    })
    .catch((e) => {
      console.error('LOCAL STRATEGY - Database error:', e);
      console.error('- Error message:', e.message);
      console.error('- Error stack:', e.stack);
      return cb(null, false, { message: 'Database error: ' + e.message });
    });
}));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.auth.jwt.accessTokenSecret,
},
(jwtPayload, cb) => {
  return cb(null, jwtPayload);
}));
