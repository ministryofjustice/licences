const logger = require('../../log.js');
const {formatObjectForView} = require('./utils/formatForView');
const {merge} = require('../utils/functionalHelpers');

module.exports = {createPrisonerService};

function createPrisonerService(nomisClientBuilder) {

    async function getPrisonerPersonalDetails(bookingId, token) {
        try {
            logger.info(`getPrisonerPersonalDetails: ${bookingId}`);

            const nomisClient = nomisClientBuilder(token);

            const prisoners = await nomisClient.getOffenderSentencesByBookingId(bookingId);

            return formatObjectForView(prisoners[0]);
        } catch (error) {
            logger.error('Error getting prisoner personal details');
            return null;
        }
    }

    async function getPrisonerDetails(bookingId, token) {
        try {
            logger.info(`getPrisonerDetail: ${bookingId}`);

            const nomisClient = nomisClientBuilder(token);

            const prisoners = await nomisClient.getOffenderSentencesByBookingId(bookingId);
            const prisoner = prisoners[0];
            if (!prisoner) {
                return;
            }

            const [aliases, offences, coms] = await Promise.all([
                nomisClient.getAliases(bookingId),
                nomisClient.getMainOffence(bookingId),
                nomisClient.getComRelation(bookingId)
            ]);

            const com = await getComDetails(nomisClient, coms);

            const {CRO, PNC} = selectEntriesWithTypes(await nomisClient.getIdentifiers(bookingId), ['PNC', 'CRO']);

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

    async function getComDetails(nomisClient, coms) {

        if (!coms[0]) {
            return null;
        }

        const personIdentifiers = await nomisClient.getPersonIdentifiers(coms[0].personId);

        const id = personIdentifiers.find(id => id.identifierType === 'EXTERNAL_REL');
        return [merge(coms[0], {deliusId: id.identifierValue})];
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

    async function getEstablishmentForPrisoner(bookingId, token) {
        try {
            logger.info(`getEstablishmentForPrisoner: ${bookingId}`);

            const nomisClient = nomisClientBuilder(token);

            const prisoners = await nomisClient.getOffenderSentencesByBookingId(bookingId);
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

            if (error.status === 404) {
                logger.warn('Establishment not found for agencyLocationId: ' + agencyLocationId);
                return null;
            }

            logger.error('Error getting establishment', error.stack);
            throw error;
        }
    }

    async function getCom(bookingId, token) {
        try {
            logger.info(`getCom: ${bookingId}`);

            const nomisClient = nomisClientBuilder(token);
            const coms = await nomisClient.getComRelation(bookingId);

            const com = await getComDetails(nomisClient, coms);

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

    function selectEntriesWithTypes(identifiers, types) {
        return identifiers.reduce((selected, element) => {
            if (types.includes(element.type)) {
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
        getCom,
        getPrisonerPersonalDetails
    };
};


