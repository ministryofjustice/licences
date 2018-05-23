const {getIn, mergeWithRight} = require('../../utils/functionalHelpers');
const pdfData = require('../config/pdfData');
const {romanise} = require('../../utils/romanise');

module.exports = {formatPdfData};

const DEFAULT_PLACEHOLDER = '(DATA MISSING)';

function formatPdfData(templateName, nomisId,
                       {licence, prisonerInfo, establishment}, image,
                       placeholder = DEFAULT_PLACEHOLDER) {

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

    return valueOrPlaceholder(allData, placeholder, templateName);
}

function valueOrPlaceholder(allData, placeholder, templateName) {
    return Object.entries(pdfData[templateName])
        .reduce(readValuesReducer(allData, placeholder), {values: {}, missing: {}});
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

    // todo extrcat this config if supporting other templates
    const start = 8; // Need to continue existing list number
    const itemDivider = '\n\n';

    return licence.licenceConditions
        .map((condition, index) => `${listCounter(start, index)}${getConditionText(condition.content)}`)
        .join(itemDivider);
}

function listCounter(start, index) {
    return romanise(start + index)
        .concat('. ')
        .toLowerCase();
}

function getConditionText(content) {
    return content
        .map(({text, variable}) => text || variable)
        .join('')
        .replace(/\.+$/, '') // remove trailing period
        .concat(';');
}
