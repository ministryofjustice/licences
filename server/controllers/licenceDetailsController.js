const logger = require('../../log');

exports.getIndex = (req, res) => {
    logger.debug('GET /licenceDetails');

    return res.render('licenceDetails/index', viewModel);
};

const viewModel = {
    additionalConditions: [

    ],
    dischargeAddress: {
        line1: '19 Grantham Road',
        line2: 'Sparbrook',
        line3: '',
        postCode: 'B11 1LX',
        contact: 'Alison Andrews',
        contactNumber: '07889814455',
        homeAddress: false,
        reason: 'This is my sister\'s place and she\'s happy for me to stay for a few months'
    },
    reporting: {
        name: '',
        address: {
            line1: '19 Grantham Road',
            line2: 'Sparbrook',
            line3: '',
            postCode: 'B11 1LX'
        },
        contactNumber: '0121 248 6400',
        dateTime: ''
    }
};
