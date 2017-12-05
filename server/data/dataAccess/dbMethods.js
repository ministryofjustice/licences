const {
    connect,
    disconnect,
    addParams
} = require('./db');

const util = require('util');
const logger = require('../../../log');
const Request = require('tedious').Request;

module.exports = {

    execSql: function(sql, params, successCallback, errorCallback) {

        const connection = connect();
        connection.on('connect', error => {
            if (error) {
                errorCallback(error);
            }

            const request = new Request(sql, (error, rows, searchId) => {
                if(error) {
                    return errorCallback(error);
                }

                logger.debug('Closing DB connection');
                connection.close();

                return successCallback();
            });

            if (params) {
                addParams(params, request);
            }

            connection.execSql(request);
        });
    },

    getCollection: function(sql, params, successCallback, errorCallback) {
        let connected = false;
        const connection = connect();

        connection.on('connect', function(err) {
            if (err) {
                return finish(err);
            }

            connected = true;

            const Request = require('tedious').Request;
            const request = new Request(sql, function(err, rowCount, rows) {

                if (err) {
                    return finish(err);
                }
                if (rowCount === 0) {
                    return finish(null, rowCount);
                }

                return finish(null, rows);
            });

            if (params) {
                addParams(params, request);
            }

            logger.debug('Executing collection request: ' + util.inspect(request));
            connection.execSql(request);
        });

        function finish(err, result) {
            if (connected) {
                logger.debug('DB collection connection finish - disconnecting');
                disconnect(connection);
            } else {
                logger.debug('DB collection connection finish - not connected');
            }

            if (err) {
                logger.error('Error during collection query: ' + err);
                return errorCallback(err);
            }
            return successCallback(result);
        }
    }
};
