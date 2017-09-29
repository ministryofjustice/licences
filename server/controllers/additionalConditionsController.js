const logger = require('../../log');

exports.getIndex = (req, res) => {
    logger.debug('GET /additionalConditions');
    // TODO get licence info from database, use to get discharge address from delius extract

    return res.render('additionalConditions/index', {licenceId: req.params.licenceId});
};
