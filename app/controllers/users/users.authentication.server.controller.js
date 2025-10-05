'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	config = require('../../../config/config'),
	cipherHelper = require('../../ngx-admin/api/common/auth/cipherHelper');
	// crypto = require('crypto');
require('../../ngx-admin/passport');

// function base64decode(data) {
// 	while (data.length % 4 !== 0) {
// 		data += '=';
// 	}
// 	data = data.replace(/-/g, '+').replace(/_/g, '/');
// 	return new Buffer(data, 'base64').toString('utf-8');
// }

// function parseSignedRequest(signedRequest, secret) {
// 	var encoded_data = signedRequest.split('.', 2);
// 	// decode the data
// 	var sig = encoded_data[0];
// 	var json = base64decode(encoded_data[1]);
// 	var data = JSON.parse(json);
// 	if (!data.algorithm || data.algorithm.toUpperCase() != 'HMAC-SHA256') {
// 		throw Error('Unknown algorithm: ' + data.algorithm + '. Expected HMAC-SHA256');
// 	}
// 	var expected_sig = crypto.createHmac('sha256', secret).update(encoded_data[1]).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace('=', '');
// 	if (sig !== expected_sig) {
// 		throw Error('Invalid signature: ' + sig + '. Expected ' + expected_sig);
// 	}
// 	return data;
// }

/**
 * Signup
 */
exports.signup = function (req, res) {
	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	// Init Variables
	var user = new User(req.body);
	var message = null;

	// Add missing user fields
	user.provider = 'local';
	user.displayName = user.firstName + ' ' + user.lastName;

	// Then save the user
	user.save(function (err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			req.login(user, function (err) {
				if (err) {
					res.status(400).send(err);
				} else {
					res.json(user);
				}
			});
		}
	});
};


/**
 * Facebook Data Delete Callback
 */
exports.fbDataDelete = function (req, res) {
	const response = { url: 'https://sravz.com/privacy', confirmation_code: Math.random().toString(36).slice(2) };
	res.send(response);
};


/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
	passport.authenticate('local', function (err, user, info) {
		if (err || !user) {
			res.status(400).send(info);
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;
			req.login(user, function (err) {
				if (err) {
					res.status(400).send(err);
				} else {
					res.json(user);
				}
			});
		}
	})(req, res, next);
};

exports.signintoken = function (req, res, next) {
	passport.authenticate('custom', function (err, user, info) {
		if (err || !user) {
			res.status(302).redirect(req.headers.referer);
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.token = undefined;
			user.salt = undefined;
			/* Somewhere these values are lost so save them here */
			var referer = req.headers.referer
			var protocol = req.protocol
			var host = req.headers.host
			req.login(user, function (err, req) {
				if (err) {
					if (info.redirect) {
						res.status(401).redirect(referer);
					} else {
						res.status(401).send("n");
					}
				} else {
					if (info.redirect) {
						res.status(302).redirect(protocol + "://" + host);
					} else {
						res.status(200).send("y");
					}
				}
			});
		}
	})(req, res, next);
};

// const auth = passport.authenticate('jwt', { session: false });
exports.verifytoken = function (req, res, next) {
	/* If already authenticated, do not verify token */
	if (req.isAuthenticated()) {
		next()
	}
	else {
		passport.authenticate('jwt', { session: false })(req, res, next);
		// passport.authenticate('custom', function (err, user, info) {
		// 	if (err || !user) {
		// 		res.status(401).send(info);
		// 	} else {
		// 		// Remove sensitive data before login
		// 		user.password = undefined;
		// 		user.token = undefined;
		// 		user.salt = undefined;
		// 		req.login(user, function (err, req) {
		// 			if (err) {
		// 				res.status(401).send(err);
		// 			} else {
		// 				next();
		// 			}
		// 		});
		// 	}
		// })(req, res, next);
	}
};

// Verify external social auth token
exports.verifyexternalauth = function (req, res, next) {
	/* If already authenticated, do not verify token */
	if (req.isAuthenticated()) {
		next()
	}
	else {
		var auth = new GoogleAuth();
		var client = new auth.OAuth2(config.GOOGLE_CLIENT_SECRET, config.GOOGLE_CLIENT_SECRET, config.google_callback);
		// check header or url parameters or post parameters for token
		var token = "";
		var tokenHeader = req.headers["authorization"];
		var items = tokenHeader.split(/[ ]+/);
		if (items.length > 1 && items[0].trim().toLowerCase() == "bearer") {
			token = items[1];
		}
		if (token) {
			var verifyToken = new Promise(function (resolve, reject) {
				client.verifyIdToken(
					token,
					config.GOOGLE_CLIENT_SECRET,
					function (e, login) {
						console.log(e);
						if (login) {
							var payload = login.getPayload();
							var googleId = payload['sub'];
							resolve(googleId);
							next();
						} else {
							reject("invalid token");
						}
					}
				)
			}).then(function (googleId) {
				res.send(googleId);
			}).catch(function (err) {
				res.send(err);
			})
		} else {
			res.send("Please pass token");
		}

		// passport.authenticate('jwt', { session: false })(req, res, next);
		// passport.authenticate('custom', function (err, user, info) {
		// 	if (err || !user) {
		// 		res.status(401).send(info);
		// 	} else {
		// 		// Remove sensitive data before login
		// 		user.password = undefined;
		// 		user.token = undefined;
		// 		user.salt = undefined;
		// 		req.login(user, function (err, req) {
		// 			if (err) {
		// 				res.status(401).send(err);
		// 			} else {
		// 				next();
		// 			}
		// 		});
		// 	}
		// })(req, res, next);
	}
};

