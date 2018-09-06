module.exports = function createUserService(nomisClientBuilder, userClient) {

    async function updateRoUser(
        token, nomisId,
        {newNomisId, deliusId, newDeliusId, first, last, organisation, jobRole, email, telephone, verify}) {

        const idChecks = [];

        if (newNomisId !== nomisId) {
            idChecks.push(checkExistingNomis(newNomisId));

            if (verify === 'Yes') {
                idChecks.push(checkInvalidNomis(token, newNomisId));
            }
        }

        if (newDeliusId !== deliusId) {
            idChecks.push(checkExistingDelius(newDeliusId));
        }

        await Promise.all(idChecks);

        return userClient.updateRoUser(
            nomisId, newNomisId, newDeliusId, first, last, organisation, jobRole, email, telephone);
    }

    async function verifyUserDetails(token, nomisUserName) {
        const nomisClient = nomisClientBuilder(token);
        return nomisClient.getUserInfo(nomisUserName);
    }

    async function addRoUser(
        token, {newNomisId, newDeliusId, first, last, organisation, jobRole, email, telephone, verify}) {

        const idChecks = [
            checkExistingNomis(newNomisId),
            checkExistingDelius(newDeliusId)
        ];

        if (verify === 'Yes') {
            idChecks.push(checkInvalidNomis(token, newNomisId));
        }

        await Promise.all(idChecks);

        return userClient.addRoUser(newNomisId, newDeliusId, first, last, organisation, jobRole, email, telephone);
    }

    async function checkExistingNomis(nomisId) {
        const existing = await userClient.getRoUser(nomisId);

        if (existing) {
            throw Error('Nomis ID already exists in RO mappings');
        }
    }

    async function checkExistingDelius(deliusId) {
        const existing = await userClient.getRoUserByDeliusId(deliusId);

        if (existing) {
            throw Error('Delius staff ID already exists in RO mappings');
        }
    }

    async function checkInvalidNomis(token, nomisId) {
        try {
            const nomisClient = nomisClientBuilder(token);
            await nomisClient.getUserInfo(nomisId);
        } catch (error) {

            if (error.status === 404) {
                throw Error('Nomis ID not found in Nomis');
            }

            throw error;
        }
    }

    return {
        verifyUserDetails,
        addRoUser,
        updateRoUser,
        getRoUsers: userClient.getRoUsers,
        getRoUser: userClient.getRoUser,
        deleteRoUser: userClient.deleteRoUser,
        findRoUsers: userClient.findRoUsers
    };
};
