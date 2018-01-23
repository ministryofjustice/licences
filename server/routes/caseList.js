const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, caseListService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/', asyncMiddleware(async (req, res) => {
        logger.debug('GET /caseList');
        const hdcEligible = await caseListService.getHdcCaseList(req.user);

        return res.render('caseList/index', {hdcEligible, role: req.user.roleCode});
    }));

    return router;
};

