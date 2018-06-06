const superagent = require('superagent');
const querystring = require('querystring');

const config = require('../config');
const generateApiGatewayToken = require('./apiGateway');
const {generateOauthClientToken} = require('./oauth');
const logger = require('../../log');

const timeoutSpec = {
    response: config.nomis.timeout.response,
    deadline: config.nomis.timeout.deadline
};

function signInService(tokenStore) {

    return {

        signIn: async function(username, password) {

            logger.info(`Log in for: ${username}`);

            try {
                const oauthResult = await login(generateOauthClientToken(), username, password);
                const {token, refreshToken} = storeToken(username, oauthResult);

                const profile = await getUserProfile(token, username);
                const roleCode = await getRoleCode(token);
                const activeCaseLoad = await getCaseLoad(token, profile.body.activeCaseLoadId);

                return {
                    ...profile.body,
                    token,
                    refreshToken,
                    role: roleCode,
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

        refresh: async function(username, oldRefreshToken) {
            const oauthResult = await refreshNomisToken(generateOauthClientToken(), username, oldRefreshToken);
            storeToken(username, oauthResult);
        }
    };

    function storeToken(username, oauthResult) {
        const {token, refreshToken} = getApiAccessTokens(oauthResult);
        tokenStore.addOrUpdate(username, token, refreshToken);

        return {token, refreshToken};
    }
}

function gatewayTokenOrCopy(token) {
    return config.nomis.apiGatewayEnabled === 'yes' ? generateApiGatewayToken() : token;
}

async function login(oauthClientToken, username, password) {

    const grantType = 'password';
    const oauthResult = await getOauthToken(oauthClientToken, {grant_type: grantType, username, password});

    logger.info(`Elite2 login result: [${oauthResult.status}]`);
    logger.info(`Elite2 login success for [${username}]`);

    return oauthResult;
}

async function refreshNomisToken(oauthClientToken, username, refreshToken) {

    const grantType = 'refresh_token';
    const oauthResult = await getOauthToken(oauthClientToken, {grant_type: grantType, refresh_token: refreshToken});

    logger.info(`Elite2 login result: [${oauthResult.status}]`);
    logger.info(`Elite2 login success for [${username}]`);

    return oauthResult;
}

async function getOauthToken(oauthClientToken, requestSpec) {

    const oauthRequest = querystring.stringify(requestSpec);

    return superagent
        .post(`${getOauthUrl()}/oauth/token`)
        .set('Authorization', gatewayTokenOrCopy(oauthClientToken))
        .set('Elite-Authorization', oauthClientToken)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(oauthRequest)
        .timeout(timeoutSpec);
}

function getApiAccessTokens(oauthResult, username) {
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

async function nomisGet(path, token) {
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
