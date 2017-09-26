const express = require('express');
const router = express.Router();
const {getIndex, createLicence} = require('../controllers/detailsController');

router.use(function(req, res, next) {
    if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

router.get('/:prisonNumber', getIndex);
router.post('/:prisonNumber', createLicence);

module.exports = router;
