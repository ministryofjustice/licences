const validator = require('validator');
module.exports = {validate};

function validate(inputObject, conditionsSelected) {

    const missing = requiredInputMissing(inputObject, conditionsSelected);
    if (missing.length > 0) {
        return {
            validates: false,
            missing
        };
    }

    return {
        validates: true
    };
}

function requiredInputMissing(inputObject, conditionsSelected) {
    return conditionsSelected.reduce((array, condition) => {
        const inputItems = Object.keys(condition.FIELD_POSITION.value).map(key => key);
        return [...array, ...inputItems];

    }, []).filter(field => {
        return !inputObject[field] || validator.isEmpty(inputObject[field]);
    });
}
