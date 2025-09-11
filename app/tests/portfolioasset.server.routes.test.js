'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Portfolioasset = mongoose.model('Portfolioasset'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, portfolioasset;

/**
 * Portfolioasset routes tests
 */
describe('Portfolioasset CRUD tests', function() {
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

		// Save a user to the test db and create new Portfolioasset
		user.save(function() {
			portfolioasset = {
				name: 'Portfolioasset Name'
			};

			done();
		});
	});

	it('should be able to save Portfolioasset instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Portfolioasset
				agent.post('/portfolioassets')
					.send(portfolioasset)
					.expect(200)
					.end(function(portfolioassetSaveErr, portfolioassetSaveRes) {
						// Handle Portfolioasset save error
						if (portfolioassetSaveErr) done(portfolioassetSaveErr);

						// Get a list of Portfolioassets
						agent.get('/portfolioassets')
							.end(function(portfolioassetsGetErr, portfolioassetsGetRes) {
								// Handle Portfolioasset save error
								if (portfolioassetsGetErr) done(portfolioassetsGetErr);

								// Get Portfolioassets list
								var portfolioassets = portfolioassetsGetRes.body;

								// Set assertions
								(portfolioassets[0].user._id).should.equal(userId);
								(portfolioassets[0].name).should.match('Portfolioasset Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Portfolioasset instance if not logged in', function(done) {
		agent.post('/portfolioassets')
			.send(portfolioasset)
			.expect(401)
			.end(function(portfolioassetSaveErr, portfolioassetSaveRes) {
				// Call the assertion callback
				done(portfolioassetSaveErr);
			});
	});

	it('should not be able to save Portfolioasset instance if no name is provided', function(done) {
		// Invalidate name field
		portfolioasset.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Portfolioasset
				agent.post('/portfolioassets')
					.send(portfolioasset)
					.expect(400)
					.end(function(portfolioassetSaveErr, portfolioassetSaveRes) {
						// Set message assertion
						(portfolioassetSaveRes.body.message).should.match('Please fill Portfolioasset name');
						
						// Handle Portfolioasset save error
						done(portfolioassetSaveErr);
					});
			});
	});

	it('should be able to update Portfolioasset instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Portfolioasset
				agent.post('/portfolioassets')
					.send(portfolioasset)
					.expect(200)
					.end(function(portfolioassetSaveErr, portfolioassetSaveRes) {
						// Handle Portfolioasset save error
						if (portfolioassetSaveErr) done(portfolioassetSaveErr);

						// Update Portfolioasset name
						portfolioasset.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Portfolioasset
						agent.put('/portfolioassets/' + portfolioassetSaveRes.body._id)
							.send(portfolioasset)
							.expect(200)
							.end(function(portfolioassetUpdateErr, portfolioassetUpdateRes) {
								// Handle Portfolioasset update error
								if (portfolioassetUpdateErr) done(portfolioassetUpdateErr);

								// Set assertions
								(portfolioassetUpdateRes.body._id).should.equal(portfolioassetSaveRes.body._id);
								(portfolioassetUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Portfolioassets if not signed in', function(done) {
		// Create new Portfolioasset model instance
		var portfolioassetObj = new Portfolioasset(portfolioasset);

		// Save the Portfolioasset
		portfolioassetObj.save(function() {
			// Request Portfolioassets
			request(app).get('/portfolioassets')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Portfolioasset if not signed in', function(done) {
		// Create new Portfolioasset model instance
		var portfolioassetObj = new Portfolioasset(portfolioasset);

		// Save the Portfolioasset
		portfolioassetObj.save(function() {
			request(app).get('/portfolioassets/' + portfolioassetObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', portfolioasset.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Portfolioasset instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Portfolioasset
				agent.post('/portfolioassets')
					.send(portfolioasset)
					.expect(200)
					.end(function(portfolioassetSaveErr, portfolioassetSaveRes) {
						// Handle Portfolioasset save error
						if (portfolioassetSaveErr) done(portfolioassetSaveErr);

						// Delete existing Portfolioasset
						agent.delete('/portfolioassets/' + portfolioassetSaveRes.body._id)
							.send(portfolioasset)
							.expect(200)
							.end(function(portfolioassetDeleteErr, portfolioassetDeleteRes) {
								// Handle Portfolioasset error error
								if (portfolioassetDeleteErr) done(portfolioassetDeleteErr);

								// Set assertions
								(portfolioassetDeleteRes.body._id).should.equal(portfolioassetSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Portfolioasset instance if not signed in', function(done) {
		// Set Portfolioasset user 
		portfolioasset.user = user;

		// Create new Portfolioasset model instance
		var portfolioassetObj = new Portfolioasset(portfolioasset);

		// Save the Portfolioasset
		portfolioassetObj.save(function() {
			// Try deleting Portfolioasset
			request(app).delete('/portfolioassets/' + portfolioassetObj._id)
			.expect(401)
			.end(function(portfolioassetDeleteErr, portfolioassetDeleteRes) {
				// Set message assertion
				(portfolioassetDeleteRes.body.message).should.match('User is not logged in');

				// Handle Portfolioasset error error
				done(portfolioassetDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Portfolioasset.remove().exec();
		done();
	});
});