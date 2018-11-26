const {asyncMiddleware} = require('../utils/middleware');

module.exports = ({licenceService, prisonerService}) => router => {
    router.get('/:receiver/:type/:bookingId', asyncMiddleware(async (req, res) => {
        const {receiver, type, bookingId} = req.params;
        const submissionTarget = await prisonerService.getOrganisationContactDetails(receiver, bookingId, res.locals.token);

        res.render(`sent/${type}`, {submissionTarget});
    }));

    return router;
};
