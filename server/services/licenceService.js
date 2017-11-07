const {
    createLicenceObject,
    createAddressObject,
    createReportingInstructionsObject
} = require('../utils/licenceFactory');

module.exports = function createLicenceService(licenceClient, establishmentsClient) {

    async function getLicence(nomisId) {
        try {
            return await licenceClient.getLicence(nomisId);
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
        sendToOmu,
        sendToPm,
        getEstablishment
    };
};
