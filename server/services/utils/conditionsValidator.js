const validator = require('validator');
const {isEmpty} = require('../../utils/functionalHelpers');
const moment = require('moment');
const DATE_FIELD = 'appointmentDate';
const ALWAYS_REQUIRED = ['additionalConditions', 'nomisId'];

module.exports = {validate, DATE_FIELD};

function validate(inputObject, selectedConditionsConfig) {

    const conditionsFieldsRequired = selectedConditionsConfig.reduce(getSelectedFieldNamesReducer, []);
    const fieldsInput = filterInputs(inputObject, conditionsFieldsRequired);
    const errors = getErrorObjects(fieldsInput, conditionsFieldsRequired);

    return {
        validates: isEmpty(errors),
        errors,
        ...fieldsInput
    };
}

function filterInputs(inputObject, conditionsFieldsRequired) {
    return Object.keys(inputObject)
        .reduce((filteredInput, fieldName) => {

            if(!ALWAYS_REQUIRED.includes(fieldName) && !conditionsFieldsRequired.includes(fieldName)) {
                return filteredInput;
            }

            const fieldInput = inputObject[fieldName];
            if (fieldName === DATE_FIELD) {
                return {...filteredInput, [fieldName]: formatDate(fieldInput)};
            }
            return {...filteredInput, [fieldName]: fieldInput};
        }, {});
}

function getErrorObjects(inputObject, conditionsFieldsRequired) {

    return conditionsFieldsRequired.reduce((errorObject, field) => {
        if(field === DATE_FIELD) {
            return errorObjectWithCheckedDate(inputObject[field], field, errorObject);
        }
        return errorObjectWithCheckedString(inputObject[field], field, errorObject);
    }, {});
}

function errorObjectWithCheckedDate(input, fieldName, errorObject) {
    if (input !== 'Invalid date') {
        return errorObject;
    }
    return {...errorObject, [fieldName]: ['INVALID_DATE']};
}

function errorObjectWithCheckedString(input, fieldName, errorObject) {
    if(fieldHasNoInput(input) && !moment.isMoment(input)) {
        return {...errorObject, [fieldName]: ['MISSING_INPUT']};
    }
    return errorObject;
}

function getSelectedFieldNamesReducer(array, condition) {

    if(!condition.FIELD_POSITION.value) {
        return array;
    }
    const inputItems = Object.keys(condition.FIELD_POSITION.value).map(key => key);
    return [...array, ...inputItems];
}

function fieldHasNoInput(input) {
    return !input || validator.isEmpty(input);
}

function formatDate(dateString) {
    return moment(dateString, 'DD-MM-YYYY').format('YYYY-MM-DD');
}
