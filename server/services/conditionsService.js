const {formatConditionsInput} = require('./utils/conditionsFormatter');
const {getIn, isEmpty} = require('../utils/functionalHelpers');
const logger = require('../../log.js');
const {conditionsOrder} = require('../models/conditions');
const {populateAdditionalConditionsAsObject} = require('../utils/licenceFactory');
const moment = require('moment');
const {additionalConditions, standardConditions} = require('./config/conditionsConfig');

module.exports = function createConditionsService() {

    function getStandardConditions() {
        return standardConditions;
    }

    function getAdditionalConditions(licence = null) {
        const licenceAdditionalConditions = getIn(licence, ['licenceConditions', 'additional']);
        if (licenceAdditionalConditions) {
            return additionalConditions
                .sort(orderForView)
                .map(populateFromSavedLicence(licenceAdditionalConditions))
                .reduce(splitIntoGroupedObject, {});
        }

        return additionalConditions
            .sort(orderForView)
            .reduce(splitIntoGroupedObject, {});
    }

    function formatConditionInputs(requestBody) {
        const selectedConditionsConfig = additionalConditions.filter(condition =>
            requestBody.additionalConditions.includes(condition.id));

        return formatConditionsInput(requestBody, selectedConditionsConfig);
    }

    async function populateLicenceWithConditions(licence, errors = {}) {

        if (getIn(licence, ['licenceConditions', 'standard', 'additionalConditionsRequired']) === 'No') {
            return licence;
        }

        const licenceAdditionalConditions = getIn(licence, ['licenceConditions', 'additional']);
        const bespokeConditions = getIn(licence, ['licenceConditions', 'bespoke']) || [];
        const conditionsOnLicence = !isEmpty(licenceAdditionalConditions) || bespokeConditions.length > 0;
        if (!conditionsOnLicence) {
            return licence;
        }

        try {
            const conditionIdsSelected = Object.keys(licenceAdditionalConditions);
            const selectedConditionsConfig = additionalConditions.filter(condition =>
                conditionIdsSelected.includes(condition.id));

            return populateAdditionalConditionsAsObject(licence, selectedConditionsConfig, errors);

        } catch (error) {
            logger.error('Error during populateLicenceWithConditions');
            throw error;
        }
    }

    return {
        getStandardConditions,
        getAdditionalConditions,
        formatConditionInputs,
        populateLicenceWithConditions
    };
};

function splitIntoGroupedObject(conditionObject, condition) {
    const groupName = condition.group_name || 'base';
    const subgroupName = condition.subgroup_name || 'base';

    const group = conditionObject[groupName] || {};
    const subgroup = group[subgroupName] || [];

    const newSubgroup = [...subgroup, condition];
    const newGroup = {...group, [subgroupName]: newSubgroup};

    return {...conditionObject, [groupName]: newGroup};
}

function populateFromSavedLicence(inputtedConditions) {
    const populatedConditionIds = Object.keys(inputtedConditions);

    return condition => {
        const submission = getSubmissionForCondition(condition.id, inputtedConditions);
        const selected = populatedConditionIds.includes(String(condition.id));

        return {...condition, selected: selected, user_submission: submission};
    };
}

function orderForView(a, b) {
    return conditionsOrder.indexOf(a.id) - conditionsOrder.indexOf(b.id);
}

function getSubmissionForCondition(conditionId, inputtedConditions) {
    if (isEmpty(inputtedConditions[conditionId])) {
        return {};
    }

    if (conditionId === 'ATTENDDEPENDENCY') {
        const appointmentDate = moment(inputtedConditions[conditionId].appointmentDate, 'DD/MM/YYYY');
        return {
            ...inputtedConditions[conditionId],
            appointmentDay: appointmentDate.format('DD'),
            appointmentMonth: appointmentDate.format('MM'),
            appointmentYear: appointmentDate.format('YYYY')
        };
    }

    return inputtedConditions[conditionId];
}
