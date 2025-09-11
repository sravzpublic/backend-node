'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Portfolio = mongoose.model('Portfolio'),
    errorHandler = require('../errors.server.controller'),
    config = require('../../../config/config'),
    UserService = require('../../ngx-admin/api/common/user/userService');

const userService = new UserService();

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
    User.findOne({
        _id: id
    }).exec(function (err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));
        req.profile = user;
        next();
    });
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function (req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).send({
            message: 'User is not logged in'
        });
    }

    next();
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function (roles) {
    var _this = this;

    return function (req, res, next) {
        _this.requiresLogin(req, res, function () {
            if (_.intersection(req.user.roles, roles).length) {
                return next();
            } else {
                return res.status(403).send({
                    message: 'User is not authorized'
                });
            }
        });
    };
};

/**
 * User quota middleware
 */
exports.hasQuota = function (req, res, next) {
    // Quotas not enforced on Guest login
    if (req.method === "POST") {
        // Get user
        userService
            .findById(req.user.id)
            .then(user => {
                // console.log(`Quotes: ${JSON.stringify(user)} - ${user.email} and guest user allowed ${config.auth.guest_user}`);
                // Sample user object
                // {"id":"5f232d744f925716f94b5eee","email":"guest123@guest.com","role":"user","age":18,"login":"test456","address":{},"settings":{}}
                if (user.email === config.auth.guest_user) {
                    // console.log(`Quota not enfored for Guest User: ${JSON.stringify(user)} -  ${user.email} - Guest user in config: ${config.auth.guest_user}`)
                    return next();
                }
                let quota = config.quotas[user.role]
                switch (req.url) {
                    case "/portfolios":
                        if (!quota) {
                            return res.status(403)
                                .send({
                                    message: errorHandler.returnGenericError("User quota details not found.")
                                });
                        } else {
                            Portfolio.find({ user: req.user.id })
                                .select({ "name": 1 })
                                .exec(function (err, results) {
                                    if (results.length >= quota.portfolios) {
                                        return res.status(403)
                                            .send({
                                                message: errorHandler.returnGenericError("Portfolio max quota (" + quota.portfolios + ") exceeded.")
                                            });
                                    } else {
                                        return next();
                                    }
                                });
                        }
                        break;
                    default:
                        return next();
                }
            })
            .catch((e) => {
                return res.status(403)
                    .send({
                        message: errorHandler.returnGenericError("User not found, quota cannot be determined!")
                    });
            });
    } else {
        return next();
    }
};