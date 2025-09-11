'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	url = require('url'),
	GoogleTokenStrategy = require('passport-google-token').Strategy,
	config = require('../config'),
	users = require('../../app/controllers/users.server.controller');

module.exports = function() {
	// Use google token strategy
	passport.use(new GoogleTokenStrategy({
		clientID: config.GOOGLE_CLIENT_KEY,
		clientSecret: config.GOOGLE_CLIENT_SECRET,
		passReqToCallback: true
	},
		function (req, accessToken, refreshToken, profile, done) {
			// Set the provider data and include tokens
			var providerData = profile._json;
			providerData.accessToken = accessToken;
			providerData.refreshToken = refreshToken;

			// Create the user OAuth profile
			var providerUserProfile = {
				firstName: profile.name.givenName,
				lastName: profile.name.familyName,
				displayName: profile.displayName,
				email: profile.emails[0].value,
				username: profile.username,
				provider: 'google',
				providerIdentifierField: 'id',
				providerData: providerData
			};

			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
	));

};
