const superagent = require('superagent');
const querystring = require('querystring');
const config = require('../config');
const {generateOauthClientToken, generateAdminOauthClientToken} = require('./oauth');
const logger = require('../../log');
const fiveMinutesBefore = require('../utils/fiveMinutesBefore');

const timeoutSpec = {
    response: config.nomis.timeout.response,
    deadline: config.nomis.timeout.deadline
};

function signInService() {

    return {
        signIn: async function(username, password) {

            logger.info(`Log in for: ${username}`);

            try {
                const oauthClientToken = generateOauthClientToken();
                const oauthRequest = {grant_type: 'password', username, password};
                const oauthResult = await getOauthToken(oauthClientToken, oauthRequest);

                logger.info(`Oauth request for grant type '${oauthRequest.grant_type}', result status: ${oauthResult.status}`);

                return parseOauthTokens(oauthResult);

            } catch (error) {
                if (unauthorised(error)) {
                    logger.error(`Forbidden auth login for [${username}]:`, error.stack);
                    return {};
                }

                logger.error(`Auth login error [${username}]:`, error.stack);
                throw error;
            }
        },

        getRefreshedToken: async function(user) {
            logger.info(`Refreshing token for : ${user.username}`);

            const {token, refreshToken, expiresIn} = await getRefreshTokens(
                user.username, user.role, user.refreshToken
            );

            const refreshTime = fiveMinutesBefore(expiresIn);

            return {token, refreshToken, refreshTime};

        },

        getClientCredentialsTokens: async function(username) {
            const oauthAdminClientToken = generateAdminOauthClientToken();
            const oauthRequest = {grant_type: 'client_credentials', username};

            return oauthTokenRequest(oauthAdminClientToken, oauthRequest);
        }
    };

    async function getRefreshTokens(username, role, refreshToken) {

        const oauthClientToken = generateOauthClientToken();
        const oauthRequest = {grant_type: 'refresh_token', refresh_token: refreshToken};

        return oauthTokenRequest(oauthClientToken, oauthRequest);
    }
}

async function oauthTokenRequest(clientToken, oauthRequest) {
    const oauthResult = await getOauthToken(clientToken, oauthRequest);
    logger.info(`Oauth request for grant type '${oauthRequest.grant_type}', result status: ${oauthResult.status}`);

    return parseOauthTokens(oauthResult);
}

function getOauthToken(oauthClientToken, requestSpec) {

    const oauthRequest = querystring.stringify(requestSpec);

    return superagent
        .post(`${getOauthUrl()}/oauth/token`)
        .set('Authorization', oauthClientToken)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(oauthRequest)
        .timeout(timeoutSpec);
}

function parseOauthTokens(oauthResult) {

    const token = oauthResult.body.access_token;
    const refreshToken = oauthResult.body.refresh_token;
    const expiresIn = oauthResult.body.expires_in;

    return {token, refreshToken, expiresIn};
}

function getOauthUrl() {
    return config.nomis.authUrl;
}

function unauthorised(error) {
    return [400, 401, 403].includes(error.status);
}

module.exports = function createSignInService() {
    return signInService();
};
