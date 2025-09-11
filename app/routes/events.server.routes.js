'use strict';

/**
 * Module dependencies
 */
//var smarthingsPolicy = require('../policies/smarthings.server.policy'),
//  smarthings = require('../controllers/smarthings.server.controller');

var events = require('../controllers/events.server.controller'),
users = require('../controllers/users.server.controller');

module.exports = function (app) {
    // Smarthings Routes
    // Token endpoint to retrive smarthings token

    app.route('/api/events')
    .get(users.verifytoken, events.getEvents)
    
    app.route('/api/events/:eventId')
    .get(users.verifytoken, events.getEvent)
    
    app.route('/api/events')
    .get(users.verifytoken, events.saveEvent)

};
