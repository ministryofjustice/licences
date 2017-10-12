const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, tasklistService, userManager, audit, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/', asyncMiddleware(async (req, res, next) => {
        logger.debug('GET /tasklist');

        const user = userManager.getUser();
        const upcomingReleases = await tasklistService.getDashboardDetail(user);

        const viewData = {
            required: upcomingReleases,
            moment: require('moment')
        };

        audit.record('VIEW_DASHBOARD', user);

        res.render('tasklist/index', viewData);
    }));

    return router;
};
