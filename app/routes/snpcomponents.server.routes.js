'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var snpcomponents = require('../../app/controllers/snpcomponents.server.controller');

	// snpcomponents Routes
	app.route('/snpcomponents')
		.get(users.verifytoken, snpcomponents.list);

};
