const {
    createLicenceObjectFrom,
    createConditionsObject,
    createInputWithReasonObject,
    addAdditionalConditionsAsObject
} = require('../utils/licenceFactory');
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
            const status = getIn(rawLicence, ['status']);

            if(populateConditions && !isEmpty(licence.additionalConditions)) {
                return populateLicenceWithConditions(licence, status);
            }

            return {licence, status};

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

    function create({nomisId, fieldMap, userInput, licenceSection, formName}) {
        const newLicence = getUpdatedLicence({licence: {}, fieldMap, userInput, licenceSection, formName});

        return licenceClient.createLicence(nomisId, newLicence, 'STARTED');
    }

    async function update({nomisId, licence, fieldMap, userInput, licenceSection, formName}) {
        const updatedLicence = getUpdatedLicence({licence, fieldMap, userInput, licenceSection, formName});

        await licenceClient.updateLicence(nomisId, updatedLicence);

        return updatedLicence;
    }

    function getUpdatedLicence({licence, fieldMap, userInput, licenceSection, formName}) {

        const answers = fieldMap.reduce((answersAccumulator, field) => {

            const fieldName = Object.keys(field)[0];
            const fieldObject = field[fieldName];
            const dependantOn = userInput[fieldObject.dependantOn];
            const predicateResponse = fieldObject.predicate;

            const dependantMatchesPredicate = fieldObject.dependantOn && dependantOn === predicateResponse;

            if (!dependantOn || dependantMatchesPredicate) {
                return {...answersAccumulator, [fieldName]: userInput[fieldName]};
            }

            return answersAccumulator;

        }, {});

        return {...licence, [licenceSection]: {...licence[licenceSection], [formName]: answers}};
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
        update,
        create
    };
};

