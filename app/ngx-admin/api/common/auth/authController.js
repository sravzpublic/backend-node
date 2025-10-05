/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const express = require('express');
const passport = require('passport');

const cipher = require('../auth/cipherHelper');
const AuthService = require('./authService');

const router = express.Router();
const authService = new AuthService();
const auth = passport.authenticate('jwt', { session: false });


router.post('/login', (req, res) => {
  console.log('LOGIN ATTEMPT - Request body:', JSON.stringify(req.body, null, 2));
  console.log('LOGIN ATTEMPT - Headers:', JSON.stringify(req.headers, null, 2));
  
  passport.authenticate('local', { session: false }, (err, user, info) => {
    console.log('PASSPORT AUTH RESULT:');
    console.log('- Error:', err);
    console.log('- User:', user ? { id: user.id || user._id, email: user.email, role: user.role } : null);
    console.log('- Info:', info);
    
    if (err) {
      console.error('PASSPORT AUTH ERROR:', err);
      return res.status(401).send({
        error: err.message || 'Authentication error',
      });
    }
    
    if (!user) {
      console.error('PASSPORT AUTH FAILED: No user returned');
      console.error('- Request email:', req.body.email);
      console.error('- Info message:', info ? info.message : 'No info provided');
      return res.status(401).send({
        error: info ? info.message : 'Login or password is wrong',
      });
    }
    
    console.log('PASSPORT AUTH SUCCESS - User found:', { id: user.id || user._id, email: user.email });
    
    req.login(user, { session: false }, (error) => {
      if (error) {
        console.error('REQ.LOGIN ERROR:', error);
        return res.status(500).send({ error: error.message || 'Login session error' });
      }

      // Check if user is defined before generating tokens
      if (!user) {
        console.error('User is undefined in ngx-admin login callback');
        return res.status(500).send({ error: 'Authentication failed - user not found' });
      }

      console.log('TOKEN GENERATION - User data:', { id: user.id || user._id, email: user.email, role: user.role });
      
      try {
        const response = { token: cipher.generateResponseTokens(user) };
        console.log('LOGIN SUCCESS - Token generated for user:', user.email);
        res.send(response);
      } catch (tokenError) {
        console.error('TOKEN GENERATION ERROR:', tokenError);
        return res.status(500).send({ error: 'Token generation failed' });
      }
    });
  })(req, res);
});

router.post('/sign-up', (req, res) => {
  authService
    .register(req.body)
    .then(user => {
      const response = { token: cipher.generateResponseTokens(user) };

      res.send(response);
    })
    .catch(err => res.status(400).send({ error: err.message }));
});

router.post('/reset-pass', auth, (req, res) => {
  const { id } = req.user;
  const { password, confirmPassword, resetPasswordToken } = req.body;

  authService
    .resetPassword(password, confirmPassword, id, resetPasswordToken)
    .then(() => res.send({ message: 'ok' }))
    .catch(err => {
      res.status(400).send({ error: err.message });
    });
});

router.post('/request-pass', (req, res) => {
  const { email } = req.body;
  authService
    .requestPassword(email)
    .then(() => res.send({ message: `Email with reset password instructions was sent to email ${email}.` }))
    .catch((error) => {
      res.status(400).send({ data: { errors: error.message } });
    });
});

router.post('/sign-out', (req, res) => {
  res.send({ message: 'ok' });
});

router.post('/refresh-token', (req, res) => {
  const token = req.body;
  authService
    .refreshToken(token)
    .then(tokens => res.send(tokens))
    .catch(err => res.status(400).send({ error: err.message }));
});

module.exports = router;
