var config = require('../../config/config'),
    fs = require('fs'),
    _ = require('lodash');


module.exports = {
    cacheAndSendResponse: function (req, res, data, device) {
        try {
            if (device && device != config.pcName && data.length > 0 && data.length > config.mobileDataCount) {
                data = _.slice(data, 0, config.mobileDataCount)
            }
            fs.writeFile(config.app.cacheDirectory + new Buffer(req.url).toString('base64'),
                JSON.stringify(data), function (err) {
                    res.jsonp(data);
                });
        }
        catch (err) {
            console.error(err)
            res.jsonp(data);
        }
    },

    getItem: function (key, callback) {
        var filePath = config.app.cacheDirectory + new Buffer(key).toString('base64');

        try {
            if (fs.statSync(filePath).isFile()) {
                fs.readFile(filePath, 'utf8', function (err, data) {
                    if (err) return callback(err);
                    console.log("Cacheutil: JSON.parse data found in cache:" + data);
                    try {
                        jsonData = JSON.parse(data);
                        callback(null, jsonData);
                    } catch (err) {
                        callback(err);
                    }
                });
            }
        } catch (err) {
            callback(err);
        }

    },

    putItem: function (key, data, callback) {
        /* Put message should be string */
        filePath = config.app.cacheDirectory + new Buffer(key).toString('base64');

        try {
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {

        } finally {
            fs.writeFile(filePath,
                data, function (err) {
                    if (err) return callback(err);
                    callback(null);
                });
        }


    }
};
