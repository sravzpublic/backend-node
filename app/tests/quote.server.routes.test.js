'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Quote = mongoose.model('Quote'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, quote;

/**
 * Quote routes tests
 */
describe('Quote CRUD tests', function() {
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

		// Save a user to the test db and create new Quote
		user.save(function() {
			quote = {
				name: 'Quote Name'
			};

			done();
		});
	});

	it('should be able to save Quote instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Quote
				agent.post('/quotes')
					.send(quote)
					.expect(200)
					.end(function(quoteSaveErr, quoteSaveRes) {
						// Handle Quote save error
						if (quoteSaveErr) done(quoteSaveErr);

						// Get a list of Quotes
						agent.get('/quotes')
							.end(function(quotesGetErr, quotesGetRes) {
								// Handle Quote save error
								if (quotesGetErr) done(quotesGetErr);

								// Get Quotes list
								var quotes = quotesGetRes.body;

								// Set assertions
								(quotes[0].user._id).should.equal(userId);
								(quotes[0].name).should.match('Quote Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Quote instance if not logged in', function(done) {
		agent.post('/quotes')
			.send(quote)
			.expect(401)
			.end(function(quoteSaveErr, quoteSaveRes) {
				// Call the assertion callback
				done(quoteSaveErr);
			});
	});

	it('should not be able to save Quote instance if no name is provided', function(done) {
		// Invalidate name field
		quote.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Quote
				agent.post('/quotes')
					.send(quote)
					.expect(400)
					.end(function(quoteSaveErr, quoteSaveRes) {
						// Set message assertion
						(quoteSaveRes.body.message).should.match('Please fill Quote name');
						
						// Handle Quote save error
						done(quoteSaveErr);
					});
			});
	});

	it('should be able to update Quote instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Quote
				agent.post('/quotes')
					.send(quote)
					.expect(200)
					.end(function(quoteSaveErr, quoteSaveRes) {
						// Handle Quote save error
						if (quoteSaveErr) done(quoteSaveErr);

						// Update Quote name
						quote.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Quote
						agent.put('/quotes/' + quoteSaveRes.body._id)
							.send(quote)
							.expect(200)
							.end(function(quoteUpdateErr, quoteUpdateRes) {
								// Handle Quote update error
								if (quoteUpdateErr) done(quoteUpdateErr);

								// Set assertions
								(quoteUpdateRes.body._id).should.equal(quoteSaveRes.body._id);
								(quoteUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Quotes if not signed in', function(done) {
		// Create new Quote model instance
		var quoteObj = new Quote(quote);

		// Save the Quote
		quoteObj.save(function() {
			// Request Quotes
			request(app).get('/quotes')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Quote if not signed in', function(done) {
		// Create new Quote model instance
		var quoteObj = new Quote(quote);

		// Save the Quote
		quoteObj.save(function() {
			request(app).get('/quotes/' + quoteObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', quote.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Quote instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Quote
				agent.post('/quotes')
					.send(quote)
					.expect(200)
					.end(function(quoteSaveErr, quoteSaveRes) {
						// Handle Quote save error
						if (quoteSaveErr) done(quoteSaveErr);

						// Delete existing Quote
						agent.delete('/quotes/' + quoteSaveRes.body._id)
							.send(quote)
							.expect(200)
							.end(function(quoteDeleteErr, quoteDeleteRes) {
								// Handle Quote error error
								if (quoteDeleteErr) done(quoteDeleteErr);

								// Set assertions
								(quoteDeleteRes.body._id).should.equal(quoteSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Quote instance if not signed in', function(done) {
		// Set Quote user 
		quote.user = user;

		// Create new Quote model instance
		var quoteObj = new Quote(quote);

		// Save the Quote
		quoteObj.save(function() {
			// Try deleting Quote
			request(app).delete('/quotes/' + quoteObj._id)
			.expect(401)
			.end(function(quoteDeleteErr, quoteDeleteRes) {
				// Set message assertion
				(quoteDeleteRes.body.message).should.match('User is not logged in');

				// Handle Quote error error
				done(quoteDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Quote.remove().exec();
		done();
	});
});