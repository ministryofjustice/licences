module.exports = function createConditionsService(licenceClient) {

    async function getStandardConditions() {
        try {
            return await licenceClient.getStandardConditions();
        } catch(error) {
            throw error;
        }
    }

    return {getStandardConditions};
};
