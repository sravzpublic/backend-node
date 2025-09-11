'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Ecocal = mongoose.model('Ecocal'),
	cacheUtil = require('../cache/util'),
	_ = require('lodash');

/**
 * Create a Ecocal
 */
exports.create = function(req, res) {
	var ecocal = new Ecocal(req.body);
	ecocal.user = req.user;

	ecocal.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(ecocal);
		}
	});
};

/**
 * Show the current Ecocal
 */
exports.read = function(req, res) {
	res.jsonp(req.ecocal);
};

/**
 * Update a Ecocal
 */
exports.update = function(req, res) {
	var ecocal = req.ecocal ;

	ecocal = _.extend(ecocal , req.body);

	ecocal.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(ecocal);
		}
	});
};

/**
 * Delete an Ecocal
 */
exports.delete = function(req, res) {
	var ecocal = req.ecocal ;

	ecocal.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(ecocal);
		}
	});
};

/**
 * List of Ecocals
 */
exports.list = function(req, res) { 
	Ecocal.find().sort('date').exec(function(err, ecocals) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(ecocals);
		}
	});
};

/**
 * Ecocal middleware
 */
exports.ecocalByID = function(req, res, next, id) { 
	Ecocal.findById(id).exec(function(err, ecocal) {
		if (err) return next(err);
		if (! ecocal) return next(new Error('Failed to load Ecocal ' + id));
		req.ecocal = ecocal ;
		next();
	});
};

exports.ecocalByDateRange = function (req, res, next) {
    var start = req.params["start"];
    var end = req.params["end"];
    Ecocal.find({ "date": { "$gte": new Date(start), "$lt": new Date(end) } })
        .sort('date').exec(function (err, ecocals) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
				cacheUtil.cacheAndSendResponse(req, res, ecocals);
        }
    });
};


/**
 * Ecocal authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.ecocal.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
