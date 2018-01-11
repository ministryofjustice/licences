const logger = require('../../log.js');
const {formatObjectForView} = require('./utils/formatForView');

module.exports = function createPrisonerDetailsService(nomisClientBuilder) {
    async function getPrisonerDetails(nomisId, token) {
        try {
            logger.info(`getPrisonerDetail: ${nomisId}`);

            const nomisClient = nomisClientBuilder(token);

            const prisoner = await nomisClient.getHdcEligiblePrisoner(nomisId);

            const sentence = await nomisClient.getSentenceDetail(prisoner.bookingId);
            const aliases = await nomisClient.getAliases(prisoner.bookingId);
            const offence = await nomisClient.getMainOffence(prisoner.bookingId);
            const com = await nomisClient.getComRelation(prisoner.bookingId);

            const image = prisoner.facialImageId ?
                await nomisClient.getImageInfo(prisoner.facialImageId) :
                {imageId: false};

            return formatResponse({...prisoner, ...sentence, ...offence[0], ...image, com, aliases});

        } catch (error) {
            logger.error('Error getting prisoner info');
            logger.error(error);
            throw error;
        }
    }

    async function getPrisonerImage(imageId, token) {
        try {
            logger.info(`getPrisonerImage: ${imageId}`);

            const nomisClient = nomisClientBuilder(token);
            const imageData = await nomisClient.getImageData(imageId);

            if (!imageData) {
                return {image: null};
            }

            const bufferBase64 = imageData.toString('base64');
            return {image: `data:image/jpeg;base64,${bufferBase64}`};
        } catch (error) {
            logger.info('Error getting prisoner image', error);

            return {image: null};
        }
    }

    return {getPrisonerDetails, getPrisonerImage};
};

function formatResponse(object) {
    const nameFields = [
        'lastName',
        'firstName',
        'middleName',
        'gender',
        'assignedLivingUnitDesc'
    ];
    const dateFields = [
        'captureDate',
        'dateOfBirth',
        'conditionalReleaseDate',
        'licenceExpiryDate',
        'sentenceExpiryDate'
    ];

    return formatObjectForView(object, {dates: dateFields, capitalise: nameFields});
}
