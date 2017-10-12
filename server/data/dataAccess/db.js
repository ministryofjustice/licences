const util = require('util');
const logger = require('../../../log.js');

module.exports = {
    getCollection,
    connect,
    addParams
};

function connect() {
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
}

function addParams(params, request) {
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
}

function getCollection(sql, params, successCallback, errorCallback) {
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

function disconnect(connection) {
    logger.debug('Closing DB connection on disconnect');
    connection.close();
}
