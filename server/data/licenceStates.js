
const states = {
    DEFAULT: 'ELIGIBILITY',
    ELIGIBILITY: 'ELIGIBILITY',
    PROCESSING_RO: 'PROCESSING_RO',
    PROCESSING_CA: 'PROCESSING_CA',
    APPROVAL: 'APPROVAL',
    APPROVED: 'APPROVED'
};

const transitions = {
    CA: {
        RO: 'PROCESSING_RO',
        DM: 'APPROVAL'
    },
    RO: {
        CA: 'PROCESSING_CA'
    },
    DM: {
        CA: 'APPROVED'
    }
};

module.exports = {states, transitions};
