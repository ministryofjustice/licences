require('dotenv').config();
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

    nomis: {
        apiUrl: get('NOMIS_API_URL', 'http://localhost:9090/elite2api'),
        apiGatewayToken: get('NOMIS_GW_TOKEN', 'dummy'),
        apiGatewayPrivateKey: new Buffer(get('NOMIS_GW_KEY', 'dummy'), 'base64').toString('ascii'),
        timeout: {
            response: 2000,
            deadline: 2500
        }
    },

    establishments: {
        apiUrl: get('ESTABLISHMENTS_API_URL', 'http://licences-nomis-mocks.herokuapp.com'),
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
