var fs = require('fs'),
    config = require('../../config/config'),
    CronJob = require('cron').CronJob;

rmDir = function (dirPath, removeSelf) {
    if (removeSelf === undefined)
        removeSelf = true;
    try { var files = fs.readdirSync(dirPath); }
    catch (e) { return; }
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                rmDir(filePath);
        }
    if (removeSelf)
        fs.rmdirSync(dirPath);
};

var cacheDeleteJob = function (app) {
    var job = new CronJob({
        cronTime: '0 59 23 * * *',
        onTick: function () {
            console.log('Deleting cache directory');
            rmDir(config.app.cacheDirectory, false);
        }, 
        onComplete: function () {
            /* This function is executed when the job stops */
        }});
    return job;
};

module.exports = function (app) {
    app.set('cacheDeleteJob', cacheDeleteJob);
};