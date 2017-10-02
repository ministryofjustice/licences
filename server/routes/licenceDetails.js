const express = require('express');
const router = express.Router();
const {getIndex} = require('../controllers/licenceDetailsController');

router.get('/:licenceId', getIndex);

module.exports = router;
