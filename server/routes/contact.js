const express = require('express');

const {asyncMiddleware} = require('../utils/middleware');

module.exports = function({logger, userAdminService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/ro/', asyncMiddleware(async (req, res) => {
        const roUsers = await userAdminService.getRoUsers();
        return res.render('contact/roList', {roUsers});
    }));

    router.get('/ro/:deliusUserId', asyncMiddleware(async (req, res) => {

        const {deliusUserId} = req.params;
        const contact = await userAdminService.getRoUserByDeliusId(deliusUserId);

        return res.render('contact/ro', {contact});
    }));

    return router;
};

