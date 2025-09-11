'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	http = require('http'),
	https = require('https'),
	socketio = require('socket.io'),
	express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	compress = require('compression'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	passport = require('passport'),
	mongoStore = require('connect-mongo')({
		session: session
	}),
	flash = require('connect-flash'),
	config = require('./config'),
	consolidate = require('consolidate'),
	path = require('path'),
	multer = require('multer'),
	swaggerUi = require('swagger-ui-express'),
	swaggerDocument = require('../app/ngx-admin/swagger.json'),
	logger = require('../app/ngx-admin/utils/logger');
	// users = require('../app/controllers/users.server.controller');


require('../app/ngx-admin/passport');

module.exports = function () {
	// Initialize express app
	var app = express();

	// Globbing model files
	config.getGlobbedFiles('./app/models/**/*.js').forEach(function (modelPath) {
		require(path.resolve(modelPath));
	});

	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.facebookAppId = config.facebook.clientID;
	app.locals.jsFiles = config.getJavaScriptAssets();
	app.locals.cssFiles = config.getCSSAssets();


	var setAccessControlHeaders = function (req, res) {
		var origin = req.headers.origin;
		if (config.app.allowedOrigins.indexOf(origin) > -1) {
			res.header('Access-Control-Allow-Origin', origin);
			res.header('Access-Control-Allow-Credentials', "true");
		}
		res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
		res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, X-RETURN, X-TOKEN, X-User");
	}

	app.use(function (req, res, next) {
		setAccessControlHeaders(req, res);
		next();
	});

	app.options("/*", function (req, res, next) {
		setAccessControlHeaders(req, res);
		res.sendStatus(200);
	});

	// Passing the request url to environment locals
	app.use(function (req, res, next) {
		res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		next();
	});

	// Should be placed before express.static
	app.use(compress({
		filter: function (req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		level: 9
	}));


	// // Set swig as the template engine
	// app.engine('server.view.html', consolidate[config.templateEngine]);

	// // Set views path and view engine
	// app.set('view engine', 'server.view.html');
	// app.set('views', './app/views');

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Enable logger (morgan)
		app.use(morgan('dev'));
		app.set('showStackError', true);
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
		app.set('showStackError', false);

	}

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// CookieParser should be above session
	app.use(cookieParser());

	// Express MongoDB session storage
	// Not required for jwt based api
	// app.use(session({
	// 	saveUninitialized: true,
	// 	resave: true,
	// 	secret: config.sessionSecret,
	// 	//store: new mongoStore({
	// 	//	store: new MongoStore({ mongooseConnection: mongoose.connection })
	// 	//    //url: dbUrl,
	// 	//    //collection: config.sessionCollection,
	// 	//    //auto_reconnect: true
	// 	//}),
	// 	store: new mongoStore({ mongooseConnection: mongoose.connection }),
	// 	httpOnly: true,
	// 	secure: true,
	// 	ephemeral: true
	// }));

	// use passport session
	// app.use(passport.initialize());
	// app.use(passport.session());
	// var social = require('./strategies/social')(app, passport); // Import passport.js End Points/API

	require('./strategies/google-token')();
	require('./strategies/facebook-token')();

	const auth = passport.authenticate('jwt', { session: false });

	const customSwaggerOptions = {
		showExplorer: true,
		swaggerOptions: {
			authAction: {
				JWT: {
					name: 'JWT',
					schema: {
						type: 'apiKey',
						in: 'header',
						name: 'Authorization',
						description: 'Bearer <my own JWT token>',
					},
					value: 'Bearer <my own JWT token>',
				},
			},
		},
	};

	app.use(`${config.api.root}/swagger`, (req, res, next) => {
		swaggerDocument.host = req.get('host');
		req.swaggerDoc = swaggerDocument;
		next();
	}, swaggerUi.serve, swaggerUi.setup(null, customSwaggerOptions));

	// connect flash for flash messages
	app.use(flash());

	// Use helmet to secure Express headers
	app.use(helmet.frameguard());
	app.use(helmet.xssFilter());
	app.use(helmet.noSniff());
	app.use(helmet.ieNoOpen());
	app.disable('x-powered-by');

	/* 	// Setting the app router and static folder
		app.use(express.static(path.resolve('./public'))); */

	// Cache
	// Cache directory
	if (!fs.existsSync(config.app.cacheDirectory)) {
		fs.mkdirSync(config.app.cacheDirectory);
	}

	var cacheInterceptor = function (req, res, next) {
		try {
			var filePath = config.app.cacheDirectory + new Buffer(req.url).toString('base64');
			if (req.method == "GET") {
				if (fs.statSync(filePath).isFile()) {
					fs.readFile(filePath, 'utf8', function (err, data) {
						if (err) {
							next();
						}
						res.jsonp(JSON.parse(data));
					});
				}
			}
			else {
				next();
			}
		}
		catch (err) {
			next();
		}
	}

	app.use(cacheInterceptor);

	// Globbing routing files
	config.getGlobbedFiles('./app/routes/**/*.js').forEach(function (routePath) {
		require(path.resolve(routePath))(app);
	});

	// ngx-admin routes
	// common controllers
	const authController = require('../app/ngx-admin/api/common/auth/authController');
	const userController = require('../app/ngx-admin/api/common/user/userController');
	const userPhotoController = require('../app/ngx-admin/api/common/user/userPhotoController');
	const settingsController = require('../app/ngx-admin/api/common/settings/settingsController');

	// ecom controllers
	const orderController = require('../app/ngx-admin/api/ecom/order/orderController');
	const ordersAggregatedController = require('../app/ngx-admin/api/ecom/ordersAggregated/ordersAggregatedController');
	const ordersProfitController = require('../app/ngx-admin/api/ecom/ordersProfit/ordersProfitController');
	const orderTypesController = require('../app/ngx-admin/api/ecom/orderTypes/orderTypesController');
	const orderStatusesController = require('../app/ngx-admin/api/ecom/orderStatuses/orderStatusesController');
	const countriesController = require('../app/ngx-admin/api/ecom/countries/countriesController');
	const trafficAggregatedController = require('../app/ngx-admin/api/ecom/trafficAggregated/trafficAggregatedController');
	const userActivityController = require('../app/ngx-admin/api/ecom/userActivities/userActivityController');


	// routes for common controllers
	app.use(`${config.api.root}/auth`, authController);
	// TODO: fix photo, it temporary solution
	app.use(`${config.api.root}/users/:userId/photo`, userPhotoController);

	// app.get('/auth/linkedin',
	// GithubStrategy,
	// function(req, res){
	//   // The request will be redirected to LinkedIn for authentication, so this
	//   // function will not be called.
	// });

	// passport strategies
	// passport.use(new LinkedInStrategy({
	// 	consumerKey: config.app.githubOauth.oauth2Options.client.id,
	// 	consumerSecret: config.app.githubOauth.oauth2Options.client.secret,
	// 	callbackURL: "http://127.0.0.1:3030/auth/linkedin/callback"
	//   },
	//   function(token, tokenSecret, profile, done) {
	// 	// asynchronous verification, for effect...
	// 	process.nextTick(function () {
	// 	  // To keep the example simple, the user's LinkedIn profile is returned to
	// 	  // represent the logged-in user.  In a typical application, you would want
	// 	  // to associate the LinkedIn account with a user record in your database,
	// 	  // and return that user instead.
	// 	  return done(null, profile);
	// 	});
	//   }
	// ));

	app.use(`${config.api.root}/users`, auth, userController);
	app.use(`${config.api.root}/settings`, auth, settingsController);

	// routes for ecom controllers
	app.use(`${config.api.root}/orders`, auth, orderController);
	app.use(`${config.api.root}/orders-aggregated`, auth, ordersAggregatedController);
	app.use(`${config.api.root}/orders-profit`, auth, ordersProfitController);
	app.use(`${config.api.root}/order-types`, auth, orderTypesController);
	app.use(`${config.api.root}/order-statuses`, auth, orderStatusesController);
	app.use(`${config.api.root}/countries`, auth, countriesController);
	app.use(`${config.api.root}/traffic-aggregated`, auth, trafficAggregatedController);
	app.use(`${config.api.root}/user-activity`, auth, userActivityController);

	function logErrors(err, req, res, next) {
		logger.error(err);
		next(err);
	}

	function clientErrorHandler(err, req, res, next) {
		if (req.xhr) {
			res.status(500).send({ error: 'Something went wrong.' });
		} else {
			next(err);
		}
	}

	app.use(logErrors);
	app.use(clientErrorHandler);

	//Globbing job files
	config.getGlobbedFiles('./app/jobs/*.js').forEach(function (jobsPath) {
		require(path.resolve(jobsPath))(app);
	});


	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function (err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		logger.error(err.stack);

		// Error page
		res.status(500).render('500', {
			error: err.stack
		});
	});

	// Assume 404 since no middleware responded
	app.use(function (req, res) {
		res.status(404).render('404', {
			url: req.originalUrl,
			error: 'Not Found'
		});
	});

	/* Multer */

	/* 	app.use(multer({
			dest: '/tmp/asset_uploads/',
			rename: function (fieldname, filename) {
			return filename + Date.now();
			},
			onFileUploadStart: function (file) {
			console.log(file.originalname + ' is starting ...');
			},
			onFileUploadComplete: function (file) {
			console.log(file.fieldname + ' uploaded to  ' + file.path);
			}
		})); */

	return app;
};