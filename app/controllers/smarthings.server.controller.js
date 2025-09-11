'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Smarthing = mongoose.model('Smarthing'),
  errorHandler = require('./errors.server.controller'),
  _ = require('lodash'),
  config = require('../../config/config'),
  request = require('request');
var oauth2 = require('simple-oauth2').create(config.app.smartThingsOauth.oauth2Options);

/**
 * Create a Smarthing
 */
exports.create = function (req, res) {
  var smarthing = new Smarthing(req.body);
  smarthing.user = req.user;

  smarthing.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(smarthing);
    }
  });
};

/**
 * Show the current Smarthing
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var smarthing = req.smarthing ? req.smarthing.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  smarthing.isCurrentUserOwner = req.user && smarthing.user && smarthing.user._id.toString() === req.user._id.toString();

  res.jsonp(smarthing);
};

/**
 * Update a Smarthing
 */
exports.update = function (req, res) {
  var smarthing = req.smarthing;

  smarthing = _.extend(smarthing, req.body);

  smarthing.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(smarthing);
    }
  });
};

/**
 * Delete an Smarthing
 */
exports.delete = function (req, res) {
  var smarthing = req.smarthing;

  smarthing.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(smarthing);
    }
  });
};

/**
 * List of Smarthings
 */
exports.list = function (req, res) {
  Smarthing.find().sort('-created').populate('user', 'displayName').exec(function (err, smarthings) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(smarthings);
    }
  });
};

/**
 * Smarthing middleware
 */
exports.smarthingByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Smarthing is invalid'
    });
  }

  Smarthing.findById(id).populate('user', 'displayName').exec(function (err, smarthing) {
    if (err) {
      return next(err);
    } else if (!smarthing) {
      return res.status(404).send({
        message: 'No Smarthing with that identifier has been found'
      });
    }
    req.smarthing = smarthing;
    next();
  });
};

exports.token = function (req, res, next) {
  var authorization_uri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: req.protocol + '://' + req.headers.host + config.app.smartThingsOauth.tokenCallBackUrl,
    scope: 'app'
  });
  res.redirect(authorization_uri);
};

exports.tokencallback = function (req, res, next) {
  // parse request from SmartThings and get access token
  var code = req.query.code;
  oauth2.authorizationCode.getToken({
    code: code,
    redirect_uri: req.protocol + '://' + req.headers.host + config.app.smartThingsOauth.tokenCallBackUrl
  }, function (error, result) {
    if (error) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage('Access Token Error: ' + error)
      });
    }

    /* Update an existing token or save a new token */
    Smarthing.findOne({
      user: req.user.id
    }).exec(function (err, smarthing) {
      if (err || smarthing == null) {
        /* Save token */
        var smarthing = new Smarthing();
        smarthing.user = req.user;
        smarthing.token = oauth2.accessToken.create(result).token;
        smarthing.save(function (err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            //Params should be in this format:
            //#external_access_token={1}&external_access_token_secret={5}
            res.redirect(config.app.smartThingsOauth.sravzRedirectUri + '#auth=true');
          }
        });        
      } else {
        /* Update token */
        smarthing.token = oauth2.accessToken.create(result).token;
        smarthing.save(function (err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.redirect(config.app.smartThingsOauth.sravzRedirectUri + '#auth=true');
          }
        });        
      }
    });
  });
};

exports.gettoken = function (req, res, next) {
  Smarthing.findOne({
    user: req.user.id
  }).exec(function (err, smarthing) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });      
    } else if (smarthing == null)
    {
      return res.status(404).send();      
    } else {
      return res.status(200).send();
    }
  });
};

exports.getdata = function (req, res, next) {
  Smarthing.findOne({
    user: req.user.id
  })
  .select('data -token')
  .slice('data', -1).exec(function (err, smarthing) {
    if (err || smarthing == null) {
      return res.status(404).send();
    } else {
      return res.send(smarthing);
    }
  });
};