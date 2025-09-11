'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Portfolio = mongoose.model('Portfolio'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, portfolio;

/**
 * Portfolio routes tests
 */
describe('Portfolio CRUD tests', function() {
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

		// Save a user to the test db and create new Portfolio
		user.save(function() {
			portfolio = {
				name: 'Portfolio Name'
			};

			done();
		});
	});

	it('should be able to save Portfolio instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Portfolio
				agent.post('/portfolios')
					.send(portfolio)
					.expect(200)
					.end(function(portfolioSaveErr, portfolioSaveRes) {
						// Handle Portfolio save error
						if (portfolioSaveErr) done(portfolioSaveErr);

						// Get a list of Portfolios
						agent.get('/portfolios')
							.end(function(portfoliosGetErr, portfoliosGetRes) {
								// Handle Portfolio save error
								if (portfoliosGetErr) done(portfoliosGetErr);

								// Get Portfolios list
								var portfolios = portfoliosGetRes.body;

								// Set assertions
								(portfolios[0].user._id).should.equal(userId);
								(portfolios[0].name).should.match('Portfolio Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Portfolio instance if not logged in', function(done) {
		agent.post('/portfolios')
			.send(portfolio)
			.expect(401)
			.end(function(portfolioSaveErr, portfolioSaveRes) {
				// Call the assertion callback
				done(portfolioSaveErr);
			});
	});

	it('should not be able to save Portfolio instance if no name is provided', function(done) {
		// Invalidate name field
		portfolio.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Portfolio
				agent.post('/portfolios')
					.send(portfolio)
					.expect(400)
					.end(function(portfolioSaveErr, portfolioSaveRes) {
						// Set message assertion
						(portfolioSaveRes.body.message).should.match('Please fill Portfolio name');
						
						// Handle Portfolio save error
						done(portfolioSaveErr);
					});
			});
	});

	it('should be able to update Portfolio instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Portfolio
				agent.post('/portfolios')
					.send(portfolio)
					.expect(200)
					.end(function(portfolioSaveErr, portfolioSaveRes) {
						// Handle Portfolio save error
						if (portfolioSaveErr) done(portfolioSaveErr);

						// Update Portfolio name
						portfolio.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Portfolio
						agent.put('/portfolios/' + portfolioSaveRes.body._id)
							.send(portfolio)
							.expect(200)
							.end(function(portfolioUpdateErr, portfolioUpdateRes) {
								// Handle Portfolio update error
								if (portfolioUpdateErr) done(portfolioUpdateErr);

								// Set assertions
								(portfolioUpdateRes.body._id).should.equal(portfolioSaveRes.body._id);
								(portfolioUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Portfolios if not signed in', function(done) {
		// Create new Portfolio model instance
		var portfolioObj = new Portfolio(portfolio);

		// Save the Portfolio
		portfolioObj.save(function() {
			// Request Portfolios
			request(app).get('/portfolios')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Portfolio if not signed in', function(done) {
		// Create new Portfolio model instance
		var portfolioObj = new Portfolio(portfolio);

		// Save the Portfolio
		portfolioObj.save(function() {
			request(app).get('/portfolios/' + portfolioObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', portfolio.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Portfolio instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Portfolio
				agent.post('/portfolios')
					.send(portfolio)
					.expect(200)
					.end(function(portfolioSaveErr, portfolioSaveRes) {
						// Handle Portfolio save error
						if (portfolioSaveErr) done(portfolioSaveErr);

						// Delete existing Portfolio
						agent.delete('/portfolios/' + portfolioSaveRes.body._id)
							.send(portfolio)
							.expect(200)
							.end(function(portfolioDeleteErr, portfolioDeleteRes) {
								// Handle Portfolio error error
								if (portfolioDeleteErr) done(portfolioDeleteErr);

								// Set assertions
								(portfolioDeleteRes.body._id).should.equal(portfolioSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Portfolio instance if not signed in', function(done) {
		// Set Portfolio user 
		portfolio.user = user;

		// Create new Portfolio model instance
		var portfolioObj = new Portfolio(portfolio);

		// Save the Portfolio
		portfolioObj.save(function() {
			// Try deleting Portfolio
			request(app).delete('/portfolios/' + portfolioObj._id)
			.expect(401)
			.end(function(portfolioDeleteErr, portfolioDeleteRes) {
				// Set message assertion
				(portfolioDeleteRes.body.message).should.match('User is not logged in');

				// Handle Portfolio error error
				done(portfolioDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Portfolio.remove().exec();
		done();
	});
});