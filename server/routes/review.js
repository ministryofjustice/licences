const express = require('express');

const {async, checkLicenceMiddleWare, authorisationMiddleware} = require('../utils/middleware');
const createReviewRoutes = require('./routeWorkers/review');

module.exports = function(
    {licenceService, conditionsService, prisonerService, authenticationMiddleware, audit}) {

    const router = express.Router();
    router.use(authenticationMiddleware());
    router.param('bookingId', checkLicenceMiddleWare(licenceService, prisonerService));
    router.param('bookingId', authorisationMiddleware);

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    const review = createReviewRoutes({conditionsService, licenceService, prisonerService});

    router.get('/review/:sectionName/:bookingId', async(review.getReviewSection));

    return router;
};


