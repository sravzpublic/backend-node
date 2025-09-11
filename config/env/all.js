'use strict';

module.exports = {
	/* Properties common in all envs */
	AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
	AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
	AWS_REGION: 'us-east-1',
	AWS_USER_ASSETS_BUCKET: 'sravz-user-assets',	
	AWS_USER_ASSETS_SIGNED_URL_EXPIRATION_TIME_SECS: 86400, //One day	
	cacheDirectory: "/tmp/sravzportfoliodiskcache/",
	MAX_NUMBER_OF_ASSET_FILES_TO_UPLOAD: 10,

	/* app is overridden in env specific file, do not add anything here */
	app: {
		title: 'Sravz',
		description: 'Sravz Portfolio',
		keywords: 'Sravz Portolio'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'SravzRest',
	sessionCollection: 'sessions',
	mobileDataCount: 365,
	pcName: 'pc',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.css',
                'public/lib/angular-ui-grid/ui-grid.css',
                'public/lib/select2/select2.css',
                'public/lib/angular-toastr/dist/angular-toastr.css',
                'public/lib/angular-ui-select/dist/select.css',
                'public/lib/nvd3/build/nv.d3.css'
			],
            js: [
                'public/lib/jquery/dist/jquery.js',
                'public/lib/angular/angular.js',
                'public/lib/select2/select2.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-animate/angular-animate.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-sanitize/angular-sanitize.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'public/lib/CSV-JS/csv.js',
                'public/lib/pdfmake/build/pdfmake.js',
                'public/lib/pdfmake/build/vfs_fonts.js',
                'public/lib/angular-ui-grid/ui-grid.js',
                'public/lib/angular-ui-select2/src/select2.js',
                'public/lib/ng-lodash/build/ng-lodash.js',
                'public/lib/angular-socket-io/socket.js',
                'public/lib/angular-toastr/dist/angular-toastr.tpls.js',
                'public/lib/angular-ui-select/dist/select.js',
                'public/lib/moment/min/moment-with-locales.js',
                'public/lib/humanize-duration/humanize-duration.js',
                'public/lib/angular-timer/dist/angular-timer.js',
                'public/lib/d3/d3.js',                
                'public/lib/nvd3/build/nv.d3.js',                
                'public/lib/angular-nvd3/dist/angular-nvd3.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};