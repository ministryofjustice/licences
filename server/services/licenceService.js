const {
    createLicenceObject,
    createAddressObject,
    createReportingInstructionsObject,
    createConditionsObject,
    addAdditionalConditions
} = require('../utils/licenceFactory');

module.exports = function createLicenceService(licenceClient, establishmentsClient) {

    async function getLicence(nomisId, {populateConditions = false} = {}) {
        try {
            const rawLicence = await licenceClient.getLicence(nomisId);

            const {licence} = rawLicence;

            if(!rawLicence.licence) {
                return null;
            }

            if(populateConditions && licence && licence.additionalConditions && licence.additionalConditions !== {}) {
                const conditionIdsSelected = Object.keys(licence.additionalConditions);
                const conditionsSelected = await licenceClient.getAdditionalConditions(conditionIdsSelected);

                return {
                    licence: addAdditionalConditions(licence, conditionsSelected),
                    status: rawLicence.status};
            }

            return {licence, status: rawLicence.status};

        } catch (error) {
            throw error;
        }
    }

    async function createLicence(nomisId, data = {}) {

        const licence = createLicenceObject(data);

        try {
            return await licenceClient.createLicence(nomisId, licence, 'STARTED');
        } catch (error) {
            console.error(error, 'Error during create licence');
            throw error;
        }
    }

    async function updateAddress(data = {}) {

        const nomisId = data.nomisId;
        const address = createAddressObject(data);

        try {
            return await licenceClient.updateSection('dischargeAddress', nomisId, address);
        } catch (error) {
            console.error(error, 'Error during update address');
            throw error;
        }
    }

    async function updateReportingInstructions(data = {}) {

        const nomisId = data.nomisId;
        const instructions = createReportingInstructionsObject(data);

        try {
            return await licenceClient.updateSection('reportingInstructions', nomisId, instructions);
        } catch (error) {
            console.error(error, 'Error during update reporting instructions');
            throw error;
        }
    }

    async function updateLicenceConditions(data = {}) {
        try {
            const nomisId = data.nomisId;
            const selectedConditions = await licenceClient.getAdditionalConditions(data.additionalConditions);
            const conditions = createConditionsObject(selectedConditions, data);

            return await licenceClient.updateSection('additionalConditions', nomisId, conditions);
        } catch (error) {
            console.error(error, 'Error during update additional conditions');
            throw error;
        }
    }

    async function sendToOmu(nomisId) {
        try {
            return await licenceClient.updateStatus(nomisId, 'SENT');
        } catch (error) {
            console.error(error, 'Error during send licence');
            throw error;
        }
    }

    async function sendToPm(nomisId) {
        try {
            return await licenceClient.updateStatus(nomisId, 'CHECK_SENT');
        } catch (error) {
            console.error(error, 'Error during send licence');
            throw error;
        }
    }

    async function getEstablishment(nomisId) {
        try {
            const record = await licenceClient.getLicence(nomisId);

            return await establishmentsClient.findById(record.licence.agencyLocationId);

        } catch (error) {
            console.error(error, 'Error during send licence');
            throw error;
        }
    }

    return {
        getLicence,
        createLicence,
        updateAddress,
        updateReportingInstructions,
        updateLicenceConditions,
        sendToOmu,
        sendToPm,
        getEstablishment
    };
};
