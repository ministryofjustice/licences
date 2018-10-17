const express = require('express');
const {async, checkLicenceMiddleWare, authorisationMiddleware, auditMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');

module.exports = function({licenceService, prisonerService, authenticationMiddleware, audit}) {

    const router = express.Router();
    router.use(authenticationMiddleware());
    router.param('bookingId', checkLicenceMiddleWare(licenceService, prisonerService));
    router.param('bookingId', authorisationMiddleware);

    const audited = auditMiddleware(audit, 'UPDATE_SECTION');

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    const formConfig = require('./config/bassReferral');
    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'bassReferral'});

    router.post('/bassReferral/bassRequest/rejected/:bookingId', audited, async(replaceBassRequest));

    router.get('/bassReferral/:formName/:action/:bookingId', async(standard.get));
    router.post('/bassReferral/:formName/:action/:bookingId', audited, async(standard.post));

    router.get('/bassReferral/:formName/:bookingId', async(standard.get));
    router.post('/bassReferral/:formName/:bookingId', audited, async(standard.post));

    async function replaceBassRequest(req, res) {

        const {bookingId} = req.params;

        await Promise.all([
            licenceService.update({
                bookingId: bookingId,
                config: formConfig['bassRequest'],
                userInput: req.body,
                licenceSection: 'bassReferral',
                formName: 'bassRequest'
            }),
            licenceService.update({
                bookingId: bookingId,
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
