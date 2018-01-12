const logger = require('../../log.js');
const {formatObjectForView} = require('./utils/formatForView');

module.exports = function createPrisonerDetailsService(nomisClientBuilder) {
    async function getPrisonerDetails(nomisId, token) {
        try {
            logger.info(`getPrisonerDetail: ${nomisId}`);

            const nomisClient = nomisClientBuilder(token);

            const bookings = await nomisClient.getBookings(nomisId);
            logger.info(`got bookings size: ${bookings.length}`);

            if(bookings.length <= 0) {
                throw new Error(`No bookings found for ${nomisId}`);
            }

            const booking = bookings[0];

            const bookingDetail = await nomisClient.getBooking(booking.bookingId);
            logger.info(`got booking detail for booking id: ${booking.bookingId}`);

            const sentenceDetail = await nomisClient.getSentenceDetail(booking.bookingId);
            logger.info(`got sentence detail for booking id: ${booking.bookingId}`);

            const image = booking.facialImageId ?
                await nomisClient.getImageInfo(booking.facialImageId) :
                {imageId: false};

            logger.info(`got image detail for facialImageId id: ${booking.facialImageId}`);

            return formatResponse({...bookingDetail, ...booking, ...image, ...sentenceDetail});

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

            if(!imageData) {
                return {image: null};
            }

            const bufferBase64 = imageData.toString('base64');
            return {image: `data:image/jpeg;base64,${bufferBase64}`};
        } catch (error) {
            logger.error('Error getting prisoner image', error);

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
        'aliases',
        'gender',
        'assignedLivingUnitDesc'
    ];
    const dateFields = [
        'captureDate',
        'dateOfBirth',
        'conditionalReleaseDate',
        'licenceExpiryDate',
        'sentenceExpiryDate'];

    return formatObjectForView(object, {dates: dateFields, capitalise: nameFields});
}
