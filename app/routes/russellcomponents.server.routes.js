'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var russellcomponents = require('../../app/controllers/russellcomponents.server.controller');

	// russellcomponents Routes
	app.route('/russellcomponents')
		.get(users.verifytoken, russellcomponents.list);

    //app.param(['start', 'end'], russellcomponents.snpcomponentByDateRange);
};
