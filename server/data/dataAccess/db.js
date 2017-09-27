'use strict';

const logger = require('../../../log');

module.exports = {

    connect: function() {
        const config = require('../../config');
        const Connection = require('tedious').Connection;

        let connection = new Connection({
            userName: config.db.username,
            password: config.db.password,
            server: config.db.server,
            options: {
                encrypt: true,
                database: config.db.database,
                useColumnNames: true,
                rowCollectionOnRequestCompletion: true
            }
        });

        connection.on('error', function(err) {
            if(err.message === 'Connection lost - read ECONNRESET') {
                logger.warn('Connection lost - read ECONNRESET');
                logger.info('Azure loadbalancer timeout error - see https://github.com/tediousjs/tedious/issues/300');
            } else {
                logger.error('DB error: ' + err.message);
            }
        });

        logger.debug('Created new DB connection');
        return connection;
    },

    addParams: function(params, request) {
        params.forEach(function(param) {
            let paramValue = param.value;

            if (isNaN(paramValue)) {
                paramValue = paramValue.toUpperCase();
            }

            request.addParameter(
                param.column,
                param.type,
                paramValue);
        });
    },

    disconnect: function(connection) {
        logger.debug('Closing DB connection on disconnect');
        connection.close();
    }
};
