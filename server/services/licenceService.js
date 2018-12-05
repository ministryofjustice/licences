const moment = require('moment');
const logger = require('../../log.js');
const {createAdditionalConditionsObject} = require('../utils/licenceFactory');
const {formatObjectForView} = require('./utils/formatForView');
const {licenceStages, transitions} = require('../models/licenceStages');
const licenceValidator = require('./utils/licenceValidation');
const recordList = require('./utils/recordList');
const addressesPath = ['proposedAddress', 'curfewAddress', 'addresses'];
const {replacePath} = require('../utils/functionalHelpers');
const formValidation = require('./utils/formValidation');

const {
    getIn,
    isEmpty,
    notAllValuesEmpty,
    allValuesEmpty,
    equals,
    firstKey,
    removePath
} = require('../utils/functionalHelpers');

module.exports = function createLicenceService(licenceClient) {

    async function reset() {
        try {
            await licenceClient.deleteAll();
        } catch (error) {
            logger.error('Error during reset licences', error.stack);
            throw error;
        }
    }

    async function getLicence(bookingId) {
        try {
            const getLicence = licenceClient.getLicence(bookingId);
            const getApprovedVersion = await licenceClient.getApprovedLicenceVersion(bookingId);

            const details = await Promise.all([getLicence, getApprovedVersion]);

            const rawLicence = details[0];
            const versionDetails = details[1];

            const licence = getIn(rawLicence, ['licence']);
            if (!licence) {
                return null;
            }
            const formattedLicence = formatObjectForView(licence);
            const approvedVersionDetails = versionDetails ? formatObjectForView(versionDetails) : undefined;
            const stage = getIn(rawLicence, ['stage']);
            const version = getIn(rawLicence, ['version']);
            const approvedVersion = getIn(approvedVersionDetails, ['version']);

            return {licence: formattedLicence, stage, version, approvedVersion, approvedVersionDetails};

        } catch (error) {
            logger.error('Error during getLicence', error.stack);
            throw error;
        }
    }

    function createLicence(bookingId, data = {}) {
        return licenceClient.createLicence(bookingId, data);
    }

    async function updateLicenceConditions(bookingId, existingLicence, additional = {}, bespoke = []) {
        try {
            const existingLicenceConditions = getIn(existingLicence, ['licence', 'licenceConditions']);
            const conditionsObject = await getConditionsObject(additional, bespoke);

            const licenceConditions = {...existingLicenceConditions, ...conditionsObject};

            if (equals(existingLicenceConditions, licenceConditions)) {
                return;
            }

            await updateModificationStage(bookingId, existingLicence.stage, {requiresApproval: true});

            return licenceClient.updateSection('licenceConditions', bookingId, licenceConditions);
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

    async function deleteLicenceCondition(bookingId, existingLicence, conditionId) {
        try {
            const existingLicenceConditions = getIn(existingLicence, ['licence', 'licenceConditions']);

            const newConditions = removeCondition(existingLicenceConditions, conditionId, bookingId);

            return licenceClient.updateSection('licenceConditions', bookingId, newConditions);

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

    function markForHandover(bookingId, transitionType) {

        const newStage = getIn(transitions, [transitionType]);

        if (!newStage) {
            throw new Error('Invalid handover transition: ' + transitionType);
        }

        return licenceClient.updateStage(bookingId, newStage);
    }

    function updateModificationStage(bookingId, stage, {requiresApproval, noModify}) {

        if (noModify) {
            return;
        }

        if (requiresApproval && (stage === 'DECIDED' || stage === 'MODIFIED')) {
            return licenceClient.updateStage(bookingId, licenceStages.MODIFIED_APPROVAL);
        }

        if (stage === 'DECIDED') {
            return licenceClient.updateStage(bookingId, licenceStages.MODIFIED);
        }

    }

    const getFormResponse = (fieldMap, userInput) => fieldMap.reduce(answersFromMapReducer(userInput), {});

    async function update({bookingId, originalLicence, config, userInput, licenceSection, formName}) {
        const stage = getIn(originalLicence, ['stage']);
        const licence = getIn(originalLicence, ['licence']);

        if (!licence) {
            return null;
        }

        const updatedLicence = getUpdatedLicence({
            licence,
            fieldMap: config.fields,
            userInput,
            licenceSection,
            formName
        });

        if (equals(licence, updatedLicence)) {
            return licence;
        }

        await licenceClient.updateLicence(bookingId, updatedLicence);

        await updateModificationStage(bookingId, stage, {
            requiresApproval: config.modificationRequiresApproval,
            noModify: config.noModify
        });

        return updatedLicence;
    }


    function getUpdatedLicence({licence, fieldMap, userInput, licenceSection, formName}) {

        const answers = getFormResponse(fieldMap, userInput);

        return {...licence, [licenceSection]: {...licence[licenceSection], [formName]: answers}};
    }

    function answersFromMapReducer(userInput) {

        return (answersAccumulator, field) => {

            const {
                fieldName,
                answerIsRequired,
                innerFields,
                inputIsList,
                fieldConfig,
                inputIsSplitDate
            } = getFieldInfo(field, userInput);

            if (!answerIsRequired) {
                return answersAccumulator;
            }

            if (inputIsList) {
                const arrayOfInputs = userInput[fieldName]
                    .map(item => getFormResponse(field[fieldName].contains, item))
                    .filter(notAllValuesEmpty);

                return {...answersAccumulator, [fieldName]: arrayOfInputs};
            }

            if (!isEmpty(innerFields)) {

                const innerFieldMap = field[fieldName].contains;
                const innerAnswers = getFormResponse(innerFieldMap, userInput[fieldName]);

                if (!fieldConfig.saveEmpty && allValuesEmpty(innerAnswers)) {
                    return answersAccumulator;
                }

                return {...answersAccumulator, [fieldName]: innerAnswers};
            }

            if (inputIsSplitDate) {
                return {...answersAccumulator, [fieldName]: getCombinedDate(field[fieldName], userInput)};
            }

            return {...answersAccumulator, [fieldName]: userInput[fieldName]};
        };
    }

    function getCombinedDate(dateConfig, userInput) {
        const {day, month, year} = dateConfig.splitDate;

        return `${userInput[[day]]}/${userInput[[month]]}/${userInput[[year]]}`;
    }

    function addSplitDateFields(rawData, formFieldsConfig) {
        return formFieldsConfig.reduce((data, field) => {

            const fieldKey = firstKey(field);
            const fieldConfig = field[fieldKey];
            const splitDateConfig = getIn(fieldConfig, ['splitDate']);

            if (!rawData[fieldKey] || !splitDateConfig) {
                return data;
            }

            const date = moment(rawData[fieldKey], 'DD/MM/YYYY');
            if (!date.isValid()) {
                return data;
            }

            return {
                ...data,
                [splitDateConfig.day]: date.format('DD'),
                [splitDateConfig.month]: date.format('MM'),
                [splitDateConfig.year]: date.format('YYYY')
            };

        }, rawData);
    }

    function getFieldInfo(field, userInput) {
        const fieldName = Object.keys(field)[0];
        const fieldConfig = field[fieldName];

        const fieldDependentOn = userInput[fieldConfig.dependentOn];
        const predicateResponse = fieldConfig.predicate;
        const dependentMatchesPredicate = fieldConfig.dependentOn && fieldDependentOn === predicateResponse;
        const inputIsSplitDate = fieldConfig.splitDate;

        return {
            fieldName,
            answerIsRequired: !fieldDependentOn || dependentMatchesPredicate,
            innerFields: field[fieldName].contains,
            inputIsList: fieldConfig.isList,
            fieldConfig,
            inputIsSplitDate
        };
    }

    const updateAddress = updateAddressArray(edit);
    const addAddress = updateAddressArray(add);

    function updateAddressArray(addressesUpdateMethod) {
        return async ({bookingId, rawLicence, fieldMap, userInput, index}) => {
            const {stage, licence} = rawLicence;
            const formResponse = getFormResponse(fieldMap, userInput);

            const newAddress = Array.isArray(formResponse.addresses) ? formResponse.addresses[0] : formResponse;
            const addressList = recordList({licence, path: addressesPath});
            const updatedLicence = addressesUpdateMethod({addressList, licence, newAddress, index});

            if (equals(licence, updatedLicence)) {
                return licence;
            }

            await updateModificationStage(bookingId, stage, {requiresApproval: false});

            await licenceClient.updateLicence(bookingId, updatedLicence);

            return updatedLicence;
        };
    }

    function edit({addressList, licence, index, newAddress}) {
        if (!newAddress) {
            return addressList.remove({index});
        }

        return addressList.edit({index, record: newAddress});
    }

    function add({addressList, licence, newAddress}) {
        return addressList.add({record: newAddress});
    }


    async function removeDecision(bookingId, rawLicence) {
        const {licence} = rawLicence;
        const updatedLicence = removePath(['approval'], licence);

        await licenceClient.updateLicence(bookingId, updatedLicence);
        return updatedLicence;
    }

    function rejectBass(licence, bookingId, bassRequested) {

        const lastBassReferral = getIn(licence, ['bassReferral']);

        if (!lastBassReferral) {
            return licence;
        }

        const bassRejections = recordList({licence, path: ['bassRejections'], allowEmpty: true});
        const licenceWithBassRejections = bassRejections.add({record: lastBassReferral});

        const updatedLicence = replacePath(['bassReferral'], {bassRequest: {bassRequested}}, licenceWithBassRejections);

        return licenceClient.updateLicence(bookingId, updatedLicence);
    }


    return {
        reset,
        getLicence,
        createLicence,
        updateLicenceConditions,
        deleteLicenceCondition,
        markForHandover,
        update,
        updateSection: licenceClient.updateSection,
        updateAddress,
        addAddress,
        getLicenceErrors: licenceValidator.getLicenceErrors,
        getConditionsErrors: licenceValidator.getConditionsErrors,
        getEligibilityErrors: licenceValidator.getEligibilityErrors,
        getValidationErrorsForReview: licenceValidator.getValidationErrorsForReview,
        validateForm: formValidation.validate,
        saveApprovedLicenceVersion: licenceClient.saveApprovedLicenceVersion,
        addSplitDateFields,
        removeDecision,
        rejectBass
    };
};
