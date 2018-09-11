module.exports = function createUserService(userClient) {

    async function updateRoUser(
        nomisId, {newNomisId, deliusId, newDeliusId, first, last, organisation, jobRole, email, telephone}) {

        const existingIdChecks = [];

        if (newNomisId !== nomisId) {
            existingIdChecks.push(checkExistingNomis(newNomisId));
        }

        if (newDeliusId !== deliusId) {
            existingIdChecks.push(checkExistingDelius(newDeliusId));
        }

        await Promise.all(existingIdChecks);

        return userClient.updateRoUser(
            nomisId, newNomisId, newDeliusId, first, last, organisation, jobRole, email, telephone);
    }

    async function addRoUser({newNomisId, newDeliusId, first, last, organisation, jobRole, email, telephone}) {

        await Promise.all([
            checkExistingNomis(newNomisId),
            checkExistingDelius(newDeliusId)
        ]);

        return userClient.addRoUser(newNomisId, newDeliusId, first, last, organisation, jobRole, email, telephone);
    }

    async function checkExistingNomis(nomisId) {
        const existing = await userClient.getRoUser(nomisId);

        if (existing) {
            throw Error('Nomis ID already exists');
        }
    }

    async function checkExistingDelius(deliusId) {
        const existing = await userClient.getRoUserByDeliusId(deliusId);

        if (existing) {
            throw Error('Delius staff ID already exists');
        }
    }

    return {
        addRoUser,
        updateRoUser,
        getRoUsers: userClient.getRoUsers,
        getRoUser: userClient.getRoUser,
        getRoUserByDeliusId: userClient.getRoUserByDeliusId,
        deleteRoUser: userClient.deleteRoUser,
        findRoUsers: userClient.findRoUsers
    };
};
