const logger = require('../log');



exports.getIndex = function(req, res) {
    logger.debug('GET /loggedin');

    return res.render('loggedin/index');
};

