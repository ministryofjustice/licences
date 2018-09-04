const express = require('express');
const config = require('../config');

module.exports = function() {
    const router = express.Router();

    router.get('/', (req, res) => {
        if (req.user && config.roles.admin.includes(req.user.role)) {
            // TODO next
            //  return res.redirect('/admin/');
        }
        res.redirect('/caseList/');
    });

    return router;
};
