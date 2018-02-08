const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');
const path = require('path');
const {getIn, isEmpty} = require('../utils/functionalHelpers');

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

        const {nomisId} = req.params;
        const prisonerInfo = await prisonerService.getPrisonerDetails(nomisId, req.user.token);
        const licence = await licenceService.getLicence(nomisId);

        const taskData = getTaskData(licence);

        res.render('taskList/index', {
            taskData,
            prisonerInfo
        });
    }));

    router.post('/eligibilityStart', asyncMiddleware(async (req, res) => {
        logger.debug('POST /eligibilityStart');

        const nomisId = req.body.nomisId;

        const existingLicence = await licenceService.getLicence(nomisId);

        if (!existingLicence) {
            await licenceService.createLicence(nomisId);
        }

        res.redirect(`/hdc/eligibility/excluded/${nomisId}`);
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

function getTaskData(licence) {
    const isEligible = getEligibility(getIn(licence, ['licence', 'eligibility']));
    const hasStarted = getHasStarted(licence);
    const hasOptedOut = getOptedOut(licence);
    const hasBassReferral = getBassReferralDecision(licence);
    const submittedToRo = addressSubmitted(licence);

    const eligibility = {
        answers: getIn(licence, ['licence', 'eligibility']),
        state: getIn(licence, ['licence', 'eligibility']) ? 'DONE' : 'UNSTARTED'
    };
    const proposedAddress = {
        state: getProposedAddressState(hasStarted, submittedToRo, hasOptedOut, hasBassReferral)
    };
    const curfewAddress = {
        state: getIn(licence, ['licence', 'licenceConditions', 'curfewAddressReview']) ? 'STARTED' : 'UNSTARTED'
    };
    const additionalConditions = {
        state: getIn(licence, ['licence', 'licenceConditions', 'standardConditions', 'nextPathDecision'])
            ? 'STARTED' : 'UNSTARTED'
    };
    const riskManagement = {
        state: getIn(licence, ['licence', 'licenceConditions', 'riskManagement']) ? 'STARTED' : 'UNSTARTED'
    };
    const reportingInstructions = {
        state: getIn(licence, ['licence', 'reportingInstructions']) ? 'STARTED' : 'UNSTARTED'
    };

    return {
        isEligible,
        hasStarted,
        hasOptedOut,
        hasBassReferral,
        submittedToRo,
        eligibility,
        proposedAddress,
        curfewAddress,
        additionalConditions,
        riskManagement,
        reportingInstructions
    };
}

function getProposedAddressState(hasStarted, submittedToRo, hasOptedOut, hasBassReferral) {
    if(submittedToRo || hasOptedOut || hasBassReferral) {
        return 'DONE';
    }
    if(hasStarted) {
        return'STARTED';
    }
    return 'UNSTARTED';
}

function getEligibility(eligibilityObject) {
    if(!eligibilityObject) {
        return false;
    }
    return eligibilityObject.excluded.decision === 'No' && eligibilityObject.suitability.decision === 'No';
}

function getHasStarted(licence) {
    return !isEmpty(getIn(licence, ['licence', 'proposedAddress', 'optOut']));
}

function getOptedOut(licence) {
    return getIn(licence, ['licence', 'proposedAddress', 'optOut', 'decision']) === 'Yes';
}

function getBassReferralDecision(licence) {
    return getIn(licence, ['licence', 'proposedAddress', 'bassReferral', 'decision']) === 'Yes';
}

function addressSubmitted(licence) {
    return getIn(licence, ['licence', 'proposedAddress', 'submit', 'licenceStatus']) === 'ADDRESS_SUBMITTED';
}
