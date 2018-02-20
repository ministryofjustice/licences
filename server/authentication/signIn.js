const superagent = require('superagent');
const querystring = require('querystring');
const config = require('../config');
const generateApiGatewayToken = require('./apiGateway');
const logger = require('../../log');

async function signIn(username, password) {

    logger.info(`Log in for: ${username}`);

    try {

        const gatewayToken = generateApiGatewayToken();

        const oauthUrl = config.nomis.apiUrl.replace('/api', '');

        const loginResult = await superagent
            .post(`${oauthUrl}/oauth/token`)
            .set('Authorization', `Bearer ${gatewayToken}`)
            .set('Elite-Authorization', `Basic ${encodeClientCredentials()}`)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(`grant_type=password&username=${username}&password=${password}`)
            .timeout({response: 2000, deadline: 2500});

        console.log(loginResult.body.access_token);
        console.log(loginResult.body);

        logger.info(`Elite2 login result: [${loginResult.status}]`);

        if (loginResult.status !== 200 && loginResult.status !== 201) {
            logger.info(`Elite2 login failed for [${username}]`);
            logger.warn(loginResult.body);
            throw new Error('Login error');
        }

        logger.info(`Elite2 login success for [${username}]`);

        // todo modify this to get the oauth token
        const eliteAuthorisationToken = loginResult.body.access_token;

        const profileResult = await superagent
            .get(`${config.nomis.apiUrl}/users/me`)
            .set('Authorization', `Bearer ${generateApiGatewayToken()}`)
            .set('Elite-Authorization', `Bearer ${eliteAuthorisationToken}`);

        logger.info(`Elite2 profile success for [${username}]`);

        const role = await getRole(eliteAuthorisationToken);
        const roleCode = role.roleCode.substring(role.roleCode.lastIndexOf('_') + 1);

        logger.info(`Elite2 profile success for [${username}] with role  [${roleCode}]`);
        return {...profileResult.body, token: eliteAuthorisationToken, role: roleCode, username};
    } catch (error) {
        logger.error(`Elite 2 login error [${username}]:`, error.stack);
        throw error;
    }
}

function encodeClientCredentials() {
    const basicAuth = new Buffer(
        `${querystring.escape(config.nomis.apiClientId)}:${querystring.escape(config.nomis.apiClientSecret)}`)
        .toString('base64');
    console.log(basicAuth);
    return basicAuth;
}


async function getRole(eliteAuthorisationToken) {
    const rolesResult = await superagent
        .get(`${config.nomis.apiUrl}/users/me/roles`)
        .set('Authorization', `Bearer ${generateApiGatewayToken()}`)
        .set('Elite-Authorization', `Bearer ${eliteAuthorisationToken}`);

    logger.info('Roles response');
    logger.info(rolesResult.body);

    const roles = rolesResult.body;

    if (roles && roles.length > 0) {
        const role = roles.find(role => {
            return role.roleCode.includes(config.nomis.licenceRolePrefix);
        });

        logger.info(`Selected role: ${role.roleCode}`);
        if (role) return role;
    }

    throw new Error('Login error - no acceptable role');
}

function signInFor(username, password) {
    return signIn(username, password);
}

module.exports = function createSignInService() {
    return {signIn: (username, password) => signInFor(username, password)};
};
