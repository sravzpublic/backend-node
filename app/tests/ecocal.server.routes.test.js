'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Ecocal = mongoose.model('Ecocal'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, ecocal;

/**
 * Ecocal routes tests
 */
describe('Ecocal CRUD tests', function() {
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

		// Save a user to the test db and create new Ecocal
		user.save(function() {
			ecocal = {
				name: 'Ecocal Name'
			};

			done();
		});
	});

	it('should be able to save Ecocal instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Ecocal
				agent.post('/ecocals')
					.send(ecocal)
					.expect(200)
					.end(function(ecocalSaveErr, ecocalSaveRes) {
						// Handle Ecocal save error
						if (ecocalSaveErr) done(ecocalSaveErr);

						// Get a list of Ecocals
						agent.get('/ecocals')
							.end(function(ecocalsGetErr, ecocalsGetRes) {
								// Handle Ecocal save error
								if (ecocalsGetErr) done(ecocalsGetErr);

								// Get Ecocals list
								var ecocals = ecocalsGetRes.body;

								// Set assertions
								(ecocals[0].user._id).should.equal(userId);
								(ecocals[0].name).should.match('Ecocal Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Ecocal instance if not logged in', function(done) {
		agent.post('/ecocals')
			.send(ecocal)
			.expect(401)
			.end(function(ecocalSaveErr, ecocalSaveRes) {
				// Call the assertion callback
				done(ecocalSaveErr);
			});
	});

	it('should not be able to save Ecocal instance if no name is provided', function(done) {
		// Invalidate name field
		ecocal.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Ecocal
				agent.post('/ecocals')
					.send(ecocal)
					.expect(400)
					.end(function(ecocalSaveErr, ecocalSaveRes) {
						// Set message assertion
						(ecocalSaveRes.body.message).should.match('Please fill Ecocal name');
						
						// Handle Ecocal save error
						done(ecocalSaveErr);
					});
			});
	});

	it('should be able to update Ecocal instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Ecocal
				agent.post('/ecocals')
					.send(ecocal)
					.expect(200)
					.end(function(ecocalSaveErr, ecocalSaveRes) {
						// Handle Ecocal save error
						if (ecocalSaveErr) done(ecocalSaveErr);

						// Update Ecocal name
						ecocal.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Ecocal
						agent.put('/ecocals/' + ecocalSaveRes.body._id)
							.send(ecocal)
							.expect(200)
							.end(function(ecocalUpdateErr, ecocalUpdateRes) {
								// Handle Ecocal update error
								if (ecocalUpdateErr) done(ecocalUpdateErr);

								// Set assertions
								(ecocalUpdateRes.body._id).should.equal(ecocalSaveRes.body._id);
								(ecocalUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Ecocals if not signed in', function(done) {
		// Create new Ecocal model instance
		var ecocalObj = new Ecocal(ecocal);

		// Save the Ecocal
		ecocalObj.save(function() {
			// Request Ecocals
			request(app).get('/ecocals')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Ecocal if not signed in', function(done) {
		// Create new Ecocal model instance
		var ecocalObj = new Ecocal(ecocal);

		// Save the Ecocal
		ecocalObj.save(function() {
			request(app).get('/ecocals/' + ecocalObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', ecocal.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Ecocal instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Ecocal
				agent.post('/ecocals')
					.send(ecocal)
					.expect(200)
					.end(function(ecocalSaveErr, ecocalSaveRes) {
						// Handle Ecocal save error
						if (ecocalSaveErr) done(ecocalSaveErr);

						// Delete existing Ecocal
						agent.delete('/ecocals/' + ecocalSaveRes.body._id)
							.send(ecocal)
							.expect(200)
							.end(function(ecocalDeleteErr, ecocalDeleteRes) {
								// Handle Ecocal error error
								if (ecocalDeleteErr) done(ecocalDeleteErr);

								// Set assertions
								(ecocalDeleteRes.body._id).should.equal(ecocalSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Ecocal instance if not signed in', function(done) {
		// Set Ecocal user 
		ecocal.user = user;

		// Create new Ecocal model instance
		var ecocalObj = new Ecocal(ecocal);

		// Save the Ecocal
		ecocalObj.save(function() {
			// Try deleting Ecocal
			request(app).delete('/ecocals/' + ecocalObj._id)
			.expect(401)
			.end(function(ecocalDeleteErr, ecocalDeleteRes) {
				// Set message assertion
				(ecocalDeleteRes.body.message).should.match('User is not logged in');

				// Handle Ecocal error error
				done(ecocalDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Ecocal.remove().exec();
		done();
	});
});