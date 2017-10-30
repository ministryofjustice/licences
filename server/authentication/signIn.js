const superagent = require('superagent');
const config = require('../config');
const generateApiGatewayToken = require('./apiGateway');
const logger = require('../../log');

async function signIn(username, password) {

    logger.info(`Log in for: ${username}`);

    try {
        const loginResult = await superagent
            .post(`${config.nomis.apiUrl}/users/login`)
            .set('Authorization', `Bearer ${generateApiGatewayToken()}`)
            .send({username, password})
            .timeout({response: 2000, deadline: 2500});

        logger.info(`Elite2 login success for [${username}]`);
        const eliteAuthorisationToken = loginResult.body.token;

        const profileResult = await superagent
            .get(`${config.nomis.apiUrl}/users/me`)
            .set('Authorization', `Bearer ${generateApiGatewayToken()}`)
            .set('Elite-Authorization', eliteAuthorisationToken);

        logger.info(`Elite2 profile success for [${username}]`);
        return {...profileResult.body, ...{token: eliteAuthorisationToken}};

    } catch (exception) {
        logger.error(`Elite 2 login error [${username}]:`);
        logger.error(exception);
        throw exception;
    }
}

function signInFor(username, password) {
    return signIn(username, password);
}

module.exports = function createSignInService() {
    return {signIn: (username, password) => signInFor(username, password)};
};
