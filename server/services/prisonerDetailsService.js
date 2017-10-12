module.exports = function createPrisonerDetailsService(nomisClient) {
    async function getPrisonerDetails(id) {
        try {
            return await nomisClient.getPrisonerInfo(id);
        } catch (error) {

            // TODO more specific api failure handling
            console.error('Error getting prisoner info');
            throw error;
        }
    }

    return {getPrisonerDetails};
};
