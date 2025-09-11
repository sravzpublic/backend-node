'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var ecocals = require('../../app/controllers/ecocals.server.controller');

	// Ecocals Routes
	app.route('/ecocals')
		.get(ecocals.list)
		.post(users.requiresLogin, ecocals.create);

	app.route('/ecocals/:ecocalId')
		.get(ecocals.read)
		.put(users.requiresLogin, ecocals.hasAuthorization, ecocals.update)
		.delete(users.requiresLogin, ecocals.hasAuthorization, ecocals.delete);

    app.route('/ecocalByDateRange/:start/:end')
        .get(users.verifytoken, users.requiresLogin, ecocals.ecocalByDateRange);

	// Finish by binding the Ecocal middleware
    app.param('ecocalId', ecocals.ecocalByID);
    //app.param(['start', 'end'], ecocals.ecocalByDateRange);
};
