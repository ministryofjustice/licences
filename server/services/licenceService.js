const logger = require('../../log.js');
const {
    createLicenceObjectFrom,
    createAdditionalConditionsObject
} = require('../utils/licenceFactory');
const {formatObjectForView} = require('./utils/formatForView');
const {DATE_FIELD} = require('./utils/conditionsValidator');
const {
    getIn,
    isEmpty,
    notAllValuesEmpty,
    allValuesEmpty,
    getFirstArrayItems,
    replaceArrayItem,
    flatten
} = require('../utils/functionalHelpers');
const {licenceModel} = require('../models/models');
const {transitions} = require('../models/licenceStages');
const {getLicenceStatus} = require('../utils/licenceStatus');
const {licenceStages} = require('../models/licenceStages');
const validate = require('./utils/licenceValidation');

module.exports = function createLicenceService(licenceClient) {

    async function reset() {
        try {
            await licenceClient.deleteAll();
        } catch (error) {
            logger.error('Error during reset licences', error.stack);
            throw error;
        }
    }

    async function getLicence(nomisId) {
        try {
            const rawLicence = await licenceClient.getLicence(nomisId);
            const licence = getIn(rawLicence, ['licence']);
            if (!licence) {
                return null;
            }
            const formattedLicence = formatObjectForView(licence, {dates: [DATE_FIELD]});
            const stage = getIn(rawLicence, ['stage']);

            return {licence: formattedLicence, stage};

        } catch (error) {
            logger.error('Error during getLicence', error.stack);
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
            logger.error('Error during updateAdditionalConditions', error.stack);
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

            return licenceClient.updateSection('licenceConditions', nomisId, newConditions);

        } catch (error) {
            logger.error('Error during updateAdditionalConditions', error.stack);
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

    function markForHandover(nomisId, sender, receiver, licence) {

        const newStage = getNewStage(sender, receiver, licence);

        if (!newStage) {
            throw new Error('Invalid handover pair: ' + sender + '-' + receiver);
        }

        return licenceClient.updateStage(nomisId, newStage);
    }

    function getNewStage(sender, receiver, licence) {
        const stage = getIn(transitions, [sender, receiver]);

        if(sender === 'RO') {
            const {decisions} = getLicenceStatus(licence);
            if (decisions.optedOut) {
                return stage.optedOut;
            }
            if (decisions.curfewAddressApproved === 'rejected') {
                return stage.addressRejected;
            }
            return stage.default;
        }

        return stage;
    }


    async function update({nomisId, licence, fieldMap, userInput, licenceSection, formName}) {
        const updatedLicence = getUpdatedLicence({licence, fieldMap, userInput, licenceSection, formName});

        await licenceClient.updateLicence(nomisId, updatedLicence);

        return updatedLicence;
    }

    function getUpdatedLicence({licence, fieldMap, userInput, licenceSection, formName}) {

        const answers = fieldMap.reduce(answersFromMapReducer(userInput), {});

        return {...licence, [licenceSection]: {...licence[licenceSection], [formName]: answers}};
    }

    function answersFromMapReducer(userInput) {

        return (answersAccumulator, field) => {
            const {fieldName, answerIsRequired, innerFields, inputIsList, fieldConfig} = getFieldInfo(field, userInput);

            if (!answerIsRequired) {
                return answersAccumulator;
            }

            if (inputIsList) {
                const input = getLimitedInput(fieldConfig, fieldName, userInput);
                const arrayOfInputs = input
                    .map(item => field[fieldName].contains.reduce(answersFromMapReducer(item), {}))
                    .filter(notAllValuesEmpty);

                return {...answersAccumulator, [fieldName]: arrayOfInputs};
            }

            if (!isEmpty(innerFields)) {
                const innerFieldMap = field[fieldName].contains;
                const innerAnswers = innerFieldMap.reduce(answersFromMapReducer(userInput[fieldName]), {});

                if(allValuesEmpty(innerAnswers)) {
                    return answersAccumulator;
                }

                return {...answersAccumulator, [fieldName]: innerAnswers};
            }

            return {...answersAccumulator, [fieldName]: userInput[fieldName]};
        };
    }

    function getFieldInfo(field, userInput) {
        const fieldName = Object.keys(field)[0];
        const fieldConfig = field[fieldName];
        const fieldDependentOn = userInput[fieldConfig.dependentOn];
        const predicateResponse = fieldConfig.predicate;
        const dependentMatchesPredicate = fieldConfig.dependentOn && fieldDependentOn === predicateResponse;

        return {
            fieldName,
            answerIsRequired: !fieldDependentOn || dependentMatchesPredicate,
            innerFields: field[fieldName].contains,
            inputIsList: fieldConfig.isList,
            fieldConfig
        };
    }

    function getLimitedInput(fieldConfig, fieldName, userInput) {
        const limitingField = getIn(fieldConfig, ['limitedBy', 'field']);
        const limitingValue = userInput[limitingField];
        const limitTo = getIn(fieldConfig, ['limitedBy', limitingValue]);

        if(limitTo) {
            return getFirstArrayItems(userInput[fieldName], limitTo);
        }

        return userInput[fieldName];
    }

    function updateStage(nomisId, status) {
        return licenceClient.updateStage(nomisId, status);
    }

    async function updateAddress({index, nomisId, licence, fieldMap, userInput}) {

        const updatedLicence = updateAddressInLicence(licence, fieldMap, userInput, index);

        await licenceClient.updateLicence(nomisId, updatedLicence);

        return updatedLicence;
    }

    function updateAddressInLicence(licence, fieldMap, userInput, addressIndex) {
        const answers = fieldMap.reduce(answersFromMapReducer(userInput), {});
        const addresses = getIn(licence, ['proposedAddress', 'curfewAddress', 'addresses']);

        const newAddresses = getNewAddressesArray(addresses, addressIndex, answers);

        return {
            ...licence,
            proposedAddress: {
                ...licence.proposedAddress,
                curfewAddress: {
                    ...licence.proposedAddress.curfewAddress,
                    addresses: newAddresses
                }
            }
        };
    }

    function getNewAddressesArray(addresses, index, answers) {
        if(!addresses[index]) {
            return [...addresses, ...answers.addresses];
        }

        const newAddressObject = {...addresses[index], ...answers};
        return replaceArrayItem(addresses, index, newAddressObject);
    }

    function validateLicence(licence, stage) {

        const sections = getLicenceSectionToValidate(stage);
        const validationErrors = sections.map(validate(licence)).filter(item => item);

        if (isEmpty(validationErrors)) {
            return null;
        }

        const errors = validationErrors.map(error => {
            return error.details.map(key => {
                const {path, message, type} = key;
                return {path, message, type};
            });
        });
        return flatten(errors);
    }

    return {
        reset,
        getLicence,
        createLicence,
        updateLicenceConditions,
        deleteLicenceCondition,
        markForHandover,
        update,
        updateStage,
        updateAddress,
        validateLicence
    };
};

function getLicenceSectionToValidate(stage) {
    switch (stage) {
        case licenceStages.ELIGIBILITY:
            return ['eligibility', 'proposedAddress'];
        case licenceStages.PROCESSING_RO:
            // TODO
            return ['eligibility', 'proposedAddress'];
        case licenceStages.PROCESSING_CA:
            // TODO
            return ['eligibility', 'proposedAddress'];
        case licenceStages.APPROVAL:
            // TODO
            return ['eligibility', 'proposedAddress'];
        default:
            return null;
    }
}
