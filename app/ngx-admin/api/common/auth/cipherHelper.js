/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const crypto = require('crypto');
const config = require('../../../../../config/config');
const jwt = require('jsonwebtoken');

const {
  secret, ttl, algorithm, inputEncoding, outputEncoding,
} = config.auth.resetPassword;

function genRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

function getStringValue(data) {
  if (typeof data === 'number' || data instanceof Number) {
    return data.toString();
  }
  if (!Buffer.isBuffer(data) && typeof data !== 'string') {
    throw new TypeError('Data for password or salt must be a string or a buffer');
  }
  return data;
}

function sha512(password, salt) {
  const hash = crypto.createHmac('sha512', getStringValue(salt));
  hash.update(getStringValue(password));
  const passwordHash = hash.digest('hex');

  return {
    salt,
    passwordHash,
  };
}

function saltHashPassword(password) {
  const salt = genRandomString(16);
  return sha512(getStringValue(password), salt);
}

function generateResetPasswordToken(userId) {
  const text = JSON.stringify({ userId, valid: new Date().getTime() + ttl });

  const cipher = crypto.createCipher(algorithm, secret);
  let ciphered = cipher.update(text, inputEncoding, outputEncoding);
  ciphered += cipher.final(outputEncoding);

  return ciphered;
}

function decipherResetPasswordToken(ciphered) {
  const decipher = crypto.createDecipher(algorithm, secret);
  let deciphered = decipher.update(ciphered, outputEncoding, inputEncoding);
  deciphered += decipher.final(inputEncoding);

  return JSON.parse(deciphered);
}

function generateResponseTokens(user) {
  const normalizedUser = { id: user.id,
    role: user.role,
    suid: user.suid
    // Removed email and username to prevent email harvest
    // email: user.email,
    // username: user.username
   };
  const accessToken = jwt.sign(
    normalizedUser,
    config.auth.jwt.accessTokenSecret,
    { expiresIn: config.auth.jwt.accessTokenLife },
  );
  const refreshToken = jwt.sign(
    normalizedUser,
    config.auth.jwt.refreshTokenSecret,
    { expiresIn: config.auth.jwt.refreshTokenLife },
  );

  return {
    expires_in: config.auth.jwt.accessTokenLife,
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}

function getHash(key) {
  return crypto.createHash('md5').update(key).digest("hex");
}

module.exports = {
  saltHashPassword,
  sha512,
  generateResetPasswordToken,
  decipherResetPasswordToken,
  generateResponseTokens,
  getHash
};
