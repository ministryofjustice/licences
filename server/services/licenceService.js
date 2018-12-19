const moment = require('moment');
const logger = require('../../log.js');
const {createAdditionalConditionsObject} = require('../utils/licenceFactory');
const {formatObjectForView} = require('./utils/formatForView');
const {licenceStages, transitions} = require('../models/licenceStages');
const recordList = require('./utils/recordList');
const {replacePath, mergeWithRight, pick} = require('../utils/functionalHelpers');
const formValidation = require('./utils/formValidation');

const {
    getIn,
    isEmpty,
    notAllValuesEmpty,
    allValuesEmpty,
    equals,
    firstKey,
    removePath,
    removePaths
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

                if (allValuesEmpty(innerAnswers)) {
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

    async function removeDecision(bookingId, rawLicence) {
        const {licence} = rawLicence;
        const updatedLicence = removePath(['approval'], licence);

        await licenceClient.updateLicence(bookingId, updatedLicence);
        return updatedLicence;
    }

    function rejectBass(licence, bookingId, bassRequested, reason) {

        const lastBassReferral = getIn(licence, ['bassReferral']);

        if (!lastBassReferral) {
            return licence;
        }

        const oldRecord = mergeWithRight(lastBassReferral, {rejectionReason: reason});
        const newRecord = {bassRequest: {bassRequested}};

        return deactivateBassEntry(licence, oldRecord, newRecord, bookingId);
    }

    function withdrawBass(licence, bookingId, withdrawal) {
        const lastBassReferral = getIn(licence, ['bassReferral']);

        if (!lastBassReferral) {
            return licence;
        }

        const oldRecord = mergeWithRight(lastBassReferral, {withdrawal});
        const newRecord = {bassRequest: {bassRequested: 'Yes'}};

        return deactivateBassEntry(licence, oldRecord, newRecord, bookingId);
    }

    function deactivateBassEntry(licence, oldRecord, newRecord, bookingId) {

        const bassRejections = recordList({licence, path: ['bassRejections'], allowEmpty: true});
        const licenceWithBassRejections = bassRejections.add({record: oldRecord});

        const updatedLicence = replacePath(['bassReferral'], newRecord, licenceWithBassRejections);

        return licenceClient.updateLicence(bookingId, updatedLicence);
    }

    function reinstateBass(licence, bookingId) {

        const bassRejections = recordList({licence, path: ['bassRejections']});

        const entryToReinstate = removePath(['withdrawal'], bassRejections.last());

        const licenceAfterWithdrawalRemoved = bassRejections.remove();

        const updatedLicence = replacePath(['bassReferral'], entryToReinstate, licenceAfterWithdrawalRemoved);

        return licenceClient.updateLicence(bookingId, updatedLicence);
    }

    async function rejectProposedAddress(licence, bookingId, withdrawalReason) {
        const address = getIn(licence, ['proposedAddress', 'curfewAddress']);
        const addressReview = pick(['curfewAddressReview', 'addressSafety'], getIn(licence, ['curfew']));
        const addressToStore = {address, addressReview, withdrawalReason};

        const addressRejections = recordList({licence, path: ['proposedAddress', 'rejections'], allowEmpty: true});
        const licenceWithAddressRejection = addressRejections.add({record: addressToStore});

        const updatedLicence = removePaths([
            ['proposedAddress', 'curfewAddress'],
            ['curfew', 'addressSafety'],
            ['curfew', 'curfewAddressReview']
        ], licenceWithAddressRejection);

        await licenceClient.updateLicence(bookingId, updatedLicence);
        return updatedLicence;
    }

    function reinstateProposedAddress(licence, bookingId) {
        const addressRejections = recordList({licence, path: ['proposedAddress', 'rejections']});
        const entryToReinstate = addressRejections.last();

        const licenceAfterRemoval = addressRejections.remove();

        const updatedLicence = mergeWithRight(licenceAfterRemoval, {
            proposedAddress: {curfewAddress: entryToReinstate.address},
            curfew: entryToReinstate.addressReview
        });

        return licenceClient.updateLicence(bookingId, updatedLicence);
    }

    function validateFormGroup({licence, stage, decisions = {}, tasks = {}} = {}) {
        const {curfewAddressApproved, bassAreaNotSuitable, bassReferralNeeded} = decisions;
        const newAddressAddedForReview = stage !== 'PROCESSING_RO' && tasks.curfewAddressReview === 'UNSTARTED';
        const newBassAreaAddedForReview = stage !== 'PROCESSING_RO' && tasks.bassAreaCheck === 'UNSTARTED';

        const groupName = () => {
            if (stage === 'PROCESSING_RO') {
                if (curfewAddressApproved === 'rejected') {
                    return 'PROCESSING_RO_ADDRESS_REJECTED';
                }
                if (bassAreaNotSuitable) {
                    return 'BASS_AREA';
                }
                if (bassReferralNeeded) {
                    return 'PROCESSING_RO_BASS_REQUESTED';
                }
            }

            if (bassReferralNeeded && (stage === 'ELIGIBILITY' || newBassAreaAddedForReview)) {
                return 'BASS_REQUEST';
            }

            if (newAddressAddedForReview) {
                return 'ELIGIBILITY';
            }

            return stage;
        };

        return formValidation.validateGroup({licence, group: groupName()});
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
        rejectProposedAddress,
        reinstateProposedAddress,
        validateForm: formValidation.validate,
        validateFormGroup,
        saveApprovedLicenceVersion: licenceClient.saveApprovedLicenceVersion,
        addSplitDateFields,
        removeDecision,
        rejectBass,
        withdrawBass,
        reinstateBass
    };
};
