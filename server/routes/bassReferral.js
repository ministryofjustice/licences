const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const formConfig = require('./config/bassReferral');

module.exports = ({licenceService}) => (router, audited) => {

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'bassReferral'});

    router.post('/bassReferral/bassRequest/rejected/:bookingId', audited, asyncMiddleware(replaceBassRequest));
  
    router.get('/bassReferral/:formName/:action/:bookingId', asyncMiddleware(standard.get));
    router.post('/bassReferral/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post));

    router.get('/bassReferral/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/bassReferral/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    async function replaceBassRequest(req, res) {

        const {bookingId} = req.params;

        await Promise.all([
            licenceService.update({
                originalLicence: res.locals.licence,
                config: formConfig['bassRequest'],
                userInput: req.body,
                licenceSection: 'bassReferral',
                formName: 'bassRequest'
            }),
            licenceService.update({
                originalLicence: res.locals.licence,
                config: formConfig['bassAreaCheck'],
                userInput: {bassAreaSuitable: undefined, bassAreaReason: undefined},
                licenceSection: 'bassReferral',
                formName: 'bassAreaCheck'
            })
        ]);

        const nextPath = formConfig.bassRequest.nextPath['path'];
        res.redirect(`${nextPath}${bookingId}`);
    }

    return router;
};
