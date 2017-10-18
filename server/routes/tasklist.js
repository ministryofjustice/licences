const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, tasklistService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/', asyncMiddleware(async (req, res, next) => {
        logger.debug('GET /tasklist');

        const upcomingReleases = await tasklistService.getDashboardDetail(req.user.staffId, req.user.token);

        const viewData = {
            required: upcomingReleases,
            moment: require('moment')
        };

        res.render('tasklist/index', viewData);
    }));

    return router;
};
