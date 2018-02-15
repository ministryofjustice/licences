const {validate, DATE_FIELD} = require('./utils/conditionsValidator');
const {getIntersection, flatten} = require('../utils/functionalHelpers');
const moment = require('moment');
const logger = require('../../log.js');
const {getIn} = require('../utils/functionalHelpers');

module.exports = function createConditionsService(licenceClient) {

    function getStandardConditions() {
        return licenceClient.getStandardConditions();
    }

    async function getAdditionalConditions(licence = null) {
        try {
            const conditions = await licenceClient.getAdditionalConditions();
            const additionalConditions = getIn(licence, ['licenceConditions', 'additional']);

            if (additionalConditions) {

                return conditions
                    .map(populateFromSavedLicence(additionalConditions))
                    .reduce(splitIntoGroupedObject, {});
            }

            return conditions.reduce(splitIntoGroupedObject, {});
        } catch(error) {
            logger.error('Error during getStandardConditions', error.stack);
            throw error;
        }
    }

    async function validateConditionInputs(requestBody) {
        const selectedConditionsConfig = await licenceClient.getAdditionalConditions(requestBody.additionalConditions);

        return validate(requestBody, selectedConditionsConfig);
    }

    async function getAdditionalConditionsWithErrors(validatedInput) {
        try {
            const conditions = await licenceClient.getAdditionalConditions();

            return conditions
                .map(populateFromFormSubmission(validatedInput))
                .reduce(splitIntoGroupedObject, {});

        } catch(error) {
            logger.error('Error during getAdditionalConditionsWithErrors', error.stack);
            throw error;
        }
    }

    return {
        getStandardConditions,
        getAdditionalConditions,
        validateConditionInputs,
        getAdditionalConditionsWithErrors
    };
};

function splitIntoGroupedObject(conditionObject, condition) {
    const groupName = condition.GROUP_NAME.value || 'base';
    const subgroupName = condition.SUBGROUP_NAME.value || 'base';

    const group = conditionObject[groupName] || {};
    const subgroup = group[subgroupName] || [];

    const newSubgroup = [...subgroup, condition];
    const newGroup = {...group, [subgroupName]: newSubgroup};

    return {...conditionObject, [groupName]: newGroup};
}

function populateFromSavedLicence(inputtedConditions) {
    const populatedConditionIds = Object.keys(inputtedConditions);

    return condition => {
        const submission = inputtedConditions[condition.ID.value] || {};
        const selected = populatedConditionIds.includes(String(condition.ID.value));

        return {...condition, SELECTED: selected, USER_SUBMISSION: submission};
    };
}

function populateFromFormSubmission(validatedInput) {
    return condition => {

        if(!conditionSelected(validatedInput, condition)) {
            return {...condition};
        }

        if(!conditionHasInputFields(condition, validatedInput)) {
            return {...condition, SELECTED: true};
        }

        const conditionFieldKeys = Object.keys(condition.FIELD_POSITION.value);
        const userInputsForCondition = getUserInputsForCondition(validatedInput, conditionFieldKeys);
        const validationErrors = getValidationErrors(validatedInput, conditionFieldKeys);

        return {
            ...condition,
            SELECTED: true,
            USER_SUBMISSION: userInputsForCondition,
            ERRORS: validationErrors
        };
    };
}

function conditionSelected(input, condition) {
    const selectedConditions = input.additionalConditions;
    return selectedConditions.includes(String(condition.ID.value));
}

function conditionHasInputFields(condition) {
    return !!condition.FIELD_POSITION.value;
}

function getUserInputsForCondition(input, conditionInputFields) {
    return Object.keys(input)
        .filter(formInputFieldKey => conditionInputFields.includes(formInputFieldKey))
        .reduce((object, formInputFieldKey) => {
            if(formInputFieldKey === DATE_FIELD) {
                return {...object, [formInputFieldKey]: formatDateField(input[formInputFieldKey])};
            }
            return {...object, [formInputFieldKey]: input[formInputFieldKey]};
        }, {});
}

function getValidationErrors(validationObject, conditionFieldKeys) {
    const fieldsWithErrors = Object.keys(validationObject.errors);
    const conditionFieldsWithErrors = getIntersection(fieldsWithErrors, conditionFieldKeys);

    if(conditionFieldsWithErrors.length === 0) {
        return null;
    }

    return flatten(conditionFieldsWithErrors.map(field => {
        return validationObject.errors[field];
    }));
}

function formatDateField(input) {
    if(moment(input).isValid()) {
        return moment(input).format('DD/MM/YYYY');
    }
    return '';
}
