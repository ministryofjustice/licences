const {
    createLicenceObject,
    createAddressObject,
    createReportingInstructionsObject,
    createConditionsObject,
    addAdditionalConditionsAsObject
} = require('../utils/licenceFactory');
const {formatObjectForView} = require('./utils/formatForView');
const {DATE_FIELD} = require('./utils/conditionsValidator');
const {getIn, isEmpty} = require('../utils/functionalHelpers');

module.exports = function createLicenceService(licenceClient, establishmentsClient) {

    async function reset() {

        try {
            await licenceClient.deleteAll();
        } catch (error) {
            console.error(error, 'Error during reset licences');
            throw error;
        }
    }

    async function getLicence(nomisId, {populateConditions = false} = {}) {
        try {
            const rawLicence = await licenceClient.getLicence(nomisId);
            const licence = getIn(rawLicence, ['licence']);
            if(!licence) {
                return null;
            }
            const formattedLicence = formatObjectForView(licence, {dates: [DATE_FIELD]});
            const status = getIn(rawLicence, ['status']);

            if(populateConditions && !isEmpty(formattedLicence.additionalConditions)) {
                return await populateLicenceWithCondtions(formattedLicence, status);
            }

            return {licence: formattedLicence, status};

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

    async function populateLicenceWithCondtions(licence, status) {
        const conditionIdsSelected = Object.keys(licence.additionalConditions);
        const conditionsSelected = await licenceClient.getAdditionalConditions(conditionIdsSelected);

        return {
            licence: addAdditionalConditionsAsObject(licence, conditionsSelected),
            status
        };
    }

    return {
        reset,
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

