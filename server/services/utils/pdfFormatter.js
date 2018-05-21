const {getIn, mergeWithRight} = require('../../utils/functionalHelpers');
const {dictionary} = require('../config/pdfData');

module.exports = {getValues};

function getValues(nomisId, {licence, prisonerInfo, establishment}, image, placeholder = '(DATA MISSING)') {

    const conditions = getAdditionalConditionsText(licence);
    const photo = image ? image.toString('base64') : placeholder.toString('base64');

    const allData = {
        licence,
        prisonerInfo,
        establishment,
        nomisId,
        conditions,
        photo
    };

    return valueOrPlaceholder(allData, placeholder);
}

function valueOrPlaceholder(allData, placeholder) {
    return Object.entries(dictionary).reduce(readValuesReducer(allData, placeholder), {values: {}, missing: {}});
}

const readValuesReducer = (allData, placeholder) => (summary, [key, spec]) => {

    const value = readEntry(allData, spec);

    if (value) {
        return mergeWithRight(summary, {
            values: {[key]: value}
        });
    }

    return mergeWithRight(summary, {
        values: {[key]: placeholder},
        missing: {[key]: spec.displayName}
    });
};

function readEntry(data, spec) {
    return spec.paths
        .map(path => getIn(data, path))
        .filter(x => x)
        .join(spec.separator);
}

function getAdditionalConditionsText(licence) {

    if (!licence.licenceConditions) {
        return;
    }

    const indent = ':    ';
    const itemDivider = '\n\n';

    return licence.licenceConditions
        .map((condition, index) => `${index + 1}${indent}${getConditionText(condition.content)}`)
        .join(itemDivider);
}

function getConditionText(content) {
    return content.map(({text, variable}) => text || variable).join('');
}


