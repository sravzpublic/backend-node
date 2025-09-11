'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var portfolioassets = require('../../app/controllers/portfolioassets.server.controller');

	// Portfolioassets Routes
	app.route('/portfolioassets')
		.get(portfolioassets.list)
		.post(users.requiresLogin, portfolioassets.create);

	app.route('/portfolioassets/:portfolioassetId')
		.get(portfolioassets.read)
		.put(users.requiresLogin, portfolioassets.hasAuthorization, portfolioassets.update)
		.delete(users.requiresLogin, portfolioassets.hasAuthorization, portfolioassets.delete);

	// Finish by binding the Portfolioasset middleware
	app.param('portfolioassetId', portfolioassets.portfolioassetByID);
};
