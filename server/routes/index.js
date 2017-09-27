const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    return res.render('index');
});

module.exports = router;
