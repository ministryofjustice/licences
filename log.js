const winston = require('winston');
const {flattenMeta} = require('./server/misc');

const logger = new (winston.Logger);

logger.setLevels({
    audit: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4
});
winston.addColors({
    audit: 'cyan',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'grey'
});

logger.clear();
if (process.env.NODE_ENV === 'test') {
    logger.add(winston.transports.File, {
        name: 'log',
        level: 'debug',
        filename: 'tests.log',
        json: false,
        colorize: true,
        prettyPrint: true
    });
} else if (process.env.NODE_ENV === 'production') {
    logger.add(winston.transports.Console, {
        name: 'log',
        level: 'info',
        json: true,
        colorize: false,
        prettyPrint: false,
        silent: false,
        timestamp: true,
        stringify: true,
        handleExceptions: true
    });
} else {
    logger.add(winston.transports.Console, {
        name: 'log',
        level: 'info',
        json: false,
        colorize: true,
        // prettyPrint: true,
        silent: false,
        timestamp: true,
        handleExceptions: true,
        humanReadableUnhandledException: true
    });
}

const appInsights = require('./azure-appinsights');
if (appInsights) {
    const {AzureApplicationInsightsLogger} = require('winston-azure-application-insights');
    logger.info('Activating application insights logger');

    logger.add(winston.transports.Console, new AzureApplicationInsightsLogger({
        insights: appInsights,
        level: 'info',
        sendErrorsAsExceptions: true
    }));

    logger.rewriters.push(function(level, msg, meta) {
        return flattenMeta(meta);
    });
}

module.exports = logger;
