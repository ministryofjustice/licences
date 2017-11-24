const validator = require('validator');
module.exports = {validate};
const {isEmpty} = require('../../utils/functionalHelpers');

function validate(inputObject, conditionsSelected) {

    const fieldsRequired = conditionsSelected.reduce(getSelectedFieldNamesReducer, []);
    const fieldsInput = filterInputs(inputObject, fieldsRequired);
    const errors = getErrorObjects(inputObject, fieldsRequired);

    return {
        validates: isEmpty(errors),
        errors,
        ...fieldsInput
    };
}

function getErrorObjects(inputObject, fieldsRequired) {
    const missingFields = fieldsRequired.filter(fieldHasInput(inputObject));

    return fieldsRequired.reduce((errorObject, field) => {
        if(missingFields.includes(field)) {
            return {...errorObject, [field]: ['missing']};
        }
        return errorObject;
    }, {});
}

function filterInputs(inputObject, fieldsRequired) {
    return Object.keys(inputObject)
        .reduce((filteredInput, inputKey) => {
            if(inputKey => fieldsRequired.includes(inputKey)) {
                return {...filteredInput, [inputKey]: inputObject[inputKey]};
            }
            return filteredInput;
        }, {});
}

function getSelectedFieldNamesReducer(array, condition) {

    if(!condition.FIELD_POSITION.value) {
        return array;
    }
    const inputItems = Object.keys(condition.FIELD_POSITION.value).map(key => key);
    return [...array, ...inputItems];
}

function fieldHasInput(inputObject) {
    return field => !inputObject[field] || validator.isEmpty(inputObject[field]);
}
