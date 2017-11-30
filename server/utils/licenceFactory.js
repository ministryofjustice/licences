module.exports = {
    createLicenceObject,
    createAddressObject,
    createReportingInstructionsObject,
    createConditionsObject,
    addAdditionalConditions
};

function createLicenceObject(object) {

    const acceptedAttributes = Object.keys(licenceModel);

    return filteredToAttributes(object, acceptedAttributes);
}

function createAddressObject(object) {
    const acceptedAttributes = Object.keys(licenceModel.dischargeAddress);

    return filteredToAttributes(object, acceptedAttributes);
}

function createReportingInstructionsObject(object) {
    const acceptedAttributes = Object.keys(licenceModel.reporting);

    return filteredToAttributes(object, acceptedAttributes);
}

const filteredToAttributes = (input, acceptedKeys) => {
    return Object.keys(input).reduce((objectBuilt, key) => {
        if(acceptedKeys.includes(key)) {
            const value = input[key] || '';
            return {...objectBuilt, ...{[key]: value}};
        }
        return objectBuilt;
    }, {});
};

function createConditionsObject(selectedConditions, formInputs) {

    return selectedConditions.reduce((conditions, condition) => {

        const conditionAttributes = condition.FIELD_POSITION.value;
        if (!conditionAttributes) {
            return {...conditions, [condition.ID.value]: {}};
        }

        return {...conditions, [condition.ID.value]: inputsFor(conditionAttributes, formInputs)};

    }, {});
}

function addAdditionalConditions(rawLicence, selectedConditions) {
    const additionalConditions = Object.keys(rawLicence.additionalConditions).map(condition => {

        const selectedCondition = selectedConditions.find(selected => selected.ID.value == condition);
        const userInputName = selectedCondition.USER_INPUT.value;

        if(userInputName) {
            const userInput = rawLicence.additionalConditions[condition];
            return injectUserInputInto(selectedCondition, userInput);
        }

        return selectedCondition.TEXT.value;
    });

    return {...rawLicence, additionalConditions};
}

function injectUserInputInto(condition, userInput) {

    const conditionName = condition.USER_INPUT.value;
    const conditionText = condition.TEXT.value;
    const fieldPositionObject = condition.FIELD_POSITION.value;
    const placeHolders = getPlaceholdersFrom(conditionText);

    if(conditionName === 'appointmentDetails') {
        return injectUserInputAppointment(userInput, conditionText, placeHolders);
    }

    return injectUserInputStandard(userInput, conditionText, placeHolders, fieldPositionObject);
}

function injectUserInputStandard(userInput, conditionText, placeHolders, fieldPositionObject) {

    const fieldNames = Object.keys(fieldPositionObject);

    return placeHolders.reduce((text, placeHolder, index) => {
        const fieldNameForPlaceholder = fieldNames.find(field => fieldPositionObject[field] == index);
        const inputtedData = userInput[fieldNameForPlaceholder];
        return text.replace(placeHolder, inputtedData);
    }, conditionText);
}

function injectUserInputAppointment(userInput, conditionText, placeHolder) {
    const {appointmentAddress, appointmentDate, appointmentTime} = userInput;
    const string = `${appointmentAddress} on ${appointmentDate} at ${appointmentTime}`;
    return conditionText.replace(placeHolder, string);
}

const betweenBrackets = /\[[^\]]*]/g;

function getPlaceholdersFrom(condition) {
    return condition.match(betweenBrackets) || null;
}

const inputsFor = (fieldPositions, formInputs) => {
    const conditionAttributes = Object.keys(fieldPositions);

    return conditionAttributes.reduce((conditionDataObject, formItem) => {
        return {
            ...conditionDataObject,
            [formItem]: formInputs[formItem]
        };
    }, {});
};

// licence structure example
const licenceModel = {
    firstName: '',
    lastName: '',
    nomisId: '',
    establishment: '',
    agencyLocationId: '',
    dischargeDate: '',
    additionalConditions: {},
    dischargeAddress: {
        address1: '',
        address2: '',
        address3: '',
        postCode: ''
    },
    reporting: {
        name: '',
        address1: '',
        address2: '',
        address3: '',
        postCode: '',
        telephone: '',
        date: '',
        hour: '',
        minute: ''
    }
};
