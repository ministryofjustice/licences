const {asyncMiddleware} = require('../utils/middleware');
const path = require('path');
const {getLicenceStatus} = require('../utils/licenceStatus');
const {getStatusLabel} = require('../utils/licenceStatusLabels');
const {getAllowedTransition} = require('../utils/licenceStatusTransitions');
const {pickKey, isEmpty} = require('../utils/functionalHelpers');
const getTaskListModel = require('./viewModels/taskListModels');

module.exports = ({prisonerService, licenceService, caseListService, audit}) => router => {

    router.get('/:bookingId', asyncMiddleware(async (req, res) => {
        const {bookingId} = req.params;
        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, res.locals.token);
        const licence = await licenceService.getLicence(bookingId);

        const licenceStatus = getLicenceStatus(licence);
        const allowedTransition = getAllowedTransition(licenceStatus, req.user.role);
        const statusLabel = getStatusLabel(licenceStatus, req.user.role);

        const taskListView = getTaskListView(req.user.role, licence ? licence.stage : 'UNSTARTED', prisonerInfo);
        const taskListModel = getTaskListModel(taskListView, licenceStatus, allowedTransition);

        res.render(isEmpty(taskListModel) ? `taskList/${taskListView}` : 'taskList/taskListBuilder', {
            licenceStatus,
            licenceVersion: licence ? licence.version : 0,
            approvedVersionDetails: licence ? licence.approvedVersionDetails : 0,
            allowedTransition,
            statusLabel,
            prisonerInfo,
            bookingId,
            taskListModel,
            postApproval: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(licenceStatus.stage)
        });
    }));

    router.post('/eligibilityStart', asyncMiddleware(async (req, res) => {
        const {bookingId} = req.body;

        const existingLicence = await licenceService.getLicence(bookingId);

        if (!existingLicence) {
            await licenceService.createLicence({bookingId});
            audit.record('LICENCE_RECORD_STARTED', req.user.staffId, {bookingId});
        }

        res.redirect(`/hdc/eligibility/excluded/${bookingId}`);
    }));

    router.post('/varyStart', asyncMiddleware(async (req, res) => {
        const {bookingId} = req.body;
        await licenceService.createLicence({
            bookingId,
            data: {variedFromLicenceNotInSystem: true},
            stage: 'VARY'});
        audit.record('VARY_NOMIS_LICENCE_CREATED', req.user.staffId, {bookingId});

        res.redirect(`/hdc/vary/evidence/${bookingId}`);
    }));

    router.get('/image/:imageId', asyncMiddleware(async (req, res) => {
        const prisonerImage = await prisonerService.getPrisonerImage(req.params.imageId, res.locals.token);

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

const taskListConfig = {
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

function getTaskListView(role, stage, {released}) {
    // TODO: Update when the shape of the nomis prisoner object is known
    if (released) {
       return 'vary';
    }

    function roleAndStageMatch(view) {
        if (view.role !== role) {
            return false;
        }
        if (!view.stages) {
            return true;
        }
        return view.stages.includes(stage);
    }

    return pickKey(roleAndStageMatch, taskListConfig);
}
