const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const formConfig = require('./config/bassReferral');

module.exports = ({licenceService}) => (router, audited) => {

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'bassReferral'});

    router.post('/bassReferral/rejected/:bookingId', audited, asyncMiddleware(async (req, res) => {

        const {bookingId} = req.params;
        const {enterAlternative} = req.body;
        const {licence} = res.locals.licence;

        await licenceService.rejectBass(licence.licence, bookingId, enterAlternative);

        const nextPath = formConfig['rejected'].nextPath.decisions[enterAlternative];
        res.redirect(`${nextPath}${bookingId}`);
    }));

    router.get('/bassReferral/:formName/:action/:bookingId', asyncMiddleware(standard.get));
    router.post('/bassReferral/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post));

    router.get('/bassReferral/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/bassReferral/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};
