'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Portfolioasset = mongoose.model('Portfolioasset');

/**
 * Globals
 */
var user, portfolioasset;

/**
 * Unit tests
 */
describe('Portfolioasset Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() { 
			portfolioasset = new Portfolioasset({
				name: 'Portfolioasset Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return portfolioasset.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			portfolioasset.name = '';

			return portfolioasset.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Portfolioasset.remove().exec();
		User.remove().exec();

		done();
	});
});