const express = require('express');
const router = express.Router();
const {getIndex} = require('../controllers/dashboardController');

router.use(function(req, res, next) {
    if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

router.get('/', getIndex);

module.exports = router;
