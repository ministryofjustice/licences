module.exports = function createLicenceDetailsService(api) {
    async function getPrisonerDetails(id) {
        try {
            return await api.getPrisonerInfo(id);
        } catch (error) {

            // TODO more specific api failure handling
            console.error('Error getting prisoner info');
            throw error;
        }
    }

    return {getPrisonerDetails};
};
