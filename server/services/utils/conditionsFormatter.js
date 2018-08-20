const moment = require('moment');
const DATE_FIELD = 'appointmentDate';
const ALWAYS_REQUIRED = ['additionalConditions', 'bookingId'];

module.exports = {formatConditionsInput};

function formatConditionsInput(inputObject, selectedConditionsConfig) {

    const conditionsFieldsRequired = selectedConditionsConfig.reduce(getSelectedFieldNamesReducer, []);
    return filterInputs(inputObject, conditionsFieldsRequired);
}

function filterInputs(inputObject, conditionsFieldsRequired) {
    return Object.keys(inputObject)
        .reduce((filteredInput, fieldName) => {

            if (!ALWAYS_REQUIRED.includes(fieldName) && !conditionsFieldsRequired.includes(fieldName)) {
                return filteredInput;
            }

            const fieldInput = inputObject[fieldName];
            if (fieldName === DATE_FIELD) {
                return {...filteredInput, [fieldName]: formatDate(fieldInput)};
            }
            return {...filteredInput, [fieldName]: fieldInput};
        }, {});
}

function getSelectedFieldNamesReducer(array, condition) {

    if (!condition.field_position) {
        return array;
    }
    const inputItems = Object.keys(condition.field_position).map(key => key);
    return [...array, ...inputItems];
}

function formatDate(dateString) {
    return moment(dateString, 'DD-MM-YYYY').format('YYYY-MM-DD');
}
