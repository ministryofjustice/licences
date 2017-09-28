const express = require('express');
const router = express.Router();
const {getIndex} = require('../controllers/additionalConditionsController');

router.use(function(req, res, next) {
    if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

router.get('/:licenceId', getIndex);

module.exports = router;
