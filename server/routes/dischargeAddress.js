const express = require('express');
const router = express.Router();
const {getIndex, postAddress} = require('../controllers/dischargeAddressController');

router.use(function(req, res, next) {
    if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

router.get('/:licenceId', getIndex);
router.post('/:licenceId', postAddress);

module.exports = router;
