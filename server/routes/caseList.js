const express = require('express');
const {asyncMiddleware} = require('../utils/middleware');
const {getIn, isEmpty} = require('../utils/functionalHelpers');

const caseListTabs = {
    CA: [
        {
            id: 'ready', text: 'Check eligibility', licenceStages: ['UNSTARTED', 'ELIGIBILITY'],
            statusFilter: {ELIGIBILITY: ['Opted out', 'Eligible']}
        },
        {
            id: 'getAddress', text: 'Get address', licenceStages: ['ELIGIBILITY'],
            licenceStatus: ['Eligible', 'Getting address', 'Address rejected', 'Opted out']
        },
        {id: 'submittedRo', text: 'Responsible officer', licenceStages: ['PROCESSING_RO']},
        {id: 'reviewCase', text: 'Review case', licenceStages: ['PROCESSING_CA']},
        {id: 'submittedDm', text: 'Decision maker', licenceStages: ['APPROVAL']},
        {
            id: 'create',
            text: 'Create licence',
            licenceStages: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'],
            licenceStatus: 'Approved'
        }
    ],
    RO: [
        {id: 'ready', text: 'Ready to check', licenceStages: ['PROCESSING_RO'], licenceStatus: 'Ready to check'},
        {id: 'checking', text: 'Checking', licenceStages: ['PROCESSING_RO'], licenceStatus: 'Assessment ongoing'},
        {id: 'withPrison', text: 'With prison', licenceStages: ['PROCESSING_CA', 'APPROVAL']},
        {id: 'approved', text: 'Approved', licenceStages: ['DECIDED'], licenceStatus: 'Approved'}
    ],
    DM: [
        {id: 'ready', text: 'Ready to approve', licenceStages: ['APPROVAL']},
        {
            id: 'postponed',
            text: 'Postponed',
            licenceStages: ['PROCESSING_CA'],
            licenceStatus: 'Postponed'
        },
        {id: 'approved', text: 'Approved', licenceStages: ['DECIDED'], licenceStatus: 'Approved'},
        {id: 'refused', text: 'Refused', licenceStages: ['DECIDED'], licenceStatus: 'Refused'}
    ]
};

module.exports = function({logger, caseListService, authenticationMiddleware}) {
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
            res.redirect('/caseList/' + tabsForRole[0].id);
        }

        const hdcEligible = await caseListService.getHdcCaseList(req.user.username, req.user.role);
        const filteredToTabs = filterToTabs(hdcEligible, selectedTabConfig);

        return res.render('caseList/index', {hdcEligible: filteredToTabs, tabsForRole, selectedTabConfig});
    }));

    return router;
};

function filterToTabs(offenders, tabConfig) {
    return offenders.filter(offender => {

        const correctStage = tabConfig.licenceStages.includes(offender.stage);
        const correctStatus = tabConfig.licenceStatus ? tabConfig.licenceStatus.includes(offender.status) : true;

        const statusFilter = getIn(tabConfig, ['statusFilter', offender.stage]);
        const filterStatus = statusFilter && statusFilter.includes(offender.status);

        return correctStage && correctStatus && !filterStatus;
    });
}