/**
 * Signout
 */
exports.signout = function (req, res) {
	req.logout();
	res.redirect('/');
};

exports.signoutnoredirect = function (req, res) {
	req.logout();
	res.status(200).send("bye");
};


/**
 * OAuth callback
 */
exports.oauthCallbackTokenVerfiy = function () {
	return function (req, res, next) {
		if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
			res.send("Invalid reqest - request body missing");
		}

		let strategy = "";
		if (req.body.externalProvider && req.body.externalProvider !== "") {
			if (req.body.externalProvider === "Google") {
				strategy = 'google-token';
			} else if (req.body.externalProvider === "Facebook") {
				strategy = 'facebook-token';
			} else {
				res.send(`Invalid reqest - unknown external provider - ${req.body.externalProvider}`);
			}
		} else {
			res.send("Invalid reqest - external provider required");
		}

		passport.authenticate(strategy, function (err, user, redirectURL) {
			if (err || !user) {
				res.send(err);
			}
			req.login(user, { session: false }, (err) => {
				if (err) {
					res.send(err);
				}
				// Check if user is defined before generating tokens
				if (!user) {
					console.error('User is undefined in login callback');
					return res.status(500).send({ error: 'Authentication failed - user not found' });
				}
				const response = { token: cipherHelper.generateResponseTokens(user) };
				res.send(response);

			});
		})(req, res, next);
	};
};

exports.oauthCallback = function (strategy) {
	return function (req, res, next) {
		passport.authenticate(strategy, function (err, user, redirectURL) {
			if (err || !user) {
				return res.redirect('/#!/signin');
			}
			req.login(user, function (err) {
				if (err) {
					return res.redirect('/#!/signin');
				}

				return res.redirect(redirectURL || '/');
			});
		})(req, res, next);
	};
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
	if (!req.user) {
		// Define a search query fields
		var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
		var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

		// Define main provider search query
		var mainProviderSearchQuery = {};
		mainProviderSearchQuery.provider = providerUserProfile.provider;
		mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define additional provider search query
		var additionalProviderSearchQuery = {};
		additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define a search query to find existing user with current provider profile
		var searchQuery = {
			$or: [mainProviderSearchQuery, additionalProviderSearchQuery]
		};

		User.findOne(searchQuery, function (err, user) {
			if (err) {
				return done(err);
			} else {
				if (!user) {
					var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');
					User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
						user = new User({
							firstName: providerUserProfile.firstName,
							lastName: providerUserProfile.lastName,
							username: availableUsername,
							// This is unique ID to be used in the backend
							suid: cipherHelper.getHash(`${availableUsername}-${providerUserProfile.email}-${providerUserProfile.provider}`),
							displayName: providerUserProfile.displayName,
							email: providerUserProfile.email,
							provider: providerUserProfile.provider,
							providerData: providerUserProfile.providerData
						});

						// And save the user
						user.save(function (err, savedUser) {
							if (err) {
								console.error('Error saving new OAuth user:', err);
								return done(err, null);
							}
							console.log('Successfully created new OAuth user:', savedUser._id);
							return done(null, savedUser);
						});
					});
				} else {
					return done(err, user);
				}
			}
		});
	} else {
		// User is already logged in, join the provider data to the existing user
		var user = req.user;

		// Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
		if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
			// Add the provider data to the additional provider data field
			if (!user.additionalProvidersData) user.additionalProvidersData = {};
			user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');

			// And save the user
			user.save(function (err) {
				return done(err, user, '/#!/settings/accounts');
			});
		} else {
			return done(new Error('User is already connected using this provider'), user);
		}
	}
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
	var user = req.user;
	var provider = req.param('provider');

	if (user && provider) {
		// Delete the additional provider
		if (user.additionalProvidersData[provider]) {
			delete user.additionalProvidersData[provider];

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');
		}

		user.save(function (err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function (err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	}
};