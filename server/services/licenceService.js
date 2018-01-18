const {
    createLicenceObject,
    createAddressObject,
    createReportingInstructionsObject,
    createConditionsObject,
    createEligibilityObject,
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
            console.error('Error during reset licences', error.stack);
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
                return await populateLicenceWithConditions(formattedLicence, status);
            }

            return {licence: formattedLicence, status};

        } catch (error) {
            console.error('Error during getLicence', error.stack);
            throw error;
        }
    }

    async function createLicence(nomisId, data = {}) {

        const licence = createLicenceObject(data);

        try {
            return await licenceClient.createLicence(nomisId, licence, 'STARTED');
        } catch (error) {
            console.error('Error during createLicence', error.stack);
            throw error;
        }
    }

    async function updateAddress(data = {}) {

        const nomisId = data.nomisId;
        const address = createAddressObject(data);

        try {
            return await licenceClient.updateSection('dischargeAddress', nomisId, address);
        } catch (error) {
            console.error('Error during updateAddress', error.stack);
            throw error;
        }
    }

    async function updateReportingInstructions(data = {}) {

        const nomisId = data.nomisId;
        const instructions = createReportingInstructionsObject(data);

        try {
            return await licenceClient.updateSection('reportingInstructions', nomisId, instructions);
        } catch (error) {
            console.error('Error during updateReportingInstructions', error.stack);
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
            console.error('Error during updateAdditionalConditions', error.stack);
            throw error;
        }
    }

    async function updateEligibility(data = {}) {
        try {
            const nomisId = data.nomisId;
            const eligibilityData = createEligibilityObject(data);

            return await licenceClient.updateSection('eligibility', nomisId, eligibilityData, 'ELIGIBILITY_CHECKED');
        } catch (error) {
            console.error('Error during updateEligibility', error.stack);
            throw error;
        }
    }

    async function sendToOmu(nomisId) {
        try {
            return await licenceClient.updateStatus(nomisId, 'SENT');
        } catch (error) {
            console.error('Error during sendToOmu', error.stack);
            throw error;
        }
    }

    async function sendToPm(nomisId) {
        try {
            return await licenceClient.updateStatus(nomisId, 'CHECK_SENT');
        } catch (error) {
            console.error('Error during sendToPm', error.stack);
            throw error;
        }
    }

    async function getEstablishment(nomisId) {
        try {
            const record = await licenceClient.getLicence(nomisId);

            return await establishmentsClient.findById(record.licence.agencyLocationId);

        } catch (error) {
            console.error('Error during getEstablishment', error.stack);
            throw error;
        }
    }

    async function populateLicenceWithConditions(licence, status) {
        try {
            const conditionIdsSelected = Object.keys(licence.additionalConditions);
            const conditionsSelected = await licenceClient.getAdditionalConditions(conditionIdsSelected);

            return {
                licence: addAdditionalConditionsAsObject(licence, conditionsSelected),
                status
            };
        } catch (error) {
            console.error('Error during populateLicenceWithConditions');
            throw error;
        }
    }

    return {
        reset,
        getLicence,
        createLicence,
        updateAddress,
        updateReportingInstructions,
        updateLicenceConditions,
        updateEligibility,
        sendToOmu,
        sendToPm,
        getEstablishment
    };
};

