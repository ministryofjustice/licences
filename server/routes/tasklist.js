const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, tasklistService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/', asyncMiddleware(async (req, res, next) => {
        logger.debug('GET /tasklist');

        const upcomingReleases = await getUpcomingReleases(req.user);
        const dashboardDetail = await tasklistService.getDashboardDetail(upcomingReleases);

        const viewData = {
            dashboardDetail,
            moment: require('moment')
        };

        res.render(`tasklist/${req.user.roleCode}`, viewData);
    }));

    async function getUpcomingReleases(user) {
        switch (user.roleCode) {
            case 'OM':
                return tasklistService.getUpcomingReleasesByDeliusOffenderList(user.staffId, user.token);
            case 'OMU':
            case 'PM':
                return tasklistService.getUpcomingReleasesByUser(user.staffId, user.token);
            default:
                throw new Error('Invalid user role');
        }
    }

    return router;
};
