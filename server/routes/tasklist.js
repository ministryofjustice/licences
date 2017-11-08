const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, tasklistService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/', asyncMiddleware(async (req, res, next) => {
        logger.debug('GET /tasklist');

        const dashboardDetail = await tasklistService.getDashboardDetail(req.user);

        const viewData = {
            dashboardDetail,
            moment: require('moment')
        };

        res.render(`tasklist/${req.user.roleCode}`, viewData);
    }));

    return router;
};
