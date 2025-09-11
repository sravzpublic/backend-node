'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	dj30component = mongoose.model('dj30component'),
	cacheUtil = require('../cache/util'),
	_ = require('lodash');


/**
 * List of dj30components
 */
exports.list = function(req, res) { 
	dj30component.find().sort('ticker').exec(function(err, dj30components) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			cacheUtil.cacheAndSendResponse(req, res, dj30components);
		}
	});
};


/**
 * dj30component authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.dj30component.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
