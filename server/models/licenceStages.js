
const licenceStages = {
    UNSTARTED: 'UNSTARTED',
    DEFAULT: 'ELIGIBILITY',
    ELIGIBILITY: 'ELIGIBILITY',
    PROCESSING_RO: 'PROCESSING_RO',
    PROCESSING_CA: 'PROCESSING_CA',
    APPROVAL: 'APPROVAL',
    DECIDED: 'DECIDED',
    MODIFIED_APPROVAL: 'MODIFIED_APPROVAL'
};

const transitions = {
    caToRo: licenceStages.PROCESSING_RO,
    caToDm: licenceStages.APPROVAL,
    roToCa: licenceStages.PROCESSING_CA,
    dmToCa: licenceStages.DECIDED,
    dmToCaReturn: licenceStages.PROCESSING_CA,
    caToDmRefusal: licenceStages.APPROVAL,
    roToCaAddressRejected: licenceStages.ELIGIBILITY,
    roToCaOptedOut: licenceStages.ELIGIBILITY
};

module.exports = {licenceStages, transitions};
