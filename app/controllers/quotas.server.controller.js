'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Quota = mongoose.model('Quota'),
	_ = require('lodash');

/**
 * Create a Quota
 */
exports.create = function(req, res) {
	var quota = new Quota(req.body);
	quota.user = req.user;

	quota.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(quota);
		}
	});
};

/**
 * Show the current Quota
 */
exports.read = function(req, res) {
	res.jsonp(req.quota);
};

/**
 * Update a Quota
 */
exports.update = function(req, res) {
	var quota = req.quota ;

	quota = _.extend(quota , req.body);

	quota.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(quota);
		}
	});
};

/**
 * Delete an Quota
 */
exports.delete = function(req, res) {
	var quota = req.quota ;

	quota.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(quota);
		}
	});
};

/**
 * List of Quotas
 */
exports.list = function(req, res) { 
	Quota.find().sort('-created').populate('user', 'displayName').exec(function(err, quotas) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(quotas);
		}
	});
};

/**
 * Quota middleware
 */
exports.quotaByID = function(req, res, next, id) { 
	Quota.findById(id).populate('user', 'displayName').exec(function(err, quota) {
		if (err) return next(err);
		if (! quota) return next(new Error('Failed to load Quota ' + id));
		req.quota = quota ;
		next();
	});
};

/**
 * Quota authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.quota.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
