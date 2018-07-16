const superagent = require('superagent');
const querystring = require('querystring');
const config = require('../config');
const {generateOauthClientToken, generateAdminOauthClientToken} = require('./oauth');
const {NoTokenError} = require('../utils/errors');
const logger = require('../../log');

const timeoutSpec = {
    response: config.nomis.timeout.response,
    deadline: config.nomis.timeout.deadline
};

const RO_ROLE_CODE = 'RO';

function signInService(tokenStore, audit) {

    return {

        signIn: async function(username, password) {

            logger.info(`Log in for: ${username}`);

            try {
                const {profile, role, token, refreshToken} = await login(username, password);
                tokenStore.store(username, role, token, refreshToken);
                audit.record('LOGIN', profile.email);

                const activeCaseLoad = await getCaseLoad(token, profile.activeCaseLoadId);

                return {
                    ...profile,
                    token,
                    refreshToken,
                    role,
                    activeCaseLoad,
                    username
                };

            } catch (error) {
                if (unauthorised(error)) {
                    logger.error(`Forbidden Elite2 login for [${username}]:`, error.stack);
                    return {};
                }

                logger.error(`Elite 2 login error [${username}]:`, error.stack);
                throw error;
            }
        },

        refresh: async function(username) {

            logger.info(`Token refresh for: ${username}`);

            const oldTokenObject = tokenStore.get(username);

            if (!oldTokenObject) {
                throw new NoTokenError();
            }

            try {
                const {token, refreshToken} = await getRefreshTokens(username, oldTokenObject);
                tokenStore.store(username, oldTokenObject.role, token, refreshToken);

            } catch (error) {
                if (unauthorised(error)) {
                    logger.error(`Forbidden Elite2 token refresh for [${username}]:`, error.stack);
                    return {};
                }

                logger.error(`Elite 2 token refresh error [${username}]:`, error.stack);
                throw error;
            }
        }
    };

    async function login(username, password) {

        const {token, refreshToken} = await getPasswordTokens(username, password);

        const [profile, role] = await Promise.all([
            getUserProfile(token, username),
            getRoleCode(token)
        ]);

        if (role === RO_ROLE_CODE) {
            const roToken = await getClientCredentialsTokens(username);
            return {profile, role, ...roToken};
        }

        return {profile, role, token, refreshToken};
    }

    async function getPasswordTokens(username, password) {
        const oauthClientToken = generateOauthClientToken();
        const oauthRequest = {grant_type: 'password', username, password};

        return oauthTokenRequest(oauthClientToken, oauthRequest);
    }

    async function getClientCredentialsTokens(username) {
        const oauthAdminClientToken = generateAdminOauthClientToken();
        const oauthRequest = {grant_type: 'client_credentials', username};

        return oauthTokenRequest(oauthAdminClientToken, oauthRequest);
    }

    async function getRefreshTokens(username, oldTokenObject) {

        if (oldTokenObject.role === RO_ROLE_CODE) {
            logger.info('RO client credentials token refresh');
            return getClientCredentialsTokens(username);
        }

        const oauthClientToken = generateOauthClientToken();
        const oauthRequest = {grant_type: 'refresh_token', refresh_token: oldTokenObject.refreshToken};

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
        .set('Elite-Authorization', oauthClientToken)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(oauthRequest)
        .timeout(timeoutSpec);
}

function parseOauthTokens(oauthResult) {

    const token = `${oauthResult.body.token_type} ${oauthResult.body.access_token}`;
    const refreshToken = oauthResult.body.refresh_token;

    return {token, refreshToken};
}

async function getUserProfile(token, username) {
    const profileResult = await nomisGet('/users/me', token);
    logger.info(`Elite2 profile success for [${username}]`);
    return profileResult.body;
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
        .set('Authorization', token)
        .set('Elite-Authorization', token)
        .timeout(timeoutSpec);
}

function getOauthUrl() {
    return config.nomis.apiUrl.replace('/api', '');
}

function unauthorised(error) {
    return [400, 401, 403].includes(error.status);
}

module.exports = function createSignInService(tokenStore, audit) {
    return signInService(tokenStore, audit);
};
