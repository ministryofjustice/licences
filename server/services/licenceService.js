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
    replaceArrayItem} = require('../utils/functionalHelpers');
const {licenceModel} = require('../models/models');
const {transitions} = require('../models/licenceStages');
const {getLicenceStatus} = require('../utils/licenceStatus');

module.exports = function createLicenceService(licenceClient) {

    async function reset() {
        try {
            await licenceClient.deleteAll();
        } catch (error) {
            console.error('Error during reset licences', error.stack);
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
            const status = getIn(rawLicence, ['status']);

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

        const newStatus = getNewStatus(sender, receiver, licence);

        if (!newStatus) {
            throw new Error('Invalid handover pair: ' + sender + '-' + receiver);
        }

        return licenceClient.updateStatus(nomisId, newStatus);
    }

    function getNewStatus(sender, receiver, licence) {
        const status = getIn(transitions, [sender, receiver]);

        if(sender === 'RO') {
            const {decisions} = getLicenceStatus(licence);
            if (decisions.curfewAddressApproved === 'rejected') {
                return status.addressRejected;
            }
            return status.default;

        }

        return status;
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

    function updateStatus(nomisId, status) {
        return licenceClient.updateStatus(nomisId, status);
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

    async function updateAddresses({nomisId, userInput, licence, fieldMap}) {

        let addresses = getIn(licence, ['proposedAddress', 'curfewAddress', 'addresses']);
        const newAddresses = userInput.addresses.reduce(replaceAddressObjectReducer(fieldMap, addresses), addresses);

        const newLicence = replaceAddressesInLicence(newAddresses, licence);
        await licenceClient.updateLicence(nomisId, newLicence);

        return newLicence;
    }

    function replaceAddressObjectReducer(fieldMap, addresses) {
        return (newAddresses, address) => {
            const originalAddress = addresses[address.addressIndex];
            const newFields = fieldMap.reduce(answersFromMapReducer(address), {});

            const newAddressObject = {...originalAddress, ...newFields};
            return replaceArrayItem(newAddresses, address.addressIndex, newAddressObject);
        };
    }

    async function promoteAlternativeAddress({nomisId, licence}) {
        const oldAddresses = getIn(licence, ['proposedAddress', 'curfewAddress', 'addresses']);

        const newAddresses = oldAddresses.map(address => {
            if(address.alternative) {
                address.alternative = '';
                return address;
            }
            return address;
        });

        const newLicence = replaceAddressesInLicence(newAddresses, licence);
        await licenceClient.updateLicence(nomisId, newLicence);

        return newLicence;
    }

    async function removeAlternativeAddress({nomisId, licence}) {
        const oldAddresses = getIn(licence, ['proposedAddress', 'curfewAddress', 'addresses']);

        const newAddresses = oldAddresses.reduce((newArray, address) => {
            if(address.alternative) {
                return newArray;
            }
            return [...newArray, address];
        }, []);

        const newLicence = replaceAddressesInLicence(newAddresses, licence);
        await licenceClient.updateLicence(nomisId, newLicence);

        return newLicence;
    }

    function replaceAddressesInLicence(newAddresses, licence) {
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

    return {
        reset,
        getLicence,
        createLicence,
        updateLicenceConditions,
        deleteLicenceCondition,
        markForHandover,
        update,
        updateStatus,
        updateAddress,
        updateAddresses,
        promoteAlternativeAddress,
        removeAlternativeAddress
    };
};
