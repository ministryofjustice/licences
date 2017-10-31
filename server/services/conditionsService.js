const inputMeta = require('../data/meta/additionalConditionsMeta');

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
            const rawConditions = await licenceClient.getAdditionalConditions();

            return addUserInputDataTo(rawConditions);

        } catch(error) {
            throw error;
        }
    }

    return {getStandardConditions, getAdditionalConditions};
};

function addUserInputDataTo(rawConditions) {
    return rawConditions.map(condition => {
        const uiItemsInConditions = getUiItemsFrom(condition.TEXT.value);

        if(!uiItemsInConditions) {
            return condition;
        }

        const itemsInCondition = uiItemsInConditions.map(item => {
            return inputMeta.get(item);
        });

        return {...condition, FORM_ITEMS: itemsInCondition};
    });
}

const betweenBrackets = /\[[^\]]*]/g;

function getUiItemsFrom(condition) {
    return condition.match(betweenBrackets) || null;
}
