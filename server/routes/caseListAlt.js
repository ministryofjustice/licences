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
        RO: ['PROCESSING_RO', 'PROCESSING_CA', 'APPROVAL', 'DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'],
        DM: ['APPROVAL', 'DECIDED']
    };

    if (!interestedStatuses[role]) {
        return caseList;
    }

    return caseList.filter(prisoner => interestedStatuses[role].includes(prisoner.stage));
}
