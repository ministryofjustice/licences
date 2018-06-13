const logger = require('../../log.js');
const {formatObjectForView} = require('./utils/formatForView');

module.exports = {createPrisonerService};

function createPrisonerService(nomisClientBuilder) {

    async function getPrisonerPersonalDetails(nomisId, username) {
        try {
            logger.info(`getPrisonerPersonalDetails: ${nomisId}`);

            const nomisClient = nomisClientBuilder(username);

            const prisoners = await nomisClient.getOffenderSentences(nomisId);

            return formatObjectForView(prisoners[0]);
        } catch (error) {
            logger.error('Error getting prisoner personal details');
            return null;
        }
    }

    async function getPrisonerDetails(nomisId, username) {
        try {
            logger.info(`getPrisonerDetail: ${nomisId}`);

            const nomisClient = nomisClientBuilder(username);

            const prisoners = await nomisClient.getOffenderSentences(nomisId);
            const prisoner = prisoners[0];
            if (!prisoner) {
                return;
            }

            const bookingId = prisoner.bookingId;

            const aliases = await nomisClient.getAliases(bookingId);
            const offences = await nomisClient.getMainOffence(bookingId);
            const com = await nomisClient.getComRelation(bookingId);
            const {CRO, PNC} = selectFrom(await nomisClient.getIdentifiers(bookingId));

            const image = prisoner.facialImageId ?
                await nomisClient.getImageInfo(prisoner.facialImageId) : {imageId: false};

            return formatObjectForView({
                ...prisoner, CRO, PNC, offences, ...image, com, aliases
            });

        } catch (error) {
            logger.error('Error getting prisoner info', error.stack);
            throw error;
        }
    }

    async function getPrisonerImage(imageId, username) {
        try {
            logger.info(`getPrisonerImage: ${imageId}`);

            const nomisClient = nomisClientBuilder(username);
            const image = await nomisClient.getImageData(imageId);
            return image;
        } catch (error) {
            logger.error('Error getting prisoner image');
            return null;
        }
    }

    async function getEstablishmentForPrisoner(nomisId, username) {
        try {
            logger.info(`getEstablishmentForPrisoner: ${nomisId}`);

            const nomisClient = nomisClientBuilder(username);

            const prisoners = await nomisClient.getOffenderSentences(nomisId);
            const prisoner = prisoners[0];
            if (!prisoner) {
                return;
            }

            return getEstablishment(prisoner.agencyLocationId, username);

        } catch (error) {
            logger.error('Error getting prisoner establishment', error.stack);
            throw error;
        }
    }

    async function getEstablishment(agencyLocationId, username) {
        try {
            logger.info(`getEstablishment: ${agencyLocationId}`);

            const nomisClient = nomisClientBuilder(username);
            const establishment = await nomisClient.getEstablishment(agencyLocationId);

            return formatObjectForView(establishment);

        } catch (error) {

            if (error.status === 404) {
                logger.warn('Establishment not found for agencyLocationId: ' + agencyLocationId);
                return null;
            }

            logger.error('Error getting establishment', error.stack);
            throw error;
        }
    }

    async function getComForPrisoner(nomisId, username) {
        try {
            logger.info(`getComForPrisoner: ${nomisId}`);

            const nomisClient = nomisClientBuilder(username);

            const prisoners = await nomisClient.getOffenderSentences(nomisId);
            const prisoner = prisoners[0];
            if (!prisoner) {
                return;
            }

            return getCom(prisoner.bookingId, username);

        } catch (error) {
            logger.error('Error getting prisoner establishment', error.stack);
            throw error;
        }
    }

    async function getCom(bookingId, username) {
        try {
            logger.info(`getCom: ${bookingId}`);

            const nomisClient = nomisClientBuilder(username);
            const com = await nomisClient.getComRelation(bookingId);

            return formatObjectForView({com});

        } catch (error) {

            if (error.status === 404) {
                logger.warn('COM not found for booking id: ' + bookingId);
                return null;
            }

            logger.error('Error getting COM', error.stack);
            throw error;
        }
    }

    function selectFrom(identifiers) {
        return identifiers.reduce((selected, element) => {
            if (['PNC', 'CRO'].includes(element.type)) {
                selected[element.type] = element.value;
            }
            return selected;
        }, {});
    }

    return {
        getPrisonerDetails,
        getPrisonerImage,
        getEstablishmentForPrisoner,
        getEstablishment,
        getComForPrisoner,
        getCom,
        getPrisonerPersonalDetails
    };
};


