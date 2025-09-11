'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	snpcomponent = mongoose.model('snpcomponent'),
	cacheUtil = require('../cache/util'),
	_ = require('lodash');


/**
 * List of SNPComponents
 */
exports.list = function(req, res) { 
	snpcomponent.find().sort('tickersymbol').exec(function(err, snpcomponents) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			cacheUtil.cacheAndSendResponse(req, res, snpcomponents);
		}
	});
};




/**
 * snpcomponent authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.snpcomponent.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
