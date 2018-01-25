const {
    createLicenceObjectFrom,
    createConditionsObject,
    createInputWithReasonObject,
    addAdditionalConditionsAsObject
} = require('../utils/licenceFactory');
const {formatObjectForView} = require('./utils/formatForView');
const {DATE_FIELD} = require('./utils/conditionsValidator');
const {getIn, isEmpty} = require('../utils/functionalHelpers');
const {licenceModel} = require('../models/models');

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
                return populateLicenceWithConditions(formattedLicence, status);
            }

            return {licence: formattedLicence, status};

        } catch (error) {
            console.error('Error during getLicence', error.stack);
            throw error;
        }
    }

    function createLicence(nomisId, data = {}) {

        const licence = createLicenceObjectFrom({model: licenceModel, inputObject: data});

        return licenceClient.createLicence(nomisId, licence, 'STARTED');
    }

    function updateAddress(data = {}) {

        const nomisId = data.nomisId;
        const address = createLicenceObjectFrom({model: licenceModel.dischargeAddress, inputObject: data});

        return licenceClient.updateSection('dischargeAddress', nomisId, address);
    }

    function updateReportingInstructions(data = {}) {

        const nomisId = data.nomisId;
        const instructions = createLicenceObjectFrom({model: licenceModel.reporting, inputObject: data});

        return licenceClient.updateSection('reportingInstructions', nomisId, instructions);
    }

    async function updateLicenceConditions(data = {}) {
        try {
            const nomisId = data.nomisId;
            const selectedConditions = await licenceClient.getAdditionalConditions(data.additionalConditions);
            const conditions = createConditionsObject(selectedConditions, data);

            return licenceClient.updateSection('additionalConditions', nomisId, conditions);
        } catch (error) {
            console.error('Error during updateAdditionalConditions', error.stack);
            throw error;
        }
    }

    function updateEligibility(data = {}, existingData = {}) {
        const nomisId = data.nomisId;

        const inputObject = createInputWithReasonObject({inputObject: data, model: licenceModel.eligibility});
        const eligibilityData = {...existingData, ...inputObject};

        return licenceClient.updateSection('eligibility', nomisId, eligibilityData, 'ELIGIBILITY_CHECKED');
    }

    function updateOptOut(data = {}) {

        const nomisId = data.nomisId;
        const optOut = createInputWithReasonObject({inputObject: data, model: licenceModel.optOut});

        return licenceClient.updateSection('optOut', nomisId, optOut);
    }

    function updateBassReferral(data = {}) {

        const nomisId = data.nomisId;
        const bassReferral = createInputWithReasonObject({inputObject: data, model: licenceModel.bassReferral});

        return licenceClient.updateSection('bassReferral', nomisId, bassReferral);
    }


    function sendToOmu(nomisId) {
        return licenceClient.updateStatus(nomisId, 'SENT');
    }

    function sendToPm(nomisId) {
        return licenceClient.updateStatus(nomisId, 'CHECK_SENT');
    }

    async function getEstablishment(nomisId) {
        try {
            const record = await licenceClient.getLicence(nomisId);

            return establishmentsClient.findById(record.licence.agencyLocationId);
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
        getEstablishment,
        updateOptOut,
        updateBassReferral
    };
};

