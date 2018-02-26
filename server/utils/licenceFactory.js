const {conditionsOrder} = require('../models/conditions');

module.exports = {
    createLicenceObjectFrom,
    createAdditionalConditionsObject,
    populateAdditionalConditionsAsObject,
    populateAdditionalConditionsAsString,
    createInputWithReasonObject
};

function createLicenceObjectFrom({model, inputObject}) {
    const acceptedAttributes = Object.keys(model);

    return filteredToAttributes(inputObject, acceptedAttributes);
}

const filteredToAttributes = (input, acceptedKeys, notAcceptedKeys = []) => {
    return Object.keys(input).reduce((objectBuilt, key) => {
        if (acceptedKeys.includes(key)) {
            const value = input[key] || '';
            return {...objectBuilt, ...{[key]: value}};
        }
        if(notAcceptedKeys.includes(key)) {
            return {...objectBuilt, ...{[key]: null}};
        }
        return objectBuilt;
    }, {});
};

function createAdditionalConditionsObject(selectedConditions, formInputs) {
    return selectedConditions.reduce((conditions, condition) => {
        const conditionAttributes = condition.FIELD_POSITION.value;
        const userInputs = conditionAttributes ? inputsFor(conditionAttributes, formInputs) : {};

        return {
            ...conditions,
            [condition.ID.value]: {
                ...userInputs
            }
        };
    }, {});
}

function createInputWithReasonObject({model, inputObject}) {
    const acceptedSelectors = Object.keys(model);
    const reducer = addReasonIfSelected(inputObject, model);
    const {accepted, notAccepted} = acceptedSelectors.reduce(reducer, {accepted: [], notAccepted: []});

    return filteredToAttributes(inputObject, accepted, notAccepted);
}

function addReasonIfSelected(formInput, licenceSection) {
    return (attributes, selector) => {

        const accepted = formInput[selector] === 'Yes' ?
            [...attributes.accepted, selector, licenceSection[selector].reason] :
            [...attributes.accepted, selector];

        const notAccepted = formInput[selector] === 'No' ?
            [...attributes.notAccepted, licenceSection[selector].reason] :
            attributes.notAccepted;

        return {accepted, notAccepted};
    };
}

// For html page
function populateAdditionalConditionsAsObject(rawLicence, selectedConditionsConfig) {
    return addAdditionalConditions(rawLicence, selectedConditionsConfig, injectUserInputAsObject);
}

function addAdditionalConditions(rawLicence, selectedConditionsConfig, injectUserInputMethod) {
    const {additional, bespoke} = rawLicence.licenceConditions;

    const getObjectForAdditional = createAdditionalMethod(rawLicence, selectedConditionsConfig, injectUserInputMethod);
    const populatedAdditional = Object.keys(additional)
        .sort(orderForView)
        .map(getObjectForAdditional);
    const populatedBespoke = bespoke.map(getObjectForBespoke);

    return {...rawLicence, licenceConditions: [...populatedAdditional, ...populatedBespoke]};
}

function createAdditionalMethod(rawLicence, selectedConditions, injectUserInputMethod) {
    return condition => {
        const selectedCondition = selectedConditions.find(selected => selected.ID.value == condition);
        const userInput = rawLicence.licenceConditions.additional[condition];
        const content = getContentForCondition(selectedCondition, userInput, injectUserInputMethod);

        return {
            content,
            group: selectedCondition.GROUP_NAME.value,
            subgroup: selectedCondition.SUBGROUP_NAME.value
        };
    };
}

function getContentForCondition(selectedCondition, userInput, injectUserInputMethod) {
    const userInputName = selectedCondition.USER_INPUT.value;

    return userInputName ?
        injectUserInputMethod(selectedCondition, userInput) :
        [{text: selectedCondition.TEXT.value}];
}

function getObjectForBespoke(condition) {
    return {
        content: [{text: condition.text}],
        group: 'Bespoke',
        subgroup: null
    };
}

function injectUserInputAsObject(condition, userInput) {

    const conditionName = condition.USER_INPUT.value;
    const conditionText = condition.TEXT.value;
    const fieldPositionObject = condition.FIELD_POSITION.value;

    return conditionName === 'appointmentDetails' ?
        injectUserInputAppointmentAsObject(userInput, conditionText) :
        injectUserInputStandardAsObject(userInput, conditionText, fieldPositionObject);
}

function injectUserInputStandardAsObject(userInput, conditionText, fieldPositionObject) {
    const fieldNames = Object.keys(fieldPositionObject);
    const splitConditionText = conditionText.split(betweenBrackets).filter(text => text);
    const reducer = injectVariablesIntoViewObject(fieldNames, fieldPositionObject, userInput);
    return splitConditionText.reduce(reducer, []);
}

function injectVariablesIntoViewObject(fieldNames, fieldPositionObject, userInput) {
    return (conditionArray, textSegment, index) => {
        const fieldNameForPlaceholder = fieldNames.find(field => fieldPositionObject[field] == index);
        if (!fieldNameForPlaceholder) {
            return [...conditionArray, {text: textSegment}];
        }
        const inputtedData = userInput[fieldNameForPlaceholder];
        return [...conditionArray, {text: textSegment}, {variable: inputtedData}];
    };
}

// Special case, doesn't follow normal rules
function injectUserInputAppointmentAsObject(userInput, conditionText) {
    const {appointmentAddress, appointmentDate, appointmentTime} = userInput;
    const string = `${appointmentAddress} on ${appointmentDate} at ${appointmentTime}`;
    const splitConditionText = conditionText.split(betweenBrackets).filter(text => text);
    return [
        {text: splitConditionText[0]},
        {variable: string},
        {text: splitConditionText[1]}
    ];
}

// For pdf
function populateAdditionalConditionsAsString(rawLicence, selectedConditions) {
    return addAdditionalConditions(rawLicence, selectedConditions, injectUserInputAsString);
}

function injectUserInputAsString(condition, userInput) {

    const conditionName = condition.USER_INPUT.value;
    const conditionText = condition.TEXT.value;
    const fieldPositionObject = condition.FIELD_POSITION.value;
    const placeHolders = getPlaceholdersFrom(conditionText);

    if (conditionName === 'appointmentDetails') {
        return injectUserInputAppointmentAsString(userInput, conditionText, placeHolders);
    }

    return injectUserInputStandardAsString(userInput, conditionText, placeHolders, fieldPositionObject);
}

function injectUserInputStandardAsString(userInput, conditionText, placeHolders, fieldPositionObject) {
    const fieldNames = Object.keys(fieldPositionObject);
    const reducer = injectVariablesIntoString(fieldNames, fieldPositionObject, userInput);
    return placeHolders.reduce(reducer, conditionText);
}

function injectVariablesIntoString(fieldNames, fieldPositionObject, userInput) {
    return (text, placeHolder, index) => {
        const fieldNameForPlaceholder = fieldNames.find(field => fieldPositionObject[field] == index);
        const inputtedData = userInput[fieldNameForPlaceholder];
        return text.replace(placeHolder, inputtedData);
    };
}

// Special case, doesn't follow normal rules
function injectUserInputAppointmentAsString(userInput, conditionText, placeHolder) {
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

function orderForView(a, b) {
    return conditionsOrder.indexOf(a) - conditionsOrder.indexOf(b);
}
