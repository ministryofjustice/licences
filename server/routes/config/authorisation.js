module.exports = {

    // eligibility
    '/hdc/eligibility/': {
        authorisedRoles: ['CA']
    },
    '/hdc/proposedAddress/optOut/': {
        authorisedRoles: ['CA']
    },
    '/hdc/proposedAddress/addressProposed/': {
        authorisedRoles: ['CA']
    },
    'hdc/proposedAddress/bassReferral/': {
        authorisedRoles: ['CA']
    },
    'hdc/proposedAddress/curfewAddress': {
        authorisedRoles: ['CA', 'RO']
    },
    'hdc/eligibility/exceptionalCircumstances/': {
        authorisedRoles: ['CA']
    },

    // processing ro
    '/hdc/curfew/': {
        authorisedRoles: ['RO', 'CA']
    },
    '/hdc/risk/': {
        authorisedRoles: ['RO', 'CA']
    },
    '/hdc/licenceConditions/': {
        authorisedRoles: ['RO', 'CA']
    },
    '/hdc/reporting/': {
        authorisedRoles: ['RO', 'CA']
    },

    // processing ca
    '/hdc/finalChecks/': {
        authorisedRoles: ['CA']
    },

    // approval
    '/hdc/approval/': {
        authorisedRoles: ['DM']
    },

    // post approval
    '/hdc/pdf/': {
        authorisedRoles: ['CA']
    },

    // send
    '/hdc/send/addressReview/': {
        authorisedRoles: ['CA']
    },
    '/hdc/send/finalChecks/': {
        authorisedRoles: ['RO']
    },
    '/hdc/send/approval/': {
        authorisedRoles: ['CA']
    },
    '/hdc/send/decided/': {
        authorisedRoles: ['DM']
    },
    '/hdc/send/return/': {
        authorisedRoles: ['DM']
    },
    '/hdc/send/refusal/': {
        authorisedRoles: ['CA']
    },
    '/hdc/send/addressRejected/': {
        authorisedRoles: ['RO']
    },
    '/hdc/send/optedOut/': {
        authorisedRoles: ['RO']
    }

};
