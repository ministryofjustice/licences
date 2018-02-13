const logger = require('../../log.js');
const {formatObjectForView} = require('./utils/formatForView');

module.exports = {createPrisonerService};

function createPrisonerService(nomisClientBuilder) {

    async function getPrisonerDetails(nomisId, token) {
        try {
            logger.info(`getPrisonerDetail: ${nomisId}`);

            const nomisClient = nomisClientBuilder(token);

            const prisoners = await nomisClient.getHdcEligiblePrisoner(nomisId);
            const prisoner = prisoners[0];
            if (!prisoner) {
                return;
            }

            const bookingId = prisoner.bookingId;

            // todo could make this use promise.all, but wait until we know the API is stable and details are right
            const sentence = await nomisClient.getSentenceDetail(bookingId);
            const aliases = await nomisClient.getAliases(bookingId);
            const offences = await nomisClient.getMainOffence(bookingId);
            const com = await nomisClient.getComRelation(bookingId);

            const image = prisoner.facialImageId ?
                await nomisClient.getImageInfo(prisoner.facialImageId) : {imageId: false};

            return formatObjectForView({...prisoner, ...sentence, offences, ...image, com, aliases});

        } catch (error) {
            logger.error('Error getting prisoner info', error.stack);
            throw error;
        }
    }

    async function getPrisonerImage(imageId, token) {
        try {
            logger.info(`getPrisonerImage: ${imageId}`);

            const nomisClient = nomisClientBuilder(token);
            const image = await nomisClient.getImageData(imageId);
            return image;
        } catch (error) {
            logger.error('Error getting prisoner image');
            return null;
        }
    }

    async function getEstablishmentForPrisoner(nomisId, token) {
        try {
            logger.info(`getEstablishmentForPrisoner: ${nomisId}`);

            const nomisClient = nomisClientBuilder(token);

            const prisoners = await nomisClient.getHdcEligiblePrisoner(nomisId);
            const prisoner = prisoners[0];
            if (!prisoner) {
                return;
            }

            return getEstablishment(prisoner.agencyLocationId, token);

        } catch (error) {
            logger.error('Error getting prisoner establishment', error.stack);
            throw error;
        }
    }

    async function getEstablishment(agencyLocationId, token) {
        try {
            logger.info(`getEstablishment: ${agencyLocationId}`);

            const nomisClient = nomisClientBuilder(token);
            const establishment = await nomisClient.getEstablishment(agencyLocationId);

            return formatObjectForView(establishment);

        } catch (error) {

            if(error.status === 404) {
                logger.warn('Establishment not found: ' + agencyLocationId);
                return null;
            }

            logger.error('Error getting establishment', error.stack);
            throw error;
        }
    }

    return {getPrisonerDetails, getPrisonerImage, getEstablishmentForPrisoner, getEstablishment};
};


