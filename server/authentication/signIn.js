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

        logger.info(`Elite2 login result: [${loginResult.status}]`);

        if (loginResult.status !== 200 && loginResult.status !== 201) {
            logger.info(`Elite2 login failed for [${username}]`);
            logger.warn(loginResult.body);
            throw new Error('Login error');
        }

        logger.info(`Elite2 login success for [${username}]`);
        const eliteAuthorisationToken = loginResult.body.token;

        const profileResult = await superagent
            .get(`${config.nomis.apiUrl}/users/me`)
            .set('Authorization', `Bearer ${generateApiGatewayToken()}`)
            .set('Elite-Authorization', eliteAuthorisationToken);

        logger.info(`Elite2 profile success for [${username}]`);

        const role = await getRole(eliteAuthorisationToken);
        const roleCode = role.roleCode.substring(role.roleCode.lastIndexOf('_') + 1);

        logger.info(`Elite2 profile success for [${username}] with role  [${roleCode}]`);
        return {...profileResult.body, ...{token: eliteAuthorisationToken}, ...{role}, ...{roleCode}};

    } catch (exception) {
        logger.error(`Elite 2 login error [${username}]:`);
        logger.error(exception);
        throw exception;
    }
}

async function getRole(eliteAuthorisationToken) {
    const rolesResult = await superagent
        .get(`${config.nomis.apiUrl}/users/me/roles`)
        .set('Authorization', `Bearer ${generateApiGatewayToken()}`)
        .set('Elite-Authorization', eliteAuthorisationToken);

    logger.info('Roles response');
    logger.info(rolesResult.body);

    const roles = rolesResult.body;

    if (roles && roles.length > 0) {
        const role = roles.find(role => {
            return role.roleCode.includes('LICENCES');
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
