module.exports = function createPrisonerDetailsService(nomisClient) {
    async function getPrisonerDetails(nomisId) {
        try {

            const bookings = await nomisClient.getBookings(nomisId);

            const booking = bookings[0];

            const bookingDetail = await nomisClient.getBooking(booking.bookingId);

            const image = await nomisClient.getImageInfo(booking.facialImageId);

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
                }
            };

        } catch (error) {
            // TODO more specific api failure handling
            console.error('Error getting prisoner info');
            throw error;
        }
    }

    return {getPrisonerDetails};
};
