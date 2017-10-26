const {
    createLicenceObject,
    createAddressObject,
    createReportingInstructionsObject
} = require('../utils/licenceFactory');

module.exports = function createLicenceService(licenceClient) {
    async function getLicence(nomisId) {
        try {
            return await licenceClient.getLicence(nomisId);
        } catch(error) {
            throw error;
        }
    }

    async function createLicence(nomisId, data = {}) {

        const licence = createLicenceObject(data);

        try {
            return await licenceClient.createLicence(nomisId, licence);
        } catch(error) {
            console.error(error, 'Error during create licence');
            throw error;
        }
    }

    async function updateAddress(data = {}) {

        const nomisId = data.nomisId;
        const address = createAddressObject(data);

        try {
            return await licenceClient.updateSection('dischargeAddress', nomisId, address);
        } catch(error) {
            console.error(error, 'Error during update address');
            throw error;
        }
    }

    async function updateReportingInstructions(data = {}) {

        const nomisId = data.nomisId;
        const instructions = createReportingInstructionsObject(data);

        try {
            return await licenceClient.updateSection('reportingInstructions', nomisId, instructions);
        } catch(error) {
            console.error(error, 'Error during update reporting instructions');
            throw error;
        }
    }

    return {getLicence, createLicence, updateAddress, updateReportingInstructions};
};
