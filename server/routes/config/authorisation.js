module.exports = {

    // eligibility
    '/hdc/eligibility/': {
        authorised: [{role: 'CA'}]
    },
    '/hdc/proposedAddress/optOut/': {
        authorised: [{role: 'CA'}]
    },
    '/hdc/proposedAddress/addressProposed/': {
        authorised: [{role: 'CA'}]
    },
    'hdc/proposedAddress/bassReferral/': {
        authorised: [{role: 'CA'}]
    },
    'hdc/proposedAddress/curfewAddress': {
        authorised: [{role: 'CA'}, {role: 'RO'}]
    },
    'hdc/eligibility/exceptionalCircumstances/': {
        authorised: [{role: 'CA'}]
    },

    // processing ro
    '/hdc/curfew/': {
        authorised: [{role: 'RO'}, {role: 'CA', stage: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL']}]
    },
    '/hdc/risk/': {
        authorised: [{role: 'RO'}, {role: 'CA', stage: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL']}]
    },
    '/hdc/licenceConditions/': {
        authorised: [{role: 'RO'}, {role: 'CA', stage: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL']}]
    },
    '/hdc/reporting/': {
        authorised: [{role: 'RO'}, {role: 'CA', stage: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL']}]
    },

    // processing ca
    '/hdc/finalChecks/': {
        authorised: [{role: 'CA'}]
    },

    // approval
    '/hdc/approval/': {
        authorised: [{role: 'DM'}]
    },

    // post approval
    '/hdc/pdf/': {
        authorised: [{role: 'CA'}]
    },

    // send
    '/hdc/send/addressReview/': {
        authorised: [{role: 'CA'}]
    },
    '/hdc/send/finalChecks/': {
        authorised: [{role: 'RO'}]
    },
    '/hdc/send/approval/': {
        authorised: [{role: 'CA'}]
    },
    '/hdc/send/decided/': {
        authorised: [{role: 'DM'}]
    },
    '/hdc/send/return/': {
        authorised: [{role: 'DM'}]
    },
    '/hdc/send/refusal/': {
        authorised: [{role: 'CA'}]
    },
    '/hdc/send/addressRejected/': {
        authorised: [{role: 'RO'}]
    },
    '/hdc/send/optedOut/': {
        authorised: [{role: 'RO'}]
    }

};
