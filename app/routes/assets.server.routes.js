'use strict';
var multer = require('multer'),
    config_all = require('../../config/env/all');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/tmp/sravzportfoliodiskcache')
	},
	filename: function (req, file, cb) {
		cb(null, req.body["AssetType"] + "_" + req.user.username + '_' + file.originalname + '_' + Date.now())
	}
})

var upload = multer({ storage: storage })

module.exports = function (app) {
	var users = require('../../app/controllers/users.server.controller');
	var assets = require('../../app/controllers/assets.server.controller');
	// Assets Routes
	app.route('/assets')
		.get(users.verifytoken, users.requiresLogin, assets.list)
		.post(users.verifytoken, users.requiresLogin, upload.array('file', config_all.MAX_NUMBER_OF_ASSET_FILES_TO_UPLOAD), assets.create);

	app.route('/assets/:assetId')
		.get(users.verifytoken, users.requiresLogin, assets.read)
		.put(users.verifytoken, users.requiresLogin, assets.hasAuthorization, assets.update)
		.delete(users.verifytoken, users.requiresLogin, assets.hasAuthorization, assets.delete);

	app.route('/assets/bysravzid/:sravzIds')
		.get(users.verifytoken, users.requiresLogin, assets.assetsBySravzIDs);

	app.route('/assetsbytype')
	.get(users.verifytoken, users.requiresLogin, assets.assetsGroupByType);

	app.route('/assets/byid/:ids')
		.get(users.verifytoken, users.requiresLogin, assets.assetsByIDs);

	app.route('/userassets')
	.get(users.verifytoken, users.requiresLogin, assets.assetsByUsername)
	.post(users.verifytoken, users.requiresLogin, assets.updateUserAsset);

	app.route('/userassets/:userAssetId')
		.delete(users.verifytoken, users.requiresLogin, assets.deleteUserAsset);

	// Finish by binding the Asset middleware
	app.param('assetId', assets.assetByID);
};
