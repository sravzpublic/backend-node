'use strict';

module.exports = function (app) {
    //TODO: Do nothing for now
    return;
	var users = require('../../app/controllers/users.server.controller');
	var quotas = require('../../app/controllers/quotas.server.controller');

	// Quotas Routes
	app.route('/quotas')
        .get(users.verifytoken, users.requiresLogin, quotas.list)
		.post(users.verifytoken, users.requiresLogin, quotas.create);

	app.route('/quotas/:quotaId')
		.get(users.verifytoken, users.requiresLogin, quotas.read)
		.put(users.verifytoken, users.requiresLogin, quotas.hasAuthorization, quotas.update)
		.delete(users.verifytoken, users.requiresLogin, quotas.hasAuthorization, quotas.delete);

	// Finish by binding the Quota middleware
	app.param('quotaId', quotas.quotaByID);
};
