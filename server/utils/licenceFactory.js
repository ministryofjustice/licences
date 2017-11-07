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

        const conditionAttributes = formObjects.get(condition.USER_INPUT.value);
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
            const fieldNames = formObjects.get(userInputName);
            const userInput = rawLicence.additionalConditions[condition];

            return injectUserInputInto(selectedCondition, fieldNames, userInput);
        }

        return selectedCondition.TEXT.value;
    });

    return {...rawLicence, additionalConditions};
}

function injectUserInputInto(condition, fieldNames, userInput) {

    const conditionText = condition.TEXT.value;
    const placeHolders = getPlaceholdersFrom(conditionText);

    return placeHolders.reduce((text, placeHolder, index) => {

        const inputtedData = userInput[fieldNames[index]];
        return text.replace(placeHolder, inputtedData);

    }, conditionText);
}

const betweenBrackets = /\[[^\]]*]/g;

function getPlaceholdersFrom(condition) {
    return condition.match(betweenBrackets) || null;
}

const inputsFor = (conditionAttributes, formInputs) => {

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
        time: ''
    }
};

// form items for condition
const formObjects = new Map([
    ['appointmentName', ['appointmentName']],
    ['mentalHealthName', ['mentalHealthName']],
    ['appointmentDetails', ['appointmentDate', 'appointmentTime']],
    ['victimDetails', ['victimFamilyMembers', 'socialServicesDept']],
    ['noUnsupervisedContact', ['unsupervisedContactGender', 'unsupervisedContactAge', 'unsupervisedContactSocial']],
    ['noContactOffenders', ['noContactOffenders']],
    ['groupsOrOrganisations', ['groupsOrOrganisation']],
    ['courseOrCentre', ['courseOrCentre']],
    ['noWorkWithAge', ['noWorkWithAge']],
    ['noSpecificItems', ['noSpecificItems']],
    ['noCurrencyQuantity', ['cashQuantity']],
    ['vehicleDetails', ['vehicleDetails']],
    ['intimateGender', ['intimateGender']],
    ['confinedDetails', ['confinedTo', 'confinedFrom', 'confinedReviewFrequency']],
    ['curfewDetails', ['curfewAddress', 'curfewFrom', 'curfewTo', 'curfewTagRequired']],
    ['exclusionArea', ['exclusionArea']],
    ['noEnterPlace', ['noEnterPlace']],
    ['notInSightOf', ['notInSightOf']],
    ['reportingDetails', ['reportingAddress', 'reportingTime', 'reportingDaily', 'reportingFrequency']],
    ['alcoholLimit', ['alcoholLimit']]
]);
