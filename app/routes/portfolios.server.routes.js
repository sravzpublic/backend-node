'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var portfolios = require('../../app/controllers/portfolios.server.controller');

	// Portfolios Routes
	app.route('/portfolios')
        .get(users.verifytoken, users.requiresLogin, portfolios.list)
        .post(users.verifytoken, users.requiresLogin, users.hasQuota, portfolios.create);

	app.route('/portfolios/:portfolioId')
        .get(users.verifytoken, users.requiresLogin, portfolios.read)
        .put(users.verifytoken, users.requiresLogin, portfolios.hasAuthorization, portfolios.update)
	.delete(users.verifytoken, users.requiresLogin, portfolios.hasAuthorization, portfolios.delete);

	// Finish by binding the Portfolio middleware
	app.param('portfolioId', portfolios.portfolioByID);
};
