const logger = require('../../log');

exports.getIndex = (req, res) => {
    logger.debug('GET /dischargeAddress');
    // TODO get licence info from database, use to get discharge address from delius extract

    return res.render('dischargeAddress/index', addressInfo);
};

exports.postAddress = (req, res) => {
    logger.debug('POST /dischargeAddress');
    // TODO add address info to licence redirect to conditions page

    return res.render('dischargeAddress/index', addressInfo);
};

const addressInfo = {
    licenceNumber: 'AB111111',
    line1: '19 Grantham Road',
    line2: 'Sparbrook',
    line3: '',
    postCode: 'B11 1LX',
    contact: 'Alison Andrews',
    contactNumber: '07889814455',
    homeAddress: false,
    reason: 'This is my sister\'s place and she\'s happy for me to stay for a few months'
};
