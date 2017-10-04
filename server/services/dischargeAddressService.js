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

module.exports = function createDischargeAddressService() {
    return {
        getDischargeAddress: () => addressInfo
    };
};
