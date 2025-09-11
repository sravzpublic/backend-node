'use strict';

/**
 * Module dependencies.
 */
var glob = require('glob'),
    chalk = require('chalk'),
    os = require('os');

/**
 * Module init function.
 */
module.exports = function() {
	/**
	 * Before we begin, lets set the environment variable
	 * We'll Look for a valid NODE_ENV variable and if one cannot be found load the development NODE_ENV
	 */
	glob('./config/env/' + process.env.NODE_ENV + '.js', function(err, environmentFiles) {
		if (!environmentFiles.length) {
			if (process.env.NODE_ENV) {
				console.error(chalk.red('No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
            } else {
                if (os.platform() === 'win32') {
                    console.error(chalk.red('NODE_ENV is not defined! Running on windows, Using default development environment'));
                    process.env.NODE_ENV = 'development';
                } else {
                    console.error(chalk.red('NODE_ENV is not defined! Running on vagrant/ubuntu, Using default development environment'));
                    process.env.NODE_ENV = 'development';    
                }
			}
			
            /* TODO: Set the cert location in config */
		} else {
			console.log(chalk.black.bgWhite('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration'));
		}
	});

};