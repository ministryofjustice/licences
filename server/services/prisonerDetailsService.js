const logger = require('../../log.js');

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

            const image = booking.facialImageId ? await nomisClient.getImageInfo(booking.facialImageId): null;
            logger.info(`got image detail for facialImageId id: ${booking.facialImageId}`);

            return {...bookingDetail, ...booking, ...image, ...sentenceDetail};

        } catch (error) {
            logger.error('Error getting prisoner info');
            logger.error(error);
            throw error;
        }
    }

    return {getPrisonerDetails};
};
