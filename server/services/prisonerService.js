const logger = require('../../log.js');
const {formatObjectForView} = require('./utils/formatForView');

module.exports = function createPrisonerDetailsService(nomisClientBuilder) {
    async function getPrisonerDetails(nomisId, token) {
        try {
            logger.info(`getPrisonerDetail: ${nomisId}`);

            const nomisClient = nomisClientBuilder(token);

            const prisoner = await nomisClient.getHdcEligiblePrisoner(nomisId);

            const sentence = await nomisClient.getSentenceDetail(prisoner.bookingId);
            const aliasesList = await nomisClient.getAliases(prisoner.bookingId);
            const offences = await nomisClient.getMainOffence(prisoner.bookingId);
            const com = await nomisClient.getComRelation(prisoner.bookingId);

            const image = prisoner.facialImageId ?
                await nomisClient.getImageInfo(prisoner.facialImageId) :
                {imageId: false};

            const offenceDescription = formatOffenceDescription(offences);
            const comName = formatComName(com);
            const aliases = formatAliases(aliasesList);

            return formatResponse({...prisoner, ...sentence, offenceDescription, ...image, comName, aliases});

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

function formatOffenceDescription(offences) {
    return offences[0].offenceDescription;
}

function formatComName(com) {
    return [com[0].firstName, com[0].lastName].join(' ');
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
        'licenceExpiryDate',
        'sentenceExpiryDate'
    ];

    return formatObjectForView(object, {dates: dateFields, capitalise: nameFields});
}
