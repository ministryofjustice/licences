const express = require('express');
const {asyncMiddleware} = require('../utils/middleware');
const {getIn, isEmpty} = require('../utils/functionalHelpers');

const caseListTabs = {
    CA: [
        {
            id: 'ready', text: 'Ready to process', licenceStages: ['UNSTARTED', 'ELIGIBILITY'],
            statusFilter: {ELIGIBILITY: 'Opted out'}
        },
        {
            id: 'submittedRo', text: 'Submitted to RO', licenceStages: ['PROCESSING_RO'],
            statusFilter: {PROCESSING_RO: 'Opted out'}
        },
        {id: 'finalChecks', text: 'Final checks', licenceStages: ['PROCESSING_CA']},
        {id: 'submittedDm', text: 'Submitted to DM', licenceStages: ['APPROVAL']},
        {
            id: 'optedOut', text: 'Opted out', licenceStages: ['ELIGIBILITY', 'PROCESSING_RO'],
            licenceStatus: 'Opted out'
        },
        {id: 'decided', text: 'Decided', licenceStages: ['DECIDED']}
    ],
    RO: [
        {id: 'ready', text: 'Ready to process', licenceStages: ['PROCESSING_RO']},
        {id: 'finalChecks', text: 'Final checks', licenceStages: ['PROCESSING_CA']},
        {id: 'submittedDm', text: 'Submitted to DM', licenceStages: ['APPROVAL']},
        {id: 'active', text: 'Active licences', licenceStages: ['DECIDED']}
    ],
    DM: [
        {id: 'ready', text: 'Ready to approve', licenceStages: ['APPROVAL']},
        {id: 'approved', text: 'Approved', licenceStages: ['DECIDED'], licenceStatus: 'Approved'},
        {id: 'refused', text: 'Refused', licenceStages: ['DECIDED'], licenceStatus: 'Refused'}
    ]
};

module.exports = function({logger, caseListService, authenticationMiddleware, audit}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/', (req, res) => {
        const tabsForRole = getIn(caseListTabs, [req.user.role]);
        res.redirect('/caseList/' + tabsForRole[0].id);
    });

    router.get('/:tab', asyncMiddleware(async (req, res) => {
        logger.debug('GET /caseList');
        const tabsForRole = getIn(caseListTabs, [req.user.role]);
        const selectedTabConfig = tabsForRole.find(tab => tab.id === req.params.tab);

        if (isEmpty(selectedTabConfig)) {
            audit.record('VIEW_CASELIST', req.user.email, {tab: tabsForRole[0].id});
            res.redirect('/caseList/' + tabsForRole[0].id);
        }

        const hdcEligible = await caseListService.getHdcCaseList(req.user.username, req.user.role);
        const filteredToTabs = filterToTabs(hdcEligible, selectedTabConfig);

        audit.record('VIEW_CASELIST', req.user.email, {tab: selectedTabConfig.id});

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
