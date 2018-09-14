const express = require('express');
const {async} = require('../utils/middleware');

module.exports = function({logger, caseListService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/', (req, res) => {
        res.redirect('/caseList/ready');
    });

    router.get('/:tab', async(async (req, res) => {
        logger.debug('GET /caseList');

        const hdcEligible = await caseListService.getHdcCaseList(req.user.token, req.user.username, req.user.role);
        const filteredCaseList = getFilteredList(hdcEligible, req.user.role);

        return res.render('caseList/alt/index', {hdcEligible: filteredCaseList});
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
