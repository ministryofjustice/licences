const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');
const path = require('path');
const {getIn} = require('../utils/functionalHelpers');
const formConfig = require('./config/personalDetails');

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
        logger.debug('GET /details');

        const nomisId = req.params.nomisId;
        const licence = await licenceService.getLicence(nomisId);

        const prisonerInfo = await getPersonalDetails(licence, nomisId, prisonerService, req.user.token);
        const eligibility = getIn(licence, ['licence', 'eligibility']);
        const eligible = isEligible(eligibility);
        const optOut = getIn(licence, ['licence', 'proposedAddress', 'optOut']);

        res.render(`taskList/index`, {prisonerInfo, eligibility, eligible, optOut});
    }));

    router.post('/eligibilityStart', asyncMiddleware(async (req, res) => {
        logger.debug('POST /eligibilityStart');

        const nomisId = req.body.nomisId;

        const existingLicence = await licenceService.getLicence(nomisId);

        if (!existingLicence) {
            await licenceService.create({
                nomisId: nomisId,
                fieldMap: formConfig.personalDetails.fields,
                userInput: req.body,
                licenceSection: 'personalDetails',
                formName: 'details'
            });
        }

        res.redirect(`/hdc/eligibility/${nomisId}`);
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /details');

        const nomisId = req.body.nomisId;

        const existingLicence = await licenceService.getLicence(nomisId);

        if (!existingLicence) {
            await licenceService.createLicence(nomisId, req.body);
        }

        res.redirect('/dischargeAddress/'+nomisId);
    }));

    router.get('/image/:imageId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /image');

        const prisonerImage = await prisonerService.getPrisonerImage(req.params.imageId, req.user.token);

        if (!prisonerImage) {
            const placeHolder = path.join(__dirname, '../../assets/images/placeholder.png');
            res.status(302);
            return res.sendFile(placeHolder);
        }
        res.contentType('image/jpeg');
        res.send(prisonerImage);
    }));

    return router;
};

function isEligible(eligibilityObject) {
    if(!eligibilityObject) {
        return false;
    }
    return eligibilityObject.excluded === 'No' && eligibilityObject.unsuitable === 'No';
}

function getPersonalDetails(licence, nomisId, prisonerService, nomisToken) {
    const savedDetails = getIn(licence, ['licence', 'personalDetails', 'details']);
    if(savedDetails) {
        return savedDetails;
    }
    return prisonerService.getPrisonerDetails(nomisId, nomisToken);
}
