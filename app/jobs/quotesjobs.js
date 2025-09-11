var mongoose = require('mongoose'),
    Quote = mongoose.model('quotes_commodities'),
    CronJob = require('cron').CronJob,
    Redis = require("ioredis");

var quotesJob = function (app) {
    var redis = new Redis({
        port: 6379, // Redis port
        host: "redis", // Redis host
        db: 0,
      });
    var io = app.get('socketio');
    var job = new CronJob({
        cronTime: '*/1 * * * *',
        onTick: function () {
            const keys = redis.collection.keys('*');
            const values = redis.collection.mget(keys);
            if (io.engine.clientsCount > 0) {
                console.log(`Sending quotes ${values}`)
                io.sockets.emit('quote.refreshed', values); // emit an event for all connected clients
            }
            // Quote.find().sort('Commodity').exec(function (err, quotes) {
            //     if (err) {
            //         //TODO: Check how to handle this case
            //         return null;
            //     } else {
            //         var io = app.get('socketio');
            //         if (io.engine.clientsCount > 0) {
            //             io.sockets.emit('quote.refreshed', quotes); // emit an event for all connected clients
            //         }
            //     }
            // });
        },
        onComplete: function () {
            /* This function is executed when the job stops */
        }});
    return job;
};

module.exports = function (app) {
    app.set('quotesJob', quotesJob);
};