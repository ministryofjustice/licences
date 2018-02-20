const express = require('express');
const {asyncMiddleware} = require('../utils/middleware');

module.exports = function({logger, caseListService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/', asyncMiddleware(async (req, res) => {
        logger.debug('GET /caseList');
        const hdcEligible = await caseListService.getHdcCaseList(req.user);

        return res.render('caseList/index', {hdcEligible});
    }));

    return router;
};

