
const licenceStages = {
    UNSTARTED: 'UNSTARTED',
    DEFAULT: 'ELIGIBILITY',
    ELIGIBILITY: 'ELIGIBILITY',
    PROCESSING_RO: 'PROCESSING_RO',
    PROCESSING_CA: 'PROCESSING_CA',
    APPROVAL: 'APPROVAL',
    DECIDED: 'DECIDED'
};

const transitions = {
    CA: {
        RO: licenceStages.PROCESSING_RO,
        DM: licenceStages.APPROVAL
    },
    RO: {
        CA: {
            'default': licenceStages.PROCESSING_CA,
            addressRejected: licenceStages.ELIGIBILITY
        }

    },
    DM: {
        CA: licenceStages.DECIDED
    }
};

module.exports = {licenceStages, transitions};
