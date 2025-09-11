'use strict';

/**
 * Module dependencies
 */
//var smarthingsPolicy = require('../policies/smarthings.server.policy'),
//  smarthings = require('../controllers/smarthings.server.controller');

var smarthings = require('../controllers/smarthings.server.controller'),
    users = require('../controllers/users.server.controller');


module.exports = function (app) {
    // Smarthings Routes
    // Token endpoint to retrive smarthings token
    app.route('/api/smarthingstoken')
        .get(users.requiresLogin, smarthings.token)

    app.route('/api/smarthingstokencallback')
        .get(users.requiresLogin, smarthings.tokencallback)

    /* Returns smarthings token */
    app.route('/api/smarthingsgettoken')
        .get(users.verifytoken, smarthings.gettoken)

    /* Returns smarthings data */
    app.route('/api/smarthingsdata')
    .get(users.verifytoken, smarthings.getdata)

    app.route('/api/smarthings')
        .get(users.verifytoken, users.requiresLogin, smarthings.list)
        .post(users.verifytoken, users.requiresLogin, smarthings.create);

    //app.route('/api/smarthings/:smarthingId').all(smarthingsPolicy.isAllowed)
    app.route('/api/smarthings/:smarthingId')
        .get(users.verifytoken, users.requiresLogin, smarthings.read)
        .put(users.verifytoken, users.requiresLogin, smarthings.update)
        .delete(users.verifytoken, users.requiresLogin, smarthings.delete);

    //Finish by binding the Smarthing middleware
    app.param('smarthingId', smarthings.smarthingByID);
};
