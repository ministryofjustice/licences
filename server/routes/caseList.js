const logger = require('../../log');
const express = require('express');
const {asyncMiddleware} = require('../utils/middleware');

module.exports = function({caseListService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/', asyncMiddleware(async (req, res) => {
        logger.debug('GET /caseList');

        const hdcEligible = await caseListService.getHdcCaseList(req.user.token, req.user.username, req.user.role);
        const filteredCaseList = getFilteredList(hdcEligible, req.user.role);

        return res.render('caseList/index', {hdcEligible: filteredCaseList, labels});
    }));

    return router;
};

function getFilteredList(caseList, role) {

    const interestedStatuses = {
        RO: [
            {stage: 'PROCESSING_RO'},
            {stage: 'PROCESSING_CA'},
            {stage: 'APPROVAL'},
            {stage: 'DECIDED'},
            {stage: 'MODIFIED'},
            {stage: 'MODIFIED_APPROVAL'}
        ],
        DM: [
            {stage: 'APPROVAL'},
            {stage: 'DECIDED'},
            {stage: 'PROCESSING_CA', status: 'Postponed'}
        ]
    };

    if (!interestedStatuses[role]) {
        return caseList;
    }

    return caseList.filter(prisoner => {
        const includedStage = interestedStatuses[role].find(config => prisoner.stage === config.stage);

        if (!includedStage) {
            return false;
        }

        if (includedStage.status) {
            return includedStage.status === prisoner.status;
        }

        return true;
    });
}

const labels = {
    ca: {
        'Not started': 'Start now',
        'Checking eligibility': 'Continue',
        Eligible: 'Continue',
        'Getting address': 'Continue',
        'Address rejected': 'Continue',
        'Review case': 'Continue',
        'Create licence': 'Continue',
        'Licence created': 'Continue',
        'Licence updated': 'Continue',
        'Presumed unsuitable': 'Change',
        'Opted out': 'Change',
        'Address withdrawn': 'Change',
        Postponed: 'Change'
    },
    ro: {
        'Address provided': 'Start now',
        'Checking address': 'Continue',
        'Assessment ongoing': 'Continue'
    },
    dm: {
        'Make decision': 'Start now',
        'Awaiting refusal': 'Start now',
        Postponed: 'Change'
    }
};
