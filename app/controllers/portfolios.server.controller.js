'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
    Portfolio = mongoose.model('Portfolio'),
    Portfolioasset = mongoose.model('Portfolioasset'),
    Asset = mongoose.model('Asset'),
	_ = require('lodash');

/**
 * Create a Portfolio
 */
exports.create = function(req, res) {
    /* Save portfolio assets */
    /* TODO: Investigate insert vs create */
    _.each(req.body.portfolioassets, function (pa) {
        pa.asset = mongoose.Types.ObjectId(pa.AssetId);
    });

    Portfolioasset.collection.insert(req.body.portfolioassets, function(err, passets) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        req.body.portfolioassets.portfolioassets = _.each(passets, function (passet) { return passet._id; });
        var portfolio = new Portfolio(req.body);
        portfolio.user = req.user.id;
        portfolio.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(portfolio);
            }
        });

    });

};

/**
 * Show the current Portfolio
 */
exports.read = function(req, res) {
	res.jsonp(req.portfolio);
};

/**
 * Update a Portfolio
 */
exports.update = function(req, res) {
	var portfolio = req.portfolio ;

	portfolio = _.extend(portfolio , req.body);

	portfolio.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(portfolio);
		}
	});
};

/**
 * Delete an Portfolio
 */
exports.delete = function(req, res) {
	var portfolio = req.portfolio ;

    _.forEach(portfolio.portfolioassets, function(assetId) {
        Portfolioasset.findById(assetId).remove(function (err) {
        });
    });

	portfolio.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(portfolio);
		}
	});
};

/**
 * List of Portfolios
 */
exports.list = function(req, res) {
    Portfolio.find({ $or: [{ user: req.user.id }, { 'ispublic': true }] }).sort('-created').populate('portfolioassets').populate({ path: 'portfolioassets.asset', model: 'Asset'}).populate('user', 'fullName').exec(function (err, portfolios) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
        } else {
            //_.each(portfolios, function (p) { _.each(p.portfolioassets, function (pa) { pa.populate('asset')}); });
			res.jsonp(portfolios);
		}
	});
};

/**
 * Portfolio middleware
 */
exports.portfolioByID = function(req, res, next, id) {
	Portfolio.findById(id).populate('portfolioassets').populate('user', 'displayName').exec(function(err, portfolio) {
		if (err) return next(err);
		if (! portfolio) return next(new Error('Failed to load Portfolio ' + id));
		req.portfolio = portfolio ;
		next();
	});
};

/**
 * Portfolio authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.portfolio.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
