'use strict';

module.exports = function (app) {
	var users = require('../../app/controllers/users.server.controller');
	var quotes = require('../../app/controllers/quotes.server.controller');

	// Quotes Routes
	app.route('/quotes')
		.get(users.verifytoken, users.requiresLogin, quotes.list)
		.post(users.verifytoken, users.requiresLogin, quotes.create);

	app.route('/quotes/:quoteId')
		.get(users.verifytoken, users.requiresLogin, quotes.read)
		.put(users.verifytoken, users.requiresLogin, quotes.hasAuthorization, quotes.update)
		.delete(users.verifytoken, users.requiresLogin, quotes.hasAuthorization, quotes.delete);

	app.route('/quotes/stockQuotesByTickerStartLetter/:letters')
		.get(users.verifytoken, users.requiresLogin, quotes.stockQuotesByTickerStartLetter);

	app.route('/quotes/sravzid/:sravzID/:device')
		.get(users.verifytoken, users.requiresLogin, quotes.quotesBySravzID);

	app.route('/quotes/userassetid/:userAssetID/:device')
		.get(users.verifytoken, users.requiresLogin, quotes.quotesByUserAssetID);

	// Finish by binding the Quote middleware
	app.param('quoteId', quotes.quoteByID);
};
