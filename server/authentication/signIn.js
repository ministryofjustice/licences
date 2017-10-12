const superagent = require('superagent');
const url = require('url');
const config = require('../config');
const generateApiGatewayToken = require('./apiGateway');
const logger = require('../../log');

function signIn(username, password) {
    logger.info(`Signing in user: ${username}`);
    return new Promise((resolve, reject) => {
        superagent
            .post(url.resolve(`${config.nomis.apiUrl}`, '/api/users/login'))
            .set('Authorization', `Bearer ${generateApiGatewayToken()}`)
            .send({username, password})
            .timeout({
                response: 2000,
                deadline: 2500
            })
            .end((error, res) => {
                try {
                    if (error) {
                        logger.error(`Sign in to Elite 2 failed for [${username}] with error:`);
                        logger.error(error);
                        reject(error);
                    }

                    const eliteAuthorisationToken = res.body.token;
                    console.log('Got eliteAuthorisationToken:');
                    console.log(eliteAuthorisationToken);
                    superagent.get(url.resolve(`${config.nomis.apiUrl}`, '/api/users/me'))
                        .set('Authorization', `Bearer ${generateApiGatewayToken()}`)
                        .set('Elite-Authorization', eliteAuthorisationToken)
                        .end((error2, res2) => {
                            if (error2) {
                                logger.error(error2);
                            }
                            logger.info(`Sign in to Elite 2 for [${username}] successful`);
                            console.log('Got user details: ');
                            console.log(res2.body.firstName);
                            resolve({
                                forename: res2.body.firstName,
                                surname: res2.body.lastName,
                                eliteAuthorisationToken
                            });
                        });
                } catch (exception) {
                    logger.error(`Sign in to Elite 2 failed for [${username}] with exception:`);
                    logger.error(exception);
                    reject(exception);
                }
            });
    });
}

function signInFor(username, password) {
    return signIn(username, password);
}

module.exports = function createSignInService() {
    return {signIn: (username, password) => signInFor(username, password)};
};
