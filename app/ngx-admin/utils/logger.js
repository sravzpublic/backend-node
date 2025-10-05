/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const appRoot = require('app-root-path');
const config = require('../../../config/config');
const fs = require('fs');
const winston = require('winston');

const fileLogger = config.logger.file;
const consoleLogger = config.logger.console;
const logDir = `${appRoot}/${fileLogger.logDir}`;
const logFileUrl = `${logDir}/${fileLogger.logFile}`;

// Create log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: consoleLogger.level, // Use console level as default
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
    })
  ),
  defaultMeta: { service: 'sravz-backend' },
  transports: [
    // Console transport only
    new winston.transports.Console({
      level: consoleLogger.level,
      handleExceptions: true,
    })
  ],
  exitOnError: false,
});

module.exports = logger;
