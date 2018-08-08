const {getIn, isEmpty, mergeWithRight} = require('../../utils/functionalHelpers');
const pdfData = require('../config/pdfData');
const {romanise} = require('../../utils/romanise');

module.exports = {formatPdfData};

const DEFAULT_PLACEHOLDER = '(DATA MISSING)';

function formatPdfData(templateName, nomisId,
                       {licence, prisonerInfo, establishment}, image,
                       placeholder = DEFAULT_PLACEHOLDER) {

    const conditions = getConditionsForConfig(licence, templateName, 'CONDITIONS');
    const pss = getConditionsForConfig(licence, templateName, 'PSS');

    const photo = image ? image.toString('base64') : placeholder.toString('base64');

    const allData = {
        licence,
        prisonerInfo,
        establishment,
        nomisId,
        conditions,
        pss,
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
        values: {[key]: spec.noPlaceholder ? '' : placeholder},
        missing: {
            [spec.group]: {
                [spec.required]: {
                    [key]: spec.displayName
                }
            }
        }
    });
};

function readEntry(data, spec) {
    return spec.paths
        .map(path => getIn(data, path))
        .filter(x => x)
        .join(spec.separator);
}

function getConditionsForConfig(licence, templateName, configName) {
    const conditionsConfig = pdfData[templateName][configName];
    return isEmpty(conditionsConfig) ? {} : getAdditionalConditionsText(licence, conditionsConfig);
}

function getAdditionalConditionsText(licence, config) {

    const standardOnly = getIn(licence, ['licenceConditions', 'standard', 'additionalConditionsRequired']);
    const conditions = getIn(licence, ['licenceConditions']);

    if (standardOnly === 'No' || isEmpty(conditions)) {
        return;
    }

    const start = config.startIndex;
    const itemDivider = config.divider;
    const filter = config.filter ? config.filter(config.filtered) : condition => condition;

    return conditions
        .filter(condition => filter(condition))
        .map((condition, index) =>
            `${listCounter(start, index)}${getConditionText(condition.content, config.terminator)}`)
        .join(itemDivider);
}

function listCounter(start, index) {
    return romanise(start + index)
        .concat('. ')
        .toLowerCase();
}

function getConditionText(content, terminator) {
    return content
        .map(({text, variable}) => text || variable)
        .join('')
        .replace(/\.+$/, '') // remove trailing period
        .concat(terminator);
}
