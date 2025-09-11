'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Portfolioasset = mongoose.model('Portfolioasset'),
    _ = require('lodash');


/**
 * Create many Portfolioasset
 */
exports.createmany = function (req, res) {
    //TODO: Use collection insert vs per item save
    var portfolioAssets = req.body;
    var portfolioAssetsSaved = [];
    var errorMesages = [];
    _.forEach(portfolioAssets,
        function (item) {

            var portfolioasset = new Portfolioasset(item);
            portfolioasset.user = req.user;

            portfolioasset.save(function (errAdd) {
                if (errAdd) {
                    /* Remove saved portfolio assets */
                    portfolioasset.remove(function (errRemove) {
                        if (errRemove) {
                            errorMesages.push({
                                message: errorHandler.getErrorMessage(errRemove)
                            });
                        }
                    });
                    errorMesages.push({
                        message: errorHandler.getErrorMessage(errAdd)
                    });
                } else {
                    portfolioAssetsSaved.push(portfolioasset);
                }
            });
        });
    if (errorMesages.length > 0) {
        return res.jsonp(portfolioAssetsSaved);
    } else {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(errorMesages)
        });
    }
};


/**
 * Create a Portfolioasset
 */
exports.create = function (req, res) {
    var portfolioasset = new Portfolioasset(req.body);
    portfolioasset.user = req.user;

    portfolioasset.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(portfolioasset);
        }
    });
};

/**
 * Show the current Portfolioasset
 */
exports.read = function (req, res) {
    res.jsonp(req.portfolioasset);
};

/**
 * Update a Portfolioasset
 */
exports.update = function (req, res) {
    var portfolioasset = req.portfolioasset;

    portfolioasset = _.extend(portfolioasset, req.body);

    portfolioasset.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(portfolioasset);
        }
    });
};

/**
 * Delete an Portfolioasset
 */
exports.delete = function (req, res) {
    var portfolioasset = req.portfolioasset;

    portfolioasset.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(portfolioasset);
        }
    });
};

/**
 * List of Portfolioassets
 */
exports.list = function (req, res) {
    Portfolioasset.find().sort('-created').populate('user', 'displayName').exec(function (err, portfolioassets) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(portfolioassets);
        }
    });
};

/**
 * Portfolioasset middleware
 */
exports.portfolioassetByID = function (req, res, next, id) {
    Portfolioasset.findById(id).populate('user', 'displayName').exec(function (err, portfolioasset) {
        if (err) return next(err);
        if (!portfolioasset) return next(new Error('Failed to load Portfolioasset ' + id));
        req.portfolioasset = portfolioasset;
        next();
    });
};

/**
 * Portfolioasset authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.portfolioasset.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
