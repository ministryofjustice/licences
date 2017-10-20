module.exports = function createDischargeAddressService(nomisClientBuilder) {

    async function getDischargeAddress(nomisId, token) {
        try {
            const nomisClient = nomisClientBuilder(token);

            return await nomisClient.getDischargeAddress(nomisId);

        } catch(error) {
            console.error(error, 'getDischargeAddress failed');
            throw error;
        }
    }

    return {getDischargeAddress};
};
