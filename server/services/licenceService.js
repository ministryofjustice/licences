const {createLicenceObject, createAddressObject} = require('../utils/licenceFactory');

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
            return await licenceClient.createLicence(nomisId, licence, 'STARTED');
        } catch(error) {
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

    return {getLicence, createLicence, updateAddress};
};
