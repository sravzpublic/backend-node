'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var dj30components = require('../../app/controllers/dj30components.server.controller');

	// dj30components Routes
	app.route('/dj30components')
		.get(users.verifytoken, dj30components.list);

};
