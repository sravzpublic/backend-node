'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Quota = mongoose.model('Quota'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, quota;

/**
 * Quota routes tests
 */
describe('Quota CRUD tests', function() {
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

		// Save a user to the test db and create new Quota
		user.save(function() {
			quota = {
				name: 'Quota Name'
			};

			done();
		});
	});

	it('should be able to save Quota instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Quota
				agent.post('/quotas')
					.send(quota)
					.expect(200)
					.end(function(quotaSaveErr, quotaSaveRes) {
						// Handle Quota save error
						if (quotaSaveErr) done(quotaSaveErr);

						// Get a list of Quotas
						agent.get('/quotas')
							.end(function(quotasGetErr, quotasGetRes) {
								// Handle Quota save error
								if (quotasGetErr) done(quotasGetErr);

								// Get Quotas list
								var quotas = quotasGetRes.body;

								// Set assertions
								(quotas[0].user._id).should.equal(userId);
								(quotas[0].name).should.match('Quota Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Quota instance if not logged in', function(done) {
		agent.post('/quotas')
			.send(quota)
			.expect(401)
			.end(function(quotaSaveErr, quotaSaveRes) {
				// Call the assertion callback
				done(quotaSaveErr);
			});
	});

	it('should not be able to save Quota instance if no name is provided', function(done) {
		// Invalidate name field
		quota.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Quota
				agent.post('/quotas')
					.send(quota)
					.expect(400)
					.end(function(quotaSaveErr, quotaSaveRes) {
						// Set message assertion
						(quotaSaveRes.body.message).should.match('Please fill Quota name');
						
						// Handle Quota save error
						done(quotaSaveErr);
					});
			});
	});

	it('should be able to update Quota instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Quota
				agent.post('/quotas')
					.send(quota)
					.expect(200)
					.end(function(quotaSaveErr, quotaSaveRes) {
						// Handle Quota save error
						if (quotaSaveErr) done(quotaSaveErr);

						// Update Quota name
						quota.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Quota
						agent.put('/quotas/' + quotaSaveRes.body._id)
							.send(quota)
							.expect(200)
							.end(function(quotaUpdateErr, quotaUpdateRes) {
								// Handle Quota update error
								if (quotaUpdateErr) done(quotaUpdateErr);

								// Set assertions
								(quotaUpdateRes.body._id).should.equal(quotaSaveRes.body._id);
								(quotaUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Quotas if not signed in', function(done) {
		// Create new Quota model instance
		var quotaObj = new Quota(quota);

		// Save the Quota
		quotaObj.save(function() {
			// Request Quotas
			request(app).get('/quotas')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Quota if not signed in', function(done) {
		// Create new Quota model instance
		var quotaObj = new Quota(quota);

		// Save the Quota
		quotaObj.save(function() {
			request(app).get('/quotas/' + quotaObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', quota.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Quota instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Quota
				agent.post('/quotas')
					.send(quota)
					.expect(200)
					.end(function(quotaSaveErr, quotaSaveRes) {
						// Handle Quota save error
						if (quotaSaveErr) done(quotaSaveErr);

						// Delete existing Quota
						agent.delete('/quotas/' + quotaSaveRes.body._id)
							.send(quota)
							.expect(200)
							.end(function(quotaDeleteErr, quotaDeleteRes) {
								// Handle Quota error error
								if (quotaDeleteErr) done(quotaDeleteErr);

								// Set assertions
								(quotaDeleteRes.body._id).should.equal(quotaSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Quota instance if not signed in', function(done) {
		// Set Quota user 
		quota.user = user;

		// Create new Quota model instance
		var quotaObj = new Quota(quota);

		// Save the Quota
		quotaObj.save(function() {
			// Try deleting Quota
			request(app).delete('/quotas/' + quotaObj._id)
			.expect(401)
			.end(function(quotaDeleteErr, quotaDeleteRes) {
				// Set message assertion
				(quotaDeleteRes.body.message).should.match('User is not logged in');

				// Handle Quota error error
				done(quotaDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Quota.remove().exec();
		done();
	});
});