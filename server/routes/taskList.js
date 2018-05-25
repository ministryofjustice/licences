const express = require('express');
const {asyncMiddleware} = require('../utils/middleware');
const path = require('path');
const {getLicenceStatus} = require('../utils/licenceStatus');
const {getStatusLabel} = require('../utils/licenceStatusLabels');
const {getAllowedTransitions} = require('../utils/licenceStatusTransitions');
const moment = require('moment');

module.exports = function({logger, prisonerService, licenceService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /taskList');

        const {nomisId} = req.params;
        const prisonerInfo = await prisonerService.getPrisonerDetails(nomisId, req.user.token);
        const licence = await licenceService.getLicence(nomisId);

        const licenceStatus = getLicenceStatus(licence);
        const allowedTransitions = getAllowedTransitions(licenceStatus, req.user.role);
        const statusLabel = getStatusLabel(licenceStatus, req.user.role);

        res.render('taskList/taskList', {
            licenceStatus,
            allowedTransitions,
            statusLabel,
            prisonerInfo,
            nomisId
        });
    }));

    router.post('/eligibilityStart', asyncMiddleware(async (req, res) => {
        logger.debug('POST /eligibilityStart');

        const {nomisId, firstName, lastName, dateOfBirth} = req.body;

        const existingLicence = await licenceService.getLicence(nomisId);

        if (!existingLicence) {
            await licenceService.createLicence(nomisId, {
                personalDetails: {
                    firstName,
                    lastName,
                    dateOfBirth: moment(dateOfBirth, 'DD/MM/YYYY').format('YYYY-MM-DD')
                }
            });
        }

        res.redirect(`/hdc/eligibility/excluded/${nomisId}`);
    }));

    router.get('/image/:imageId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /image');

        const prisonerImage = await prisonerService.getPrisonerImage(req.params.imageId, req.user.token);

        if (!prisonerImage) {
            const placeHolder = path.join(__dirname, '../../assets/images/no-photo.png');
            res.status(302);
            return res.sendFile(placeHolder);
        }
        res.contentType('image/jpeg');
        res.send(prisonerImage);
    }));

    return router;
};


