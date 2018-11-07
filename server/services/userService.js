const allowedRoles = require('../authentication/roles');

module.exports = function(nomisClientBuilder) {

    async function getAllRoles(user) {
        const nomisClient = nomisClientBuilder(user.token);
        const allRoles = await nomisClient.getUserRoles();

        return allRoles
            .filter(role => {
                const roleCode = role.roleCode.substring(role.roleCode.lastIndexOf('_') + 1);
                return allowedRoles.includes(roleCode);
            })
            .map(role => role.roleCode.substring(role.roleCode.lastIndexOf('_') + 1));
    }

    async function setRole(newRole, user) {
        if (!allowedRoles.includes(newRole)) {
            return user;
        }

        user.role = newRole;
        return user;
    }

    function getAllCaseLoads(token) {
        const nomisClient = nomisClientBuilder(token);
        return nomisClient.getUserCaseLoads();
    }

    async function setActiveCaseLoad(id, user) {

        // set active caseload
        const nomisClient = nomisClientBuilder(user.token);
        await nomisClient.putActiveCaseLoad(id);

        // find active caseload
        const [userDetails, caseLoads] = await Promise.all([
            nomisClient.getLoggedInUserInfo(),
            nomisClient.getUserCaseLoads()
        ]);

        user.activeCaseLoad = caseLoads.find(caseLoad => caseLoad.caseLoadId === userDetails.activeCaseLoadId);
        return user;
    }

    return {
        getAllRoles,
        setRole,
        getAllCaseLoads,
        setActiveCaseLoad
    };
};


