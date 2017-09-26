const logger = require('../../log');

exports.getIndex = function(req, res) {
    logger.debug('GET /details');

    return res.render('details/index', detailsInfo);
};

const detailsInfo = {
    name: 'Andrews, Mark',
    aliases: 'Marky Mark',
    prisonNumber: 'A1235HG',
    dateOfBirth: '22/10/1989',
    sex: 'Male',
    location: {
        prison: 'HMP Forest Bank',
        cell: 'Cell 3',
        block: 'HB1',
        landing: 'L2'
    },
    dates: {
        sentenceExpiry: '08/02/2018',
        hdcEligibility: null,
        supervisionStart: '09/07/2017',
        supervisionEnd: '09/07/2018'
    },
    image: {
        name: 'mark_andrews.png',
        uploadedDate: '09/04/2017'
    }
};

exports.createLicence = function(req, res) {
    // TODO create licence in db, call to Delius to get discharge address info, load view
    logger.debug('POST /createLicence');
    logger.info('POST /createLicence');

    return res.render('details/index', detailsInfo);
};
