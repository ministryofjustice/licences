const express = require('express');
const {asyncMiddleware} = require('../utils/middleware');
const {getIn, isEmpty} = require('../utils/functionalHelpers');

const caseListTabs = {
    CA: [
        {id: 'ready', text: 'Ready to process', licenceStages: ['UNSTARTED', 'ELIGIBILITY']},
        {id: 'submittedRo', text: 'Submitted to RO', licenceStages: ['PROCESSING_RO']},
        {id: 'finalChecks', text: 'Final checks', licenceStages: ['PROCESSING_CA']},
        {id: 'submittedDm', text: 'Submitted to DM', licenceStages: ['APPROVAL']},
        {id: 'approved', text: 'Approved', licenceStages: ['DECIDED'], licenceStatus: 'Approved'},
        {id: 'refused', text: 'Refused', licenceStages: ['DECIDED'], licenceStatus: 'Refused'}
    ],
    RO: [
        {id: 'ready', text: 'Ready to process', licenceStages: ['PROCESSING_RO']},
        {
            id: 'submittedPca',
            text: 'Submitted to PCA',
            licenceStages: ['PROCESSING_CA', 'APPROVAL'],
            statusFilter: {PROCESSING_CA: 'Postponed'}
        },
        {id: 'postponed', text: 'Postponed', licenceStages: ['PROCESSING_CA'], licenceStatus: 'Postponed'},
        {id: 'active', text: 'Active licences', licenceStages: ['DECIDED']}
    ],
    DM: [
        {id: 'ready', text: 'Ready to approve', licenceStages: ['APPROVAL']},
        {id: 'approved', text: 'Approved', licenceStages: ['DECIDED'], licenceStatus: 'Approved'},
        {id: 'refused', text: 'Refused', licenceStages: ['DECIDED'], licenceStatus: 'Refused'}
    ]
};

module.exports = function({logger, caseListService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/', (req, res) => {
        const tabsForRole = getIn(caseListTabs, [req.user.role]);
        res.redirect('/caseList/'+tabsForRole[0].id);
    });

    router.get('/:tab', asyncMiddleware(async (req, res) => {
        logger.debug('GET /caseList');
        const tabsForRole = getIn(caseListTabs, [req.user.role]);
        const selectedTabConfig = tabsForRole.find(tab => tab.id === req.params.tab);

        if(isEmpty(selectedTabConfig)) {
            res.redirect('/caseList/'+tabsForRole[0].id);
        }

        const hdcEligible = await caseListService.getHdcCaseList(req.user);
        const filteredToTabs = filterToTabs(hdcEligible, selectedTabConfig);

        return res.render('caseList/index', {hdcEligible: filteredToTabs, tabsForRole, selectedTabConfig});
    }));

    return router;
};

function filterToTabs(offenders, tabConfig) {
    return offenders.filter(offender => {
        const correctStage = tabConfig.licenceStages.includes(offender.stage);
        const correctStatus = tabConfig.licenceStatus ? tabConfig.licenceStatus === offender.status : true;
        const filterStatus = getIn(tabConfig, ['statusFilter', offender.stage]) === offender.status;

        return correctStage && correctStatus && !filterStatus;
    });
}
