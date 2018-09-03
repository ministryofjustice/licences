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

    async function getRoUser(nomisId) {
        try {
            return userClient.getRoUser(nomisId);

        } catch (error) {
            logger.error('Error during getRoUser', error.stack);
            throw error;
        }
    }

    async function updateRoUser(nomisId, deliusId, first, last) {
        try {
            return userClient.updateRoUser(nomisId, deliusId, first, last);

        } catch (error) {
            logger.error('Error during updateRoUser', error.stack);
            throw error;
        }
    }

    async function deleteRoUser(nomisId) {
        try {
            return userClient.deleteRoUser(nomisId);

        } catch (error) {
            logger.error('Error during deleteRoUser', error.stack);
            throw error;
        }
    }

    async function addRoUser(nomisId, deliusId, first, last) {
        try {

            const existing = await userClient.getRoUser(nomisId);

            if (existing) {
                logger.warn('Error during addRoUser: nomisId already exists');
                throw Error('User already exists');
            }

            return userClient.addRoUser(nomisId, deliusId, first, last);

        } catch (error) {
            logger.error('Error during addRoUser', error.stack);
            throw error;
        }
    }

    async function findRoUsers(searchTerm) {
        try {
            return userClient.findRoUsers(searchTerm);

        } catch (error) {
            logger.error('Error during findRoUsers', error.stack);
            throw error;
        }
    }

    return {
        getRoUsers,
        getRoUser,
        updateRoUser,
        deleteRoUser,
        addRoUser,
        findRoUsers
    };
};
