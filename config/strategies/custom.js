'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    CustomStrategy = require('passport-custom').Strategy,
    User = require('mongoose').model('User');

module.exports = function () {
    // Use local strategy
    passport.use('custom', new CustomStrategy(
        function (req, done) {
            var userName = req.headers['x-user'],
                redirect = req.headers['x-return'],
                performRedirect = false;
            var token = null;
            if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
                token = req.headers.authorization.split(' ')[1];
            if (redirect === 'y')
                performRedirect = true;
            if(!userName || !token)
            {
                return done(null, false, {
                    message: 'Unknown user or token',
                    redirect: performRedirect
                });
            }
            User.findOne({ username: userName }, function (err, user) {
                if (err) {
                	console.error('Error username :' + userName + ' Not found' + err);
                    return done(err);
                }
                // If Guest do not match token, implement logic to allow multiple guest logins
                // If the Guest login expires force
                if (userName == 'Guest') {
                    console.info('Allowing guest login');
                    return done(null, user, {
                        message: 'Allowing guest login',
                        redirect: performRedirect
                    });
                }
                if (!user || user.token !== token || new Date(user.issued) > new Date() || new Date(user.expires) < new Date()) {
                	console.error('Unknown user username :' + userName + ' or token ' + token + ' token found in db ' + user.token);
                    return done(null, false, {
                        message: 'Unknown user or token',
                        redirect: performRedirect
                    });
                }
                if (new Date(user.issued) > new Date() || new Date(user.expires) < new Date()) {
                	console.error('Uername :' + userName + ' token ' + token + ' expired. Issued Date: ' + user.issued + ' Expires:' + user.expires);
                    return done(null, false, {
                        message: 'Token expired',
                        redirect: performRedirect
                    });
                }
                return done(null, user, {
                    message: 'User/Token match, perform login',
                    redirect: performRedirect
                });
            });
        }
    ));
};