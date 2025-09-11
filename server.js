'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
  config = require('./config/config'),
  mongoose = require('mongoose'),
  http = require('http'),
  https = require('https'),
  fs = require('fs'),
  chalk = require('chalk'),
  logger = require('./app/ngx-admin/utils/logger'),
  Redis = require('ioredis');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
// mongoose.set('useUnifiedTopology', true);
// mongoose.set('useNewUrlParser', true);

var db = mongoose.connect(config.db, {
    auto_reconnect: true,
    socketTimeoutMS: 0,
    connectTimeoutMS: 0,
    // useUnifiedTopology: true,  // Do not enabled: server does not start
    // useNewUrlParser: true
  },
  function (err) {
    if (err) {
      console.error(chalk.red('Could not connect to MongoDB!' + err));
      logger.info(chalk.red(err));
    }
  });

function logErrors(err, req, res, next) {
  logger.error(err);
  next(err);
}

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  logger.info('Mongoose default connection opened');
  // Init the express application
  var app = require('./config/express')();
  app.use(logErrors);
  logger.info('Application Initializing');
  logger.info('Created app');

  var httpServer = http.createServer({}, app);
  logger.info('httpServer created');
  logger.info('Sravz Portfolio: ' + process.env.NODE_ENV + ' application starting on http port: ' + config.app.https_port);

  app.set('httpServer', httpServer);
  const { Server } = require("socket.io");
  const io = new Server(httpServer, {
        pingInterval: 10000,
        pingTimeout: 5000,
        cookie: false,
        allowRequest: (req, callback) => {
          if (config.app.allowedOrigins.indexOf(req.headers.origin) == -1) {
            logger.info("Origin not allowed: " + req.headers.origin);
            return callback('origin not allowed: ' + req.headers.origin, false);
          }
          callback(null, true);
        },
      }
  );
  app.set('socketio', io);
  // Expose app
  exports = module.exports = app;
  /* Start cron jobs */
  // app.set('quotesJob', app.get('quotesJob')(app));
  app.set('cacheDeleteJob', app.get('cacheDeleteJob')(app));
  //app.set('kafkaJob', app.get('kafkaJob')(app));
  app.set('NsqReaderWriter', app.get('NsqReaderWriter')(app));
  // app.get('quotesJob').start();
  app.get('cacheDeleteJob').start();
  //app.get('kafkaJob').start();
  app.get('NsqReaderWriter').start();
  logger.info('Starting socket io');

  // Start real-time quotes
  if (process.env.ENABLE_REDIS_CONNECTION === "true") {
    let redisHosts = process.env.REDIS_HOSTS.split(",")
    let redisConfig = {
      port: 6379, // Redis port
      host: redisHosts[Math.floor(Math.random()*redisHosts.length)], // Redis host
      db: 0,
      password: "***"
    };
    logger.info(`Redis config used: ${JSON.stringify(redisConfig)}`)
    redisConfig.password = process.env.REDIS_PASSWORD;
    try {
      logger.info("Connecting to Redis");
      var redisClient = new Redis(redisConfig);
      redisClient.subscribe("realtime-quotes", (err, count) => {
        if (err) {
          // Just like other commands, subscribe() can fail for some reasons,
          // ex network issues.
          logger.error("Failed to subscribe: %s", err.message);
        } else {
          // `count` represents the number of channels this client are currently subscribed to.
          logger.info(
            `Redis Client subscribed successfully! This client is currently subscribed to ${count} channels.`
          );
        }
      });
      redisClient.on("message", (channel, message) => {
        if (io.engine.clientsCount > 0) {
          io.to('realtime-quotes-room').emit('realtime-quotes-room', message); // emit an event for all connected clients
        }
      });
      redisClient.on('error', function (err) {
        logger.error('Redis client connection error: ' + err);
      })
      redisClient.on('close', function (msg) {
        logger.info('Redis client connection closed: ' + msg);
      })
      redisClient.on('connect', () => {
        logger.info('Redis client connection established');
      })
    }
    catch (e) {
      logger.error("Unable to connect to redis");
      logger.error(e);
    }  
  }
  /* configure global socket io handlers */
  io.on('connection',  (socket) => {
    // do all the session stuff
    logger.info("Socket.io socket connected: " + socket.id)
    socket.join(socket.id);
    app.get('NsqReaderWriter').onClientConnection(socket);
  });

  app.get('httpServer').listen(config.app.https_port);
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
  logger.error('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  logger.warn('Mongoose default connection disconnected');
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.warn('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
