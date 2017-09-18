'use strict';
let express = require('express');

const {
    getIndex
} = require('../controllers/loggedinController');

// eslint-disable-next-line
let router = express.Router();

router.use(function(req, res, next) {
    if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

router.get('/', getIndex);

module.exports = router;
