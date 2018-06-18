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

    enableTestUtils: get('ENABLE_TEST_UTILS', false),

    db: {
        username: get('DB_USER', 'user'),
        password: get('DB_PASS', 'password'),
        server: get('DB_SERVER', 'server'),
        database: get('DB_NAME', 'licences'),
        sslEnabled: get('DB_SSL_ENABLED', 'true')
    },

    nomis: {
        apiUrl: get('NOMIS_API_URL', 'http://localhost:9090/elite2api'),
        apiGatewayEnabled: get('API_GATEWAY_ENABLED', 'yes'),
        apiGatewayToken: get('NOMIS_GW_TOKEN', 'dummy'),
        apiGatewayPrivateKey: new Buffer(get('NOMIS_GW_KEY', 'dummy'), 'base64').toString('ascii'),
        timeout: {
            response: 5000,
            deadline: 7500
        },
        licenceRolePrefix: get('LICENCE_ROLE_PREFIX', 'LICENCE'),
        apiClientId: get('API_CLIENT_ID', 'licences'),
        apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret'),
        licencesAdminApiClientId: get('ADMIN_API_CLIENT_ID', 'licencesadmin'),
        licencesAdminApiClientSecret: get('ADMIN_API_CLIENT_SECRET', 'clientsecret')
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

    sessionSecret: get('SESSION_SECRET', 'licences-insecure-default-session', {requireInProduction: true}),

    pdf: {
        pdfServiceHost: get('PDF_SERVICE_HOST', 'http://localhost:8081')
    }
};
