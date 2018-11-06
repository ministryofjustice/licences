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

    return {
        getAllRoles,
        setRole
    };
};


