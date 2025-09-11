'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	russellcomponent = mongoose.model('russellcomponent'),
	cacheUtil = require('../cache/util'),
	_ = require('lodash');


/**
 * List of russellcomponents
 */
exports.list = function(req, res) { 
	russellcomponent.find().sort('ticker').exec(function(err, russellcomponents) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			cacheUtil.cacheAndSendResponse(req, res, russellcomponents);
		}
	});
};




/**
 * russellcomponent authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.russellcomponent.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
