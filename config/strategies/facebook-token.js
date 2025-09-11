'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	url = require('url'),
	FacebookTokenStrategy = require('passport-facebook-token'),
	config = require('../config'),
	users = require('../../app/controllers/users.server.controller');

module.exports = function() {
	// Use google token strategy
	passport.use(new FacebookTokenStrategy({
		clientID: config.FACEBOOK_APP_ID,
		clientSecret: config.FACEBOOK_CLIENT_SECRET,
		fbGraphVersion: 'v3.0',
		passReqToCallback: true
	},
		function (req, accessToken, refreshToken, profile, done) {
			// Set the provider data and include tokens
			var providerData = profile._json;
			providerData.accessToken = accessToken;
			providerData.refreshToken = refreshToken;

			// Create the user OAuth profile
			var providerUserProfile = {
				facebookId: profile.id,
				firstName: profile.name[1],
				lastName: profile.name[0],
				middleName: profile.name[2],
				displayName: profile.displayName,
				gender: profile.gender,
				profileUrl: profile.profileUrl,
				email: profile.emails[0].value,
				photoUrl: profile.photo,
				username: profile.displayName,
				provider: 'facebook',
				providerIdentifierField: 'id',
				providerData: providerData
			};

			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
	));

};
