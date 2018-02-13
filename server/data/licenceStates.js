
const states = {
    DEFAULT: 'ELIGIBILITY',
    ELIGIBILITY: 'ELIGIBILITY',
    PROCESSING_RO: 'PROCESSING_RO',
    PROCESSING_CA: 'PROCESSING_CA',
    APPROVAL: 'APPROVAL',
    DECIDED: 'DECIDED'
};

const transitions = {
    CA: {
        RO: states.PROCESSING_RO,
        DM: states.APPROVAL
    },
    RO: {
        CA: states.PROCESSING_CA
    },
    DM: {
        CA: states.DECIDED
    }
};

module.exports = {states, transitions};
