
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
    caToRo: licenceStages.PROCESSING_RO,
    caToDm: licenceStages.APPROVAL,
    roToCa: {
        'default': licenceStages.PROCESSING_CA,
        addressRejected: licenceStages.ELIGIBILITY,
        optedOut: licenceStages.ELIGIBILITY
    },
    dmToCa: licenceStages.DECIDED,
    dmToCaReturn: licenceStages.PROCESSING_CA,
    caToDmRefusal: licenceStages.APPROVAL
};

module.exports = {licenceStages, transitions};
