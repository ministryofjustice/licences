const licenceModel = {
    firstName: '',
    lastName: '',
    nomisId: '',
    establishment: '',
    agencyLocationId: '',
    dischargeDate: '',
    additionalConditions: {},
    dischargeAddress: {
        address1: '',
        address2: '',
        address3: '',
        postCode: ''
    },
    reporting: {
        name: '',
        address1: '',
        address2: '',
        address3: '',
        postCode: '',
        telephone: '',
        date: '',
        hour: '',
        minute: ''
    },
    eligibility: {
        excluded: {
            reason: 'excludedReasons'
        },
        unsuitable: {
            reason: 'unsuitableReasons'
        },
        crdTime: ''
    },
    optOut: {
        decision: {
            reason: 'reason'
        }
    },
    bassReferral: {
        decision: {}
    }
};


module.exports = {
    licenceModel
};
