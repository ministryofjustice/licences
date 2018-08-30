const logger = require('../../../log.js');

module.exports = function createUserService(userClient) {

    async function getRoUsers() {
        try {
            return userClient.getRoUsers();

        } catch (error) {
            logger.error('Error during getRoUsers', error.stack);
            throw error;
        }
    }

    return {
        getRoUsers
    };
};
