const express = require('express');
const {async} = require('../utils/middleware');
const {getIn, isEmpty} = require('../utils/functionalHelpers');
const caseListTabs = require('./config/caseListTabs');

module.exports = function({logger, caseListService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/', (req, res) => {
        const tabsForRole = getIn(caseListTabs, [req.user.role]);
        res.redirect('/caseList/' + tabsForRole[0].id);
    });

    router.get('/:tab', async(async (req, res) => {
        logger.debug('GET /caseList');
        const tabsForRole = getIn(caseListTabs, [req.user.role]);
        const selectedTabConfig = tabsForRole.find(tab => tab.id === req.params.tab);

        if (isEmpty(selectedTabConfig)) {
            res.redirect('/caseList/' + tabsForRole[0].id);
        }

        const hdcEligible = await caseListService.getHdcCaseList(req.user.token, req.user.username, req.user.role);
        const caseListWithTabs = caseListService.addTabToCases(req.user.role, hdcEligible);
        const filteredToTabs = caseListWithTabs.filter(offender => offender && offender.tab === req.params.tab);

        return res.render('caseList/index', {hdcEligible: filteredToTabs, tabsForRole, selectedTabConfig});
    }));

    return router;
};
