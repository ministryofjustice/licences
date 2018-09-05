module.exports = function createUserService(userClient) {

    async function updateRoUser(
        nomisId, {newNomisId, deliusId, newDeliusId, first, last, organisation, jobRole, email, telephone}) {

        if (newNomisId !== nomisId) {
            await checkExistingNomis(newNomisId, newDeliusId);
        }

        if (newDeliusId !== deliusId) {
            await checkExistingDelius(newDeliusId);
        }

        return userClient.updateRoUser(
            nomisId, newNomisId, newDeliusId, first, last, organisation, jobRole, email, telephone);
    }

    async function addRoUser({nomisId, deliusId, first, last, organisation, jobRole, email, telephone}) {

        await Promise.all([
            checkExistingNomis(nomisId),
            checkExistingDelius(deliusId)
        ]);

        return userClient.addRoUser(nomisId, deliusId, first, last, organisation, jobRole, email, telephone);
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
        deleteRoUser: userClient.deleteRoUser,
        findRoUsers: userClient.findRoUsers
    };
};
