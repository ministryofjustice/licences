const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function generateApiGatewayToken() {
    const mojDevToken = `${config.nomis.apiGatewayToken}`;
    const milliseconds = Math.round((new Date()).getTime() / 1000);

    const payload = {
        iat: milliseconds,
        token: mojDevToken
    };

    const privateKey = `${config.nomis.apiGatewayPrivateKey}`;
    const cert = new Buffer(privateKey);
    const token = jwt.sign(payload, cert, {algorithm: 'ES256'});

    return `Bearer ${token}`;
};
