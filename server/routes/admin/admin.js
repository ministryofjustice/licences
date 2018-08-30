const express = require('express');
const {asyncMiddleware} = require('../../utils/middleware');

module.exports = function(
    {logger, userService, authenticationMiddleware}) {

    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/roUsers', asyncMiddleware(async (req, res) => {
        const users = await userService.getRoUsers();
        return res.render('admin/users/list', {users});
    }));

    return router;
};
