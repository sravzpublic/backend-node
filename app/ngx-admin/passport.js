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
  userService
    .findByEmail(email)
    .then(user => {
      const { passwordHash } = cipher.sha512(password, user.salt);

      // Enable guest login by default
      if (user && config.auth.guest_user_enabled && user.email === config.auth.guest_user) {
        console.log(`Guest login enabled: ${config.auth.guest_user_enabled} and guest user allowed ${config.auth.guest_user}`);
        return cb(null, { id: user._id,
          role: user.role,
          email: user.email,
          username: user.fullName,
          suid: user.suid
         }, { message: 'Logged In Successfully' });
      }

      if (!user || user.passwordHash !== passwordHash) {
          return cb(null, false, { message: 'Incorrect utils or password.' });
      }

      return cb(null, { id: user._id,
        role: user.role,
        email: user.email,
        username: user.fullName,
        suid: user.suid
       }, { message: 'Logged In Successfully' });
    })
    .catch((e) => cb(null, false, { message: 'Incorrect utils or password.' + e }));
}));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.auth.jwt.accessTokenSecret,
},
(jwtPayload, cb) => {
  return cb(null, jwtPayload);
}));
