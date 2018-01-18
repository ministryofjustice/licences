const logger = require('../../log.js');
const {formatObjectForView} = require('./utils/formatForView');

module.exports = function createPrisonerDetailsService(nomisClientBuilder) {
    async function getPrisonerDetails(nomisId, token) {
        try {
            logger.info(`getPrisonerDetail: ${nomisId}`);

            const nomisClient = nomisClientBuilder(token);

            const prisoner = await nomisClient.getHdcEligiblePrisoner(nomisId);
            const bookingId = prisoner[0].bookingId;

            // todo could make this use promise.all, but wait until we know the API is stable and details are right
            const sentence = await nomisClient.getSentenceDetail(bookingId);
            const aliasesList = await nomisClient.getAliases(bookingId);
            const offences = await nomisClient.getMainOffence(bookingId);
            const com = await nomisClient.getComRelation(bookingId);

            const image = prisoner[0].facialImageId ?
                await nomisClient.getImageInfo(prisoner[0].facialImageId) :
                {imageId: false};

            const offenceDescription = formatOffenceDescription(offences);
            const comName = formatComName(com);
            const aliases = formatAliases(aliasesList);

            return formatResponse({...prisoner[0], ...sentence, offenceDescription, ...image, comName, aliases});

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
            return await nomisClient.getImageData(imageId);
        } catch (error) {
            logger.error('Error getting prisoner image');

            return null;
        }
    }

    return {getPrisonerDetails, getPrisonerImage};
};

function formatOffenceDescription(offences) {
    return offences[0].offenceDescription;
}

function formatComName(com) {
    return com[0] ? [com[0].firstName, com[0].lastName].join(' ') : '';
}

function formatAliases(aliasesList) {
return aliasesList.map(alias => {
    return [alias.firstName, alias.lastName].join(' ');
}).join(', ');
}

function formatResponse(object) {
    const nameFields = [
        'lastName',
        'firstName',
        'middleName',
        'gender',
        'assignedLivingUnitDesc',
        'comName',
        'aliases'
    ];
    const dateFields = [
        'captureDate',
        'dateOfBirth',
        'conditionalReleaseDate',
        'homeDetentionCurfewEligibilityDate',
        'licenceExpiryDate',
        'sentenceExpiryDate'
    ];

    return formatObjectForView(object, {dates: dateFields, capitalise: nameFields});
}
