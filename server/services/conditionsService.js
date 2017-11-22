module.exports = function createConditionsService(licenceClient) {

    async function getStandardConditions() {
        try {
            return await licenceClient.getStandardConditions();
        } catch(error) {
            throw error;
        }
    }

    async function getAdditionalConditions(licence = null) {
        try {
            const conditions = await licenceClient.getAdditionalConditions();

            if (licence && licence.additionalConditions) {

                return conditions
                    .map(populateUserSubmission(licence.additionalConditions))
                    .reduce(splitIntoGroupedObject, {});
            }

            return conditions.reduce(splitIntoGroupedObject, {});
        } catch(error) {
            throw error;
        }
    }

    return {getStandardConditions, getAdditionalConditions};
};

function splitIntoGroupedObject(conditionObject, condition) {
    const groupName = condition.GROUP_NAME.value || 'base';
    const subgroupName = condition.SUBGROUP_NAME.value || 'base';

    const group = conditionObject[groupName] || {};
    const subgroup = group[subgroupName] || [];

    const newSubgroup = [...subgroup, condition];
    const newGroup = {...group, [subgroupName]: newSubgroup};

    return {...conditionObject, [groupName]: newGroup};
}

function populateUserSubmission(inputtedConditions) {

    const populatedConditionIds = Object.keys(inputtedConditions);

    return condition => {
        const submission = inputtedConditions[condition.ID.value] || {};
        const selected = populatedConditionIds.includes(String(condition.ID.value));

        return {...condition, SELECTED: selected, USER_SUBMISSION: submission};
    };
}
