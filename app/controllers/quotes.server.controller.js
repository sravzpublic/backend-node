'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
    Quote = mongoose.model('quotes_commodities'),
    StockQuote = mongoose.model('quotes_stocks'),
	cacheUtil = require('../cache/util'),
	awsService = require('../services/awsService'),
	config_all = require('../../config/env/all'),
	_ = require('lodash');

/**
 * Create a Quote
 */
exports.create = function(req, res) {
	var quote = new Quote(req.body);
	quote.user = req.user;

	quote.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(quote);
		}
	});
};

/**
 * Show the current Quote
 */
exports.read = function(req, res) {
	res.jsonp(req.quote);
};

/**
 * Update a Quote
 */
exports.update = function(req, res) {
	var quote = req.quote ;

	quote = _.extend(quote , req.body);

	quote.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(quote);
		}
	});
};

/**
 * Delete an Quote
 */
exports.delete = function(req, res) {
	var quote = req.quote ;

	quote.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(quote);
		}
	});
};

/**
 * List of Quotes
 */
exports.list = function(req, res) { 
	Quote.find().sort('Commodity').exec(function(err, quotes) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
            res.jsonp(quotes);
            var socketio = req.app.get('socketio'); // tacke out socket instance from the app container
            /* Send all the quotes for now */
            socketio.sockets.emit('quote.refreshed', quotes); // emit an event for all connected clients

		}
	});
};


exports.stockQuotesByTickerStartLetter = function (req, res) {
    var symbols = req.params.letters.split(",").join("|");
    if (symbols) {
        StockQuote.find({ Ticker : RegExp('^[' + symbols + ']', "i") }).exec(function (err, quotes) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(quotes);
            }
        });
    } else {
        res.jsonp([]);
    }
};

/**
 * Get asset quotes
 */
exports.quotesBySravzID = function (req, res, next) {
	mongoose.sravz_historical_conn.db.collection(req.params.sravzID).find({}).toArray(function(err, items) {
		if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
			console.log("Caching file for device :" + req.params.device)
            cacheUtil.cacheAndSendResponse(req, res, items, req.params.device);
		}	
	});
};

exports.quotesByUserAssetID = function (req, res, next) {
    const AWSService = new awsService()
	cacheUtil.cacheAndSendResponse(req, res, AWSService.GetPresignedUrl(config_all.AWS_USER_ASSETS_BUCKET, req.params.userAssetID), req.params.device);
};

/**
 * Quote middleware
 */
exports.quoteByID = function(req, res, next, id) { 
	Quote.findById(id).populate('user', 'displayName').exec(function(err, quote) {
		if (err) return next(err);
		if (! quote) return next(new Error('Failed to load Quote ' + id));
		req.quote = quote ;
		next();
	});
};

/**
 * Quote authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.quote.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
