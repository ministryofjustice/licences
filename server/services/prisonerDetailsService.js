const logger = require('../../log.js');

module.exports = function createPrisonerDetailsService(nomisClientBuilder) {
    async function getPrisonerDetails(nomisId, token) {
        try {
            logger.info(`getPrisonerDetail: ${nomisId}`);

            const nomisClient = nomisClientBuilder(token);

            const bookings = await nomisClient.getBookings(nomisId);
            logger.info(`got bookings size: ${bookings.length}`);

            const booking = bookings[0];

            const bookingDetail = await nomisClient.getBooking(booking.bookingId);
            logger.info(`got booking detail for booking id: ${booking.bookingId}`);

            const sentenceDetail = await nomisClient.getSentenceDetail(booking.bookingId);
            logger.info(`got sentence detail for booking id: ${booking.bookingId}`);

            const image = await nomisClient.getImageInfo(booking.facialImageId);
            logger.info(`got image detail for facialImageId id: ${booking.facialImageId}`);

            return {
                dateOfBirth: booking.dateOfBirth,
                firstName: booking.firstName,
                middleName: booking.middleName,
                lastName: booking.lastName,
                nomsId: booking.offenderNo,
                aliases: booking.aliases,
                gender: bookingDetail.physicalAttributes.gender,
                location: booking.assignedLivingUnitDesc,
                image: {
                    name: image.imageId,
                    uploadedDate: image.captureDate
                },
                dates: sentenceDetail
            };

        } catch (error) {
            // TODO more specific api failure handling
            logger.error('Error getting prisoner info');
            logger.error(error);
            throw error;
        }
    }

    return {getPrisonerDetails};
};
