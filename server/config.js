'use strict';

const production = process.env.NODE_ENV === 'production';
const oneDay = 24 * 60 * 60;

function get(name, fallback, options = {}) {
    if (process.env[name]) {
        return process.env[name];
    }
    if (fallback !== undefined && (!production || !options.requireInProduction)) {
        return fallback;
    }
    throw new Error('Missing env var ' + name);
}

module.exports = {

    version: 0.1,

    db: {
        username: get('DB_USER', 'user'),
        password: get('DB_PASS', 'password'),
        server: get('DB_SERVER', 'server'),
        database: get('DB_NAME', 'licences')
    },

    licences: {
        apiUrl: get('LICENCES_API_URL', 'http://localhost:9091'),
        timeout: {
            response: 2000,
            deadline: 2500
        }
    },

    https: production,
    staticResourceCacheDuration: 365 * oneDay,
    healthcheckInterval: Number(get('HEALTHCHECK_INTERVAL', 0)),

    sessionSecret: get('SESSION_SECRET', 'licences-insecure-default-session', {requireInProduction: true})
};
