const logger = require('../../log');
const express = require('express');

const {async} = require('../utils/middleware');
const path = require('path');
const {getLicenceStatus} = require('../utils/licenceStatus');
const {getStatusLabel} = require('../utils/licenceStatusLabels');
const {getAllowedTransition} = require('../utils/licenceStatusTransitions');
const {pickKey} = require('../utils/functionalHelpers');

module.exports = function({prisonerService, licenceService, caseListService, authenticationMiddleware, audit}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:bookingId', async(async (req, res) => {
        logger.debug('GET /taskList');

        const {bookingId} = req.params;
        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, req.user.token);
        const licence = await licenceService.getLicence(bookingId);
        const licenceWithTab = caseListService.addTabToCase(req.user.role, licence);

        const licenceStatus = getLicenceStatus(licence);
        const allowedTransition = getAllowedTransition(licenceStatus, req.user.role);
        const statusLabel = getStatusLabel(licenceStatus, req.user.role);
        const tasklistView = getTasklistView(req.user.role, licence ? licence.stage : 'UNSTARTED');

        res.render(`taskList/${tasklistView}`, {
            licenceStatus,
            licenceVersion: licence ? licence.version : 0,
            approvedVersionDetails: licence ? licence.approvedVersionDetails : 0,
            allowedTransition,
            statusLabel,
            prisonerInfo,
            bookingId,
            postApproval: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(licenceStatus.stage),
            caseListTab: licenceWithTab.tab
        });
    }));

    router.post('/eligibilityStart', async(async (req, res) => {
        logger.debug('POST /eligibilityStart');

        const {bookingId} = req.body;

        const existingLicence = await licenceService.getLicence(bookingId);

        if (!existingLicence) {
            await licenceService.createLicence(bookingId);
            audit.record('LICENCE_RECORD_STARTED', req.user.staffId, {bookingId});
        }

        res.redirect(`/hdc/eligibility/excluded/${bookingId}`);
    }));

    router.get('/image/:imageId', async(async (req, res) => {
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

const tasklistConfig = {
    caTasksEligibility: {
        stages: ['ELIGIBILITY', 'UNSTARTED'],
        role: 'CA'
    },
    caTasksPostApproval: {
        stages: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'],
        role: 'CA'
    },
    caTasksFinalChecks: {
        stages: ['PROCESSING_CA', 'PROCESSING_RO', 'APPROVAL'],
        role: 'CA'
    },
    roTasks: {
        stages: ['PROCESSING_RO', 'PROCESSING_CA', 'APPROVAL', 'ELIGIBILITY'],
        role: 'RO'
    },
    roTasksPostApproval: {
        stages: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'],
        role: 'RO'
    },
    dmTasks: {
        role: 'DM'
    }
};

function getTasklistView(role, stage) {
    function roleAndStageMatch(view) {
        if (view.role !== role) {
            return false;
        }
        if (!view.stages) {
            return true;
        }
        return view.stages.includes(stage);
    }

    return pickKey(roleAndStageMatch, tasklistConfig);
}
