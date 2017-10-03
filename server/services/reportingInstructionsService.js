const reportingInfo = {
    name: '',
    address: {
        line1: 'Birmingham Probation Office',
        line2: '11-15 Lower Essex Street',
        line3: 'Birmingham',
        postCode: 'B5 6SN'
    },
    telephone: '01212486400',
    DateTime: ''
};

module.exports = function createReportingService() {
    return {
        getExistingInputs: () => reportingInfo
    };
};
