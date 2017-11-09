module.exports = function createConditionsService(licenceClient) {

    async function getStandardConditions() {
        try {
            return await licenceClient.getStandardConditions();
        } catch(error) {
            throw error;
        }
    }

    async function getAdditionalConditions() {
        try {
            const conditions = await licenceClient.getAdditionalConditions();


            return splitIntoGroups(conditions);
        } catch(error) {
            throw error;
        }
    }

    return {getStandardConditions, getAdditionalConditions};
};


function splitIntoGroups(conditions) {
    return conditions.reduce((conditionObject, condition) => {
        const groupName = condition.GROUP_NAME.value || 'base';
        const subgroupName = condition.SUBGROUP_NAME.value || 'base';

        const group = conditionObject[groupName] || {};
        const subgroup = group[subgroupName] || [];

        const newSubgroup = [...subgroup, condition];
        const newGroup = {...group, [subgroupName]: newSubgroup};

        return {...conditionObject, [groupName]: newGroup};

    }, {});
}
