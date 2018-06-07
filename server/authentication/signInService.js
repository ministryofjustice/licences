const superagent = require('superagent');
const querystring = require('querystring');

const config = require('../config');
const generateApiGatewayToken = require('./apiGateway');
const {generateOauthClientToken, generateAdminOauthClientToken} = require('./oauth');
const logger = require('../../log');

const timeoutSpec = {
    response: config.nomis.timeout.response,
    deadline: config.nomis.timeout.deadline
};

const RO_ROLE_CODE = 'RO';

function signInService(tokenStore) {

    return {

        signIn: async function(username, password) {

            logger.info(`Log in for: ${username}`);

            try {
                const {profile, role, tokenObject} = await doLogin(username, password);

                const activeCaseLoad = await getCaseLoad(tokenObject.token, profile.activeCaseLoadId);

                return {
                    ...profile,
                    ...tokenObject,
                    role,
                    activeCaseLoad,
                    username
                };

            } catch (error) {
                if (error.status === 400 || error.status === 401 || error.status === 403) {
                    logger.error(`Forbidden Elite2 login for [${username}]:`, error.stack);
                    return {};
                }

                logger.error(`Elite 2 login error [${username}]:`, error.stack);
                throw error;
            }
        },

        refresh: async function(role, username, oldRefreshToken) {

            logger.info(`Token refresh for: ${username}`);

            try {
                const oauthResult = await getRefreshToken(role, username, oldRefreshToken);
                logger.info(`Refresh oauth result status: ${oauthResult.status}`);

                storeToken(username, oauthResult);

            } catch (error) {
                if (error.status === 400 || error.status === 401 || error.status === 403) {
                    logger.error(`Forbidden Elite2 token refresh for [${username}]:`, error.stack);
                    return {};
                }

                logger.error(`Elite 2 token refresh error [${username}]:`, error.stack);
                throw error;
            }
        }
    };

    async function doLogin(username, password) {

        const oauthResult = await getPasswordOauthToken(generateOauthClientToken(), username, password);
        logger.info(`Password oauth result status: ${oauthResult.status}`);
        const tokenObject = storeToken(username, oauthResult);

        const profile = await getUserProfile(tokenObject.token, username);
        const role = await getRoleCode(tokenObject.token);

        if (role === RO_ROLE_CODE) {
            const oauthResult = await getClientCredentialsOauthToken(generateAdminOauthClientToken(), username);
            logger.info(`RO client credentials oauth result status: ${oauthResult.status}`);
            return userData(profile, role, storeToken(username, oauthResult));
        }

        return userData(profile, role, tokenObject);
    }

    function userData(profile, role, tokenObject) {
        return {
            profile: profile.body,
            role,
            tokenObject
        };
    }

    function storeToken(username, oauthResult) {
        const {token, refreshToken} = getTokens(oauthResult);
        tokenStore.addOrUpdate(username, token, refreshToken);
        return {token, refreshToken};
    }

    function getRefreshToken(role, username, oldRefreshToken) {

        if (role === RO_ROLE_CODE) {
            logger.info('RO client credentials token refresh');
            return getClientCredentialsOauthToken(generateAdminOauthClientToken(), username);
        }

        logger.info('Non-RO token refresh');
        return getRefreshOauthToken(generateOauthClientToken(), username, oldRefreshToken);
    }
}

function gatewayTokenOrCopy(token) {
    return config.nomis.apiGatewayEnabled === 'yes' ? generateApiGatewayToken() : token;
}

function getPasswordOauthToken(oauthClientToken, username, password) {
    return getOauthToken(oauthClientToken, {grant_type: 'password', username, password});
}

function getRefreshOauthToken(oauthClientToken, username, refreshToken) {
    return getOauthToken(oauthClientToken, {grant_type: 'refresh_token', refresh_token: refreshToken});
}

function getClientCredentialsOauthToken(oauthClientToken, username) {
    return getOauthToken(oauthClientToken, {grant_type: 'client_credentials', username});
}


function getOauthToken(oauthClientToken, requestSpec) {

    const oauthRequest = querystring.stringify(requestSpec);

    return superagent
        .post(`${getOauthUrl()}/oauth/token`)
        .set('Authorization', gatewayTokenOrCopy(oauthClientToken))
        .set('Elite-Authorization', oauthClientToken)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(oauthRequest)
        .timeout(timeoutSpec);
}

function getTokens(oauthResult, username) {
    const token = `${oauthResult.body.token_type} ${oauthResult.body.access_token}`;
    const refreshToken = oauthResult.body.refresh_token;
    return {token, refreshToken};
}

async function getUserProfile(token, username) {
    const profileResult = await nomisGet('/users/me', token);
    logger.info(`Elite2 profile success for [${username}]`);
    return profileResult;
}

async function getRoleCode(token) {
    const role = await getRole(token);
    const roleCode = role.roleCode.substring(role.roleCode.lastIndexOf('_') + 1);
    logger.info(`Elite2 got user role code [${roleCode}]`);
    return roleCode;
}

async function getRole(token) {

    const rolesResult = await nomisGet('/users/me/roles', token);
    const roles = rolesResult.body;
    logger.info(`Roles response [${JSON.stringify(roles)}]`);

    if (roles && roles.length > 0) {
        const role = roles.find(role => {
            return role.roleCode.includes(config.nomis.licenceRolePrefix);
        });

        logger.info(`Selected role: ${role.roleCode}`);
        if (role) {
            return role;
        }
    }

    throw new Error('Login error - no acceptable role');
}

async function getCaseLoad(token, id) {

    try {
        const result = await nomisGet('/users/me/caseLoads', token);
        return result.body.find(caseLoad => caseLoad.caseLoadId === id) || null;

    } catch (error) {
        logger.error('No active case load', error.stack);
        return null;
    }
}

function nomisGet(path, token) {
    return superagent
        .get(`${config.nomis.apiUrl}${path}`)
        .set('Authorization', gatewayTokenOrCopy(token))
        .set('Elite-Authorization', token)
        .timeout(timeoutSpec);
}

function getOauthUrl() {
    return config.nomis.apiUrl.replace('/api', '');
}

module.exports = function createSignInService(tokenStore) {
    return signInService(tokenStore);
};
