const logger = require('../../log.js');
const {
    createLicenceObjectFrom,
    createAdditionalConditionsObject,
    populateAdditionalConditionsAsObject
} = require('../utils/licenceFactory');
const {formatObjectForView} = require('./utils/formatForView');
const {DATE_FIELD} = require('./utils/conditionsValidator');
const {getIn, isEmpty} = require('../utils/functionalHelpers');
const {licenceModel} = require('../models/models');
const {transitions} = require('../models/licenceStages');

module.exports = function createLicenceService(licenceClient) {

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

            const additionalConditions = getIn(formattedLicence, ['licenceConditions', 'additional']);
            const bespokeConditions = getIn(formattedLicence, ['licenceConditions', 'bespoke']) || [];
            const conditionsOnLicence = !isEmpty(additionalConditions) || bespokeConditions.length > 0;
            if (populateConditions && conditionsOnLicence) {
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
        return licenceClient.createLicence(nomisId, licence);
    }

    async function updateLicenceConditions(nomisId, additional = {}, bespoke = []) {
        try {
            const existingLicence = await licenceClient.getLicence(nomisId);
            const existingLicenceConditions = getIn(existingLicence, ['licence', 'licenceConditions']);
            const conditionsObject = await getConditionsObject(additional, bespoke);

            const licenceConditions = {...existingLicenceConditions, ...conditionsObject};
            return licenceClient.updateSection('licenceConditions', nomisId, licenceConditions);
        } catch (error) {
            console.error('Error during updateAdditionalConditions', error.stack);
            throw error;
        }
    }

    async function getConditionsObject(additional, bespoke) {

        if (isEmpty(additional)) {
            return {additional: {}, bespoke};
        }

        const conditionIds = additional.additionalConditions;
        const selectedConditionsConfig = await licenceClient.getAdditionalConditions(conditionIds);
        const additionalConditionsObject = createAdditionalConditionsObject(
            selectedConditionsConfig,
            additional
        );

        return {additional: {...additionalConditionsObject}, bespoke};
    }

    async function deleteLicenceCondition(nomisId, conditionId) {
        try {
            const existingLicence = await licenceClient.getLicence(nomisId);
            const existingLicenceConditions = getIn(existingLicence, ['licence', 'licenceConditions']);

            const newConditions = removeCondition(existingLicenceConditions, conditionId, nomisId);

            if (JSON.stringify(newConditions) === JSON.stringify(existingLicenceConditions)) {
                return;
            }

            return licenceClient.updateSection('licenceConditions', nomisId, newConditions);

        } catch (error) {
            console.error('Error during updateAdditionalConditions', error.stack);
            throw error;
        }
    }

    function removeCondition(oldConditions, idToRemove) {

        if (idToRemove.startsWith('bespoke')) {
            return removeBespokeCondition(oldConditions, idToRemove);
        }

        return removeAdditionalCondition(oldConditions, idToRemove);
    }

    function removeAdditionalCondition(oldConditions, idToRemove) {

        if (!oldConditions.additional[idToRemove]) {
            return oldConditions;
        }

        const {[idToRemove]: conditionToRemove, ...theRest} = oldConditions.additional;
        logger.debug('Deleted condition: ' + conditionToRemove);

        return {...oldConditions, additional: theRest};
    }

    function removeBespokeCondition(oldConditions, idToRemove) {

        const indexToRemove = idToRemove.substr(idToRemove.indexOf('-') + 1);

        if (indexToRemove >= oldConditions.bespoke.length) {
            return oldConditions;
        }

        const elementToRemove = oldConditions.bespoke[indexToRemove];

        const theRest = oldConditions.bespoke.filter(e => e !== elementToRemove);

        return {...oldConditions, bespoke: theRest};
    }

    function markForHandover(nomisId, sender, receiver) {
        const newStatus = getIn(transitions, [sender, receiver]);

        if (!newStatus) {
            throw new Error('Invalid handover pair: ' + sender + '-' + receiver);
        }

        return licenceClient.updateStatus(nomisId, newStatus);
    }

    async function populateLicenceWithConditions(licence, status) {
        try {
            const conditionIdsSelected = Object.keys(getIn(licence, ['licenceConditions', 'additional']));
            const selectedConditionsConfig = await licenceClient.getAdditionalConditions(conditionIdsSelected);

            return {
                licence: populateAdditionalConditionsAsObject(licence, selectedConditionsConfig),
                status
            };
        } catch (error) {
            console.error('Error during populateLicenceWithConditions');
            throw error;
        }
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
        deleteLicenceCondition,
        markForHandover,
        update,
        updateStatus
    };
};
