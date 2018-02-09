const {
    createLicenceObjectFrom,
    createConditionsObject,
    addAdditionalConditionsAsObject
} = require('../utils/licenceFactory');
const {formatObjectForView} = require('./utils/formatForView');
const {DATE_FIELD} = require('./utils/conditionsValidator');
const {getIn, isEmpty} = require('../utils/functionalHelpers');
const {licenceModel} = require('../models/models');
const licenceStates = require('../data/licenceStates');

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
            if (!licence) {
                return null;
            }
            const formattedLicence = formatObjectForView(licence, {dates: [DATE_FIELD]});
            const status = getIn(rawLicence, ['status']);

            if (populateConditions && !isEmpty(formattedLicence.additionalConditions)) {
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

    function markForHandover(nomisId, sender, receiver) {
        if(!licenceStates[sender] || !licenceStates[sender][receiver]) {
            throw new Error('Invalid handover pair: ' + sender + '-' + receiver);
        }

        const newStatus = licenceStates[sender][receiver];
        return licenceClient.updateStatus(nomisId, newStatus);
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

    async function update({nomisId, licence, fieldMap, userInput, licenceSection, formName, status}) {
        const updatedLicence = getUpdatedLicence({licence, fieldMap, userInput, licenceSection, formName});

        await licenceClient.updateLicence(nomisId, updatedLicence);

        return updatedLicence;
    }

    function getUpdatedLicence({licence, fieldMap, userInput, licenceSection, formName}) {

        const answers = fieldMap.reduce((answersAccumulator, field) => {

            const fieldName = Object.keys(field)[0];
            const fieldObject = field[fieldName];
            const dependentOn = userInput[fieldObject.dependentOn];
            const predicateResponse = fieldObject.predicate;

            const dependentMatchesPredicate = fieldObject.dependentOn && dependentOn === predicateResponse;

            if (!dependentOn || dependentMatchesPredicate) {
                return {...answersAccumulator, [fieldName]: userInput[fieldName]};
            }

            return answersAccumulator;

        }, {});

        return {...licence, [licenceSection]: {...licence[licenceSection], [formName]: answers}};
    }

    function updateStatus(nomisId, status) {
        return licenceClient.updateStatus(nomisId, status);
    }

    return {
        reset,
        getLicence,
        createLicence,
        updateLicenceConditions,
        markForHandover,
        update,
        updateStatus
    };
};

