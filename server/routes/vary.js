const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const formConfig = require('./config/vary');

module.exports = ({licenceService, prisonerService}) => (router, audited) => {
    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'vary'});

    router.get('/vary/licenceDetails/:bookingId', asyncMiddleware(async (req, res) => {
        const {bookingId} = req.params;
        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, res.locals.token);

        res.render('vary/licenceDetails', {
            prisonerInfo,
            bookingId
        });
    }));

    router.post('/vary/licenceDetails/:bookingId', asyncMiddleware(async (req, res) => {
        const {bookingId} = req.body;
        await licenceService.createLicenceFromFlatInput(req.body, bookingId, res.locals.licence.licence);
        const nextPath = req.body.additionalConditions === 'Yes' ? 'licenceConditions/additionalConditions' : 'taskList';

        res.redirect(`/hdc/${nextPath}/${bookingId}`);
    }));

    router.get('/vary/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/vary/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};
