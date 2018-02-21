const config = require('../config');
const querystring = require('querystring');

module.exports = function generateOauthClientToken() {

    const token = new Buffer(
        `${querystring.escape(config.nomis.apiClientId)}:${querystring.escape(config.nomis.apiClientSecret)}`)
        .toString('base64');

    return `Basic ${token}`;
};
