'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Asset = mongoose.model('Asset'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, asset;

/**
 * Asset routes tests
 */
describe('Asset CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Asset
		user.save(function() {
			asset = {
				name: 'Asset Name'
			};

			done();
		});
	});

	it('should be able to save Asset instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Asset
				agent.post('/assets')
					.send(asset)
					.expect(200)
					.end(function(assetSaveErr, assetSaveRes) {
						// Handle Asset save error
						if (assetSaveErr) done(assetSaveErr);

						// Get a list of Assets
						agent.get('/assets')
							.end(function(assetsGetErr, assetsGetRes) {
								// Handle Asset save error
								if (assetsGetErr) done(assetsGetErr);

								// Get Assets list
								var assets = assetsGetRes.body;

								// Set assertions
								(assets[0].user._id).should.equal(userId);
								(assets[0].name).should.match('Asset Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Asset instance if not logged in', function(done) {
		agent.post('/assets')
			.send(asset)
			.expect(401)
			.end(function(assetSaveErr, assetSaveRes) {
				// Call the assertion callback
				done(assetSaveErr);
			});
	});

	it('should not be able to save Asset instance if no name is provided', function(done) {
		// Invalidate name field
		asset.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Asset
				agent.post('/assets')
					.send(asset)
					.expect(400)
					.end(function(assetSaveErr, assetSaveRes) {
						// Set message assertion
						(assetSaveRes.body.message).should.match('Please fill Asset name');
						
						// Handle Asset save error
						done(assetSaveErr);
					});
			});
	});

	it('should be able to update Asset instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Asset
				agent.post('/assets')
					.send(asset)
					.expect(200)
					.end(function(assetSaveErr, assetSaveRes) {
						// Handle Asset save error
						if (assetSaveErr) done(assetSaveErr);

						// Update Asset name
						asset.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Asset
						agent.put('/assets/' + assetSaveRes.body._id)
							.send(asset)
							.expect(200)
							.end(function(assetUpdateErr, assetUpdateRes) {
								// Handle Asset update error
								if (assetUpdateErr) done(assetUpdateErr);

								// Set assertions
								(assetUpdateRes.body._id).should.equal(assetSaveRes.body._id);
								(assetUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Assets if not signed in', function(done) {
		// Create new Asset model instance
		var assetObj = new Asset(asset);

		// Save the Asset
		assetObj.save(function() {
			// Request Assets
			request(app).get('/assets')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Asset if not signed in', function(done) {
		// Create new Asset model instance
		var assetObj = new Asset(asset);

		// Save the Asset
		assetObj.save(function() {
			request(app).get('/assets/' + assetObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', asset.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Asset instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Asset
				agent.post('/assets')
					.send(asset)
					.expect(200)
					.end(function(assetSaveErr, assetSaveRes) {
						// Handle Asset save error
						if (assetSaveErr) done(assetSaveErr);

						// Delete existing Asset
						agent.delete('/assets/' + assetSaveRes.body._id)
							.send(asset)
							.expect(200)
							.end(function(assetDeleteErr, assetDeleteRes) {
								// Handle Asset error error
								if (assetDeleteErr) done(assetDeleteErr);

								// Set assertions
								(assetDeleteRes.body._id).should.equal(assetSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Asset instance if not signed in', function(done) {
		// Set Asset user 
		asset.user = user;

		// Create new Asset model instance
		var assetObj = new Asset(asset);

		// Save the Asset
		assetObj.save(function() {
			// Try deleting Asset
			request(app).delete('/assets/' + assetObj._id)
			.expect(401)
			.end(function(assetDeleteErr, assetDeleteRes) {
				// Set message assertion
				(assetDeleteRes.body.message).should.match('User is not logged in');

				// Handle Asset error error
				done(assetDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Asset.remove().exec();
		done();
	});
});