
'use strict';
var os = require("os");

module.exports = {
    //db: 'mongodb://localhost/sravzrest-dev',
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI,
	historical_db: process.env.MONGOLAB_SRAVZ_HISTORICAL_URI,
	twitter_client_key: process.env.TWITTER_CLIENT_KEY,
	twitter_client_secret: process.env.TWITTER_CLIENT_SECRET,
	twitter_callback: '/auth/twitter/callback',
	GOOGLE_CLIENT_KEY:process.env.GOOGLE_CLIENT_KEY,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	google_callback: 'https://datalocal.sravz.com/redirect-google',
	FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
	FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
    app: {
        title: 'Sravz',
        https_pfx: process.env.PFX_PATH || '/home/ubuntu/certificate/sravz.pfx',
        https_pfx_password: process.env.PFX_PASSWORD,
        https_port: process.env.NODE_PORT || 3030,
		allowedOrigins: ['https://datalocal.sravz.com', 'https://weblocal.sravz.com', 'https://portfoliolocal.sravz.com',
						// For local development
						'http://localhost:4200', 'http://localhost:4200/',
						//Socket.io required /
						 'https://datalocal.sravz.com/', 'https://weblocal.sravz.com/', 'https://portfoliolocal.sravz.com/'],
        cacheDirectory: "/tmp/sravzportfoliodiskcache/",
		BACKEND_PY_TOPIC: "local_backend-py",
		BACKEND_RUST_TOPIC: "local_backend-rust",
		kafka_analytics2_topic: "local_backend-py",
        BACKEND_NODE_TOPIC: "local_backend-node" + os.hostname(),
		nsq_host: process.env.NSQ_HOST,
		nsq_lookupd_host: process.env.NSQ_LOOKUPD_HOST,
		redis_cluster_info: [
			{
			port: 6379, // Redis port
			host: "redis-node-0", // Redis host
			db: 0,
			password: process.env.REDIS_PASSWORD,
			keepAlive: 60000
			},
			{
			  port: 6380, // Redis port
			  host: "redis-node-1", // Redis host
			  db: 0,
			  password: process.env.REDIS_PASSWORD,
			  keepAlive: 60000

			},
			{
			  port: 6381, // Redis port
			  host: "redis-node-2", // Redis host
			  db: 0,
			  password: process.env.REDIS_PASSWORD,
			  keepAlive: 60000
			},
			{
			  port: 6382, // Redis port
			  host: "redis-node-3", // Redis host
			  db: 0,
			  password: process.env.REDIS_PASSWORD,
			  keepAlive: 60000
			},
			{
			  port: 6383, // Redis port
			  host: "redis-node-4", // Redis host
			  db: 0,
			  password: process.env.REDIS_PASSWORD,
			  keepAlive: 60000
			},
			{
			  port: 6384, // Redis port
			  host: "redis-node-5", // Redis host
			  db: 0,
			  password: process.env.REDIS_PASSWORD,
			  keepAlive: 60000
			}
		],
		portfolioServiceBase : 'https://portfoliolocal.sravz.com',
		analyticsServiceBase : 'https://analyticslocal.sravz.com',
		analyticsSocketServiceBase : 'wss://analyticslocal.sravz.com',
        smartThingsOauth: {
        	oauth2Options: {client: {
                id: '',
                secret: ''
        	},
        	auth: {
        		tokenHost: 'https://graph.api.smartthings.com'
        	}},
            tokenEndpoint: 'https://graph-na02-useast1.api.smartthings.com',
            tokenCallBackUrl: '/api/smarthingstokencallback',
            sravzRedirectUri: 'https://datalocal.sravz.com/authcomplete.html'
		},
		MESSAGE_IDS: {
			'respond_to_ping': 0,
			'STATS_ENGINE.get_dickey_fuller_stats': 1,
			'STATS_ENGINE.get_historical_rolling_stats_by_week': 2,
			'STATS_ENGINE.get_historical_rolling_stats_by_month' : 3,
			'STATS_ENGINE.get_historical_rolling_stats_by_year' : 4,
			'STATS_ENGINE.get_rollingstats_tear_sheet' : 1.1,
			'PCA_ENGINE.get_scatter_plot_daily_return' : 5,
			'PCA_ENGINE.get_pca_components' : 6,
			'PCA_ENGINE.get_pca_components_vs_index_returns' : 6.1,
			'PCA_ENGINE.create_portfolio_pca_report' : 6.2,
			'PCA_ENGINE.get_covariance_matrix' : 7,
			'RISK_ENGINE.get_risk_stats' : 8,
			'CHARTS_ENGINE.get_combined_chart': 9,
			'CHARTS_ENGINE.get_combined_chart_image' : 9.1,
			'STATS_ENGINE.get_rolling_stats_by_sravz_id' : 10,
			'STATS_ENGINE.get_df_test_by_sravz_id' : 11,
			'STATS_ENGINE.get_rolling_stats_by_sravz_id_timeframe' : 12,
			'STATS_ENGINE.get_df_stats_by_sravz_id': 13,
			'RISK_ENGINE.get_returns_tear_sheet' : 14,
			'PORTFOLIO_ENGINE.create_portfolio_returns_tear_sheet' : 15,
			'TIMESERIES_ENGINE.get_ts_analysis' :16,
			'PORTFOLIO_ENGINE.portfolio_returns_timeseries_analysis' : 17,
			'RISK_ENGINE.get_bayesian_tear_sheet' : 18,
			'RISK_ENGINE.get_stocker_tear_sheet_create_prophet_model' : 19.1,
			'RISK_ENGINE.get_stocker_tear_sheet_create_evaluate_prediction' : 19.2,
			'RISK_ENGINE.get_stocker_tear_sheet_create_change_point_prior_analysis': 19.3,
			'RISK_ENGINE.get_stocker_tear_sheet_create_change_point_prior_validation' : 19.4,
			'RISK_ENGINE.get_stocker_tear_sheet_create_prediciton_with_change_point' : 19.5,
			'RISK_ENGINE.get_stocker_tear_sheet_predict_future' : 19.6,
			'PORTFOLIO_ENGINE.get_stocker_tear_sheet_create_prophet_model' : 20.1,
			'PORTFOLIO_ENGINE.get_stocker_tear_sheet_create_evaluate_prediction' : 20.2,
			'PORTFOLIO_ENGINE.get_stocker_tear_sheet_create_change_point_prior_analysis': 20.3,
			'PORTFOLIO_ENGINE.get_stocker_tear_sheet_create_change_point_prior_validation' : 20.4,
			'PORTFOLIO_ENGINE.get_stocker_tear_sheet_create_prediciton_with_change_point' : 20.5,
			'PORTFOLIO_ENGINE.get_stocker_tear_sheet_predict_future' : 20.6,
			'PORTFOLIO_ENGINE.get_correlation_analysis_tear_sheet': 21,
			'CHARTS_ENGINE.get_crypto_tearsheet': 22
		},
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || 'APP_ID',
		clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
		callbackURL: '/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
		clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
		callbackURL: '/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || 'APP_ID',
		clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
		callbackURL: '/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: '/auth/linkedin/callback'
    },
	github: {
		clientID: process.env.GITHUB_ID || 'APP_ID',
		clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
		callbackURL: '/auth/github/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	},
	// ngx-admin
	api: {
		port: 3001,
		root: '/api',
	},

	frontEnd: {
		domain: 'https://datalocal.sravz.com',
	},

	auth: {
		jwt: {
			accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
			refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
			accessTokenLife: 86400,
			refreshTokenLife: 2592000,
		},
		resetPassword: {
			secret: process.env.JWT_RESET_PASSWORD_TOKEN_SECRET,
			ttl: 86400 * 1000, // 1 day
			algorithm: 'aes256',
			inputEncoding: 'utf8',
			outputEncoding: 'hex',
		},
		guest_user: "guest123@guest.com",
		guest_user_enabled: true
	},

	logger: {
		console: {
			level: 'debug',
		},
		file: {
			logDir: '/tmp',
			logFile: 'bundle_node.log',
			level: 'debug',
			maxsize: 1024 * 1024 * 10, // 10MB
			maxFiles: 5,
		},
	},
	quotas: {
		'user': {
			'portfolios': 5
		},
		'admin': {
			'protfolios': 100
		}
	}
};