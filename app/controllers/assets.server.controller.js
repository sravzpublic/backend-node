'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Asset = mongoose.model('Asset'),
	cacheUtil = require('../cache/util'),
	_ = require('lodash'),
	csv = require('fast-csv'),
	moment = require('moment'),
	awsService = require('../services/awsService'),
	config_all = require('../../config/env/all'),
	UserService = require('../ngx-admin/api/common/user/userService');

const userService = new UserService();

// Process asset files
const AWSService = new awsService()

function processAssetFiles(req, res, user) {
	// Return new promise
	return new Promise(function (resolve, reject) {
		var fileStatus = []
		var filesWithErrors = 0;
		var fileHasError = false;
		if (req.files && req.files.length > 0) {
			var i;
			for (i = 0; i < req.files.length; i++) {
				//res.end('Processing file: ' + req.files[i].fileName);
				const csvFilePath = req.files[i].path;
				const fileName = req.files[i].originalname;
				const fileNameOnDisk = req.files[i].filename;

				const config = {
					headers: [
						{
							name: 'Date',
							inputName: 'Date',
							required: true,
							validate: function (dateValue) {
								return true
							}
						},
						{
							name: 'Volume',
							inputName: 'Volume',
							required: true
						},
						{
							name: 'High',
							inputName: 'High',
							required: true
						},
						{
							name: 'Last',
							inputName: 'Last',
							required: true
						},
						{
							name: 'Low',
							inputName: 'Low',
							required: true
						},
						{
							name: 'OpenInterest',
							inputName: 'OpenInterest',
							required: true
						},
						{
							name: 'Open',
							inputName: 'Open',
							required: true
						},
						{
							name: 'Change',
							inputName: 'Change',
							required: true
						},
						{
							name: 'Settle',
							inputName: 'Settle',
							required: true
						},
					]
				}

				if (req.body["AssetName"] == 'Data') {
					/* Upload the file without validation */
					(async () => {
						// AWSService.CreateDynamodbTable()
						try {
							const result = await AWSService.UploadFileToS3(config_all.cacheDirectory + "/" + fileNameOnDisk, fileNameOnDisk.toLowerCase(), config_all.AWS_USER_ASSETS_BUCKET);
							console.log(result);
						} catch (e) {
							console.log('Error received' + e);
						}

						try {
							const result = await AWSService.PutItemInDynamoDbTable(AWSService.USER_ASSET_TABLE, req.user.suid, fileNameOnDisk.toLowerCase(), null, req.body["AssetName"]);
							console.log(result);
						} catch (e) {
							console.log('Error received' + e);
						}


					})()
				} else {
					const _headers = ["Date", "Volume", "High", "Last", "Low", "OpenInterest", "Open", "Change", "Settle"]
					csv
						.fromPath(csvFilePath, { headers: _headers })
						.validate(function (data) {
							/* If Data Type just upload the data */
							/* Process non header row */
							if (data[_headers[0]] != _headers[0]) {
								const all_non_date_columns_valid = _.every(_.map(_headers, function (header) {
									if (data[header] != "" && isNaN(data[header]) && header != _headers[0]) {
										return false;
									} else {
										return true;
									}
								}));
								/* Date column and all other columns valid */
								if (moment(data[_headers[0]], "YYYY-MM-DD", true).isValid() && all_non_date_columns_valid) {
									return true;
								}
								else {
									return false;
								}
							}
							/* Header row valid */
							return true
						})
						.on("data-invalid", function (data) {
							fileStatus.push('File ' + fileName + 'has invalid data' + JSON.stringify(data));
							fileHasError = true;
							filesWithErrors = filesWithErrors + 1;
						})
						.on("data", function (data) {
						})
						.on("end", function () {
							fileStatus.push('File ' + fileName + 'processed');
							// AWSService.UploadFileToS3(config_all.cacheDirectory + "/" + fileNameOnDisk, fileNameOnDisk, config_all.AWS_USER_ASSETS_BUCKET)
							(async () => {
								// AWSService.CreateDynamodbTable()
								try {
									const result = await AWSService.UploadFileToS3(config_all.cacheDirectory + "/" + fileNameOnDisk, fileNameOnDisk.toLowerCase(), config_all.AWS_USER_ASSETS_BUCKET);
									console.log(result);
								} catch (e) {
									console.log('Error received' + e);
								}

								try {
									const result = await AWSService.PutItemInDynamoDbTable(AWSService.USER_ASSET_TABLE, req.user.suid, fileNameOnDisk.toLowerCase(), null, req.body["AssetName"]);
									console.log(result);
								} catch (e) {
									console.log('Error received' + e);
								}


							})()
							if (i == req.files.length) {
								if (fileHasError) {
									reject("One or more files have errors: " + JSON.stringify(fileStatus));
								} else {
									resolve("Files processed " + JSON.stringify(fileStatus));
								}
							}
						})
						.on("error", function (err) {
							fileStatus.push('File ' + fileName + ' Error: ' + err);
							fileHasError = true;
							filesWithErrors = filesWithErrors + 1;
						});
				}

			}
		}
		else {
			resolve("No files provided");
		}
	})

}

/**
 * Create a Asset
 */

exports.create = function (req, res) {
	userService
    .findById(req.user.id)
	.then(user =>
		{
			processAssetFiles(req, res, user)
			.then(function (result) {
				res.jsonp(result);
			}, function (err) {
				return res.status(400).send({
					message: err
				});
			})
		}
	);
};

/**
 * Show the current Asset
 */
exports.read = function (req, res) {
	res.jsonp(req.asset);
};

/**
 * Update a Asset
 */
exports.update = function (req, res) {
	var asset = req.asset;

	asset = _.extend(asset, req.body);

	asset.save(function (err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(asset);
		}
	});
};

/**
 * Delete an Asset
 */
exports.delete = function (req, res) {
	var asset = req.asset;

	asset.remove(function (err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(asset);
		}
	});
};

/**
 * List of Assets
 */
exports.list = function (req, res) {
	Asset.find().sort('-created').populate('user', 'displayName').exec(function (err, assets) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			cacheUtil.cacheAndSendResponse(req, res, assets);
		}
	});
};

/**
 * List of Assets with Sravz IDs
 */
exports.assetsBySravzIDs = function (req, res) {
	Asset.find({ SravzId: { $in: req.params.sravzIds.split(",") } }).sort('-created').populate('user', 'displayName').exec(function (err, assets) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			cacheUtil.cacheAndSendResponse(req, res, assets);
		}
	});
};

exports.assetsGroupByType = function (req, res) {
	Asset.aggregate(
		[{
		  $group: {
			_id: '$Type',
			assets: { $push: "$$ROOT" }
		  }
		}]
	  ).exec(function (err, assets) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// _.chain(this.assets)
			// .groupBy(x => x.Type)
			// .map((value, key) => ({ assets: value, type: key }))
			// .value();
			cacheUtil.cacheAndSendResponse(req, res, assets);
		}
	});
};


exports.assetsByUsername = function (req, res) {
	(async () => {
		try {
			const result = await AWSService.GetItemsFromDynamoDbTable(AWSService.USER_ASSET_TABLE, req.user.suid);
			return res.jsonp(result);
		} catch (e) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage('Error getting assest by username')
			});
		}
	})()
};

exports.deleteUserAsset = function (req, res) {
	(async () => {

		try {
			const result = await AWSService.DeleteItemsFromDynamoDbTable(AWSService.USER_ASSET_TABLE, req.user.suid, req.params.userAssetId);
			console.log(result);
		} catch (e) {
			console.log('Error delete user asset in dynamodb' + e);
		}
		finally {
			try {
				const result = await AWSService.DeleteFileFromS3(req.params.userAssetId, config_all.AWS_USER_ASSETS_BUCKET)
				console.log(result);
				return res.jsonp(result);
			} catch (e) {
				console.log('Error delete user asset in S3' + e);
				return res.status(400).send({
					message: errorHandler.getErrorMessage('Error delete assest by username')
				});
			}
		}
	})()
};

/**
 * Update a Asset
 */
exports.updateUserAsset = function (req, res) {
	var asset = req.asset;

	asset = _.extend(asset, req.body);

	(async () => {
		try {
			const result = await AWSService.UpdateItemsDynamoDbTable(AWSService.USER_ASSET_TABLE, asset.USERNAME, asset.USER_ASSET_NAME, asset.USER_ASSET_TYPE);
			return res.jsonp(result);
		} catch (e) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage('Error user asset update')
			});
		}
	})()
};

exports.assetsByIDs = function (req, res) {
	Asset.find({ _id: { $in: req.params.ids.split(",") } }).sort('-created').populate('user', 'displayName').exec(function (err, assets) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			cacheUtil.cacheAndSendResponse(req, res, assets);
		}
	});
};



/**
 * Asset middleware
 */
exports.assetByID = function (req, res, next, id) {
	Asset.findById(id).populate('user', 'displayName').exec(function (err, asset) {
		if (err) return next(err);
		if (!asset) return next(new Error('Failed to load Asset ' + id));
		req.asset = asset;
		next();
	});
};

/**
 * Asset authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
	if (req.asset.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

