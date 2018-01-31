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
            decision: '',
            reason: []
        },
        suitability: {
            decision: '',
            reason: []
        },
        crdTime: {decision: ''}
    },
    proposedAddress: {
        optOpt: {
            decision: '',
            reason: ''
        },
        bassReferral: {
            decision: '',
            proposedCounty: '',
            proposedTown: ''
        }
    }

};


module.exports = {
    licenceModel
};
