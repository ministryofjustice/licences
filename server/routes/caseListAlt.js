const express = require('express');
const {async} = require('../utils/middleware');

module.exports = function({logger, caseListService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/', (req, res) => {
        res.redirect('/caseList/ready');
    });

    router.get('/:tab', async(async (req, res) => {
        logger.debug('GET /caseList');

        const hdcEligible = await caseListService.getHdcCaseList(req.user.token, req.user.username, req.user.role);

        return res.render('caseList/alt/index', {hdcEligible});
    }));

    return router;
};
