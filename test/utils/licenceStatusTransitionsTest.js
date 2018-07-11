const {getAllowedTransitions} = require('../../server/utils/licenceStatusTransitions');

describe('getAllowedTransitions', () => {
    it('should allow DM to CA for DM when approval task done', () => {
        const status = {
            stage: 'APPROVAL',
            tasks: {
                approval: 'DONE'
            }
        };

        const allowed = getAllowedTransitions(status, 'DM');
        expect(allowed.dmToCa).to.eql(true);
    });

    it('should not allow DM to CA for DM when approval task not done', () => {
        const status = {
            stage: 'APPROVAL',
            tasks: {
                approval: 'UNSTARTED'
            }
        };

        const allowed = getAllowedTransitions(status, 'DM');
        expect(allowed.dmToCa).to.eql(false);
    });

    it('should allow RO to CA for RO when all RO tasks done', () => {
        const status = {
            stage: 'PROCESSING_RO',
            tasks: {
                curfewAddressReview: 'DONE',
                curfewHours: 'DONE',
                licenceConditions: 'DONE',
                riskManagement: 'DONE',
                reportingInstructions: 'DONE'
            }
        };

        const allowed = getAllowedTransitions(status, 'RO');
        expect(allowed.roToCa).to.eql(true);
    });

    it('should not allow RO to CA for RO when any RO tasks not done', () => {
        const status = {
            stage: 'PROCESSING_RO',
            tasks: {
                curfewAddressReview: 'DONE',
                curfewHours: 'DONE',
                licenceConditions: 'DONE',
                riskManagement: 'UNSTARTED',
                reportingInstructions: 'DONE'
            }
        };

        const allowed = getAllowedTransitions(status, 'RO');
        expect(allowed.roToCa).to.eql(false);
    });

    it('should allow RO to CA for RO when address rejected even when other tasks not done', () => {
        const status = {
            stage: 'PROCESSING_RO',
            tasks: {
                curfewAddressReview: 'DONE',
                curfewHours: 'UNSTARTED',
                licenceConditions: 'UNSTARTED',
                riskManagement: 'UNSTARTED',
                reportingInstructions: 'UNSTARTED'
            },
            decisions: {
                curfewAddressApproved: 'rejected'
            }
        };

        const allowed = getAllowedTransitions(status, 'RO');
        expect(allowed.roToCa).to.eql(true);
    });

    it('should not allow RO to CA for RO when address undecided', () => {
        const status = {
            stage: 'PROCESSING_RO',
            tasks: {
                curfewAddressReview: 'DONE',
                curfewHours: 'UNSTARTED',
                licenceConditions: 'UNSTARTED',
                riskManagement: 'UNSTARTED',
                reportingInstructions: 'UNSTARTED'
            }
        };

        const allowed = getAllowedTransitions(status, 'RO');
        expect(allowed.roToCa).to.eql(false);
    });

    it('should allow CA to RO in the ELIGIBILITY stage when all CA tasks done and decisions OK', () => {
        const status = {
            stage: 'ELIGIBILITY',
            tasks: {
                exclusion: 'DONE',
                crdTime: 'DONE',
                suitability: 'DONE',
                optOut: 'DONE',
                bassReferral: 'DONE',
                curfewAddress: 'DONE',
                finalChecks: 'DONE'
            },
            decisions: {
                postponed: false,
                curfewAddressApproved: 'approved',
                excluded: false
            }
        };

        const allowed = getAllowedTransitions(status, 'CA');
        expect(allowed.caToRo).to.eql(true);
        expect(allowed.caToDm).to.eql(false);
    });

    it('should not allow CA to RO in the ELIGIBILITY stage when HDC has been opted out', () => {
        const status = {
            stage: 'ELIGIBILITY',
            tasks: {
                exclusion: 'DONE',
                crdTime: 'DONE',
                suitability: 'DONE',
                optOut: 'DONE',
                bassReferral: 'DONE',
                curfewAddress: 'DONE',
                finalChecks: 'DONE'
            },
            decisions: {
                optedOut: true
            }
        };

        const allowed = getAllowedTransitions(status, 'CA');
        expect(allowed.caToRo).to.eql(false);
    });

    it('should allow CA to DM in the PROCESSING_CA stage when all CA tasks done and decisions OK', () => {
        const status = {
            stage: 'PROCESSING_CA',
            tasks: {
                exclusion: 'DONE',
                crdTime: 'DONE',
                suitability: 'DONE',
                optOut: 'DONE',
                bassReferral: 'DONE',
                curfewAddress: 'DONE',
                finalChecks: 'DONE'
            },
            decisions: {
                postponed: false,
                curfewAddressApproved: 'approved',
                excluded: false
            }
        };

        const allowed = getAllowedTransitions(status, 'CA');

        expect(allowed.caToDm).to.eql(true);
    });

    it('should not allow CA to DM in the PROCESSING_CA when any CA tasks not done and decisions not OK', () => {
        const status = {
            stage: 'PROCESSING_CA',
            tasks: {
                exclusion: 'DONE',
                crdTime: 'DONE',
                suitability: 'UNSTARTED',
                optOut: 'DONE',
                bassReferral: 'DONE'
            },
            decisions: {
                postponed: false,
                curfewAddressApproved: 'approved',
                excluded: true
            }
        };

        const allowed = getAllowedTransitions(status, 'CA');

        expect(allowed.caToDm).to.eql(false);
    });

    it('should allow CA to DM when DM does not approve application to continue', () => {
        const status = {
            stage: 'ELIGIBILITY',
            tasks: {
                exclusion: 'DONE',
                crdTime: 'DONE',
                suitability: 'DONE',
                optOut: 'DONE',
                bassReferral: 'DONE',
                curfewAddress: 'DONE',
                finalChecks: 'DONE'
            },
            decisions: {
                insufficientTimeStop: true
            }
        };

        const allowed = getAllowedTransitions(status, 'CA');
        expect(allowed.caToDmRefusal).to.eql(true);
    });

    it('should not allow CA to DM when HDC refused', () => {
        const status = {
            stage: 'PROCESSING_CA',
            tasks: {
                exclusion: 'DONE',
                crdTime: 'DONE',
                suitability: 'DONE',
                optOut: 'DONE',
                bassReferral: 'DONE',
                curfewAddress: 'DONE',
                finalChecks: 'DONE'
            },
            decisions: {
                postponed: false,
                curfewAddressApproved: 'approved',
                excluded: false,
                finalChecksRefused: true
            }
        };

        const allowed = getAllowedTransitions(status, 'CA');
        expect(allowed.caToDm).to.eql(false);
    });

    it('should allow CA to RO when address review has not been started', () => {
        const status = {
            stage: 'PROCESSING_CA',
            tasks: {
                exclusion: 'DONE',
                crdTime: 'DONE',
                suitability: 'DONE',
                optOut: 'DONE',
                curfewAddress: 'DONE',
                curfewAddressReview: 'UNSTARTED'
            },
            decisions: {
                postponed: false,
                curfewAddressApproved: 'approved',
                excluded: false,
                finalChecksRefused: true
            }
        };

        const allowed = getAllowedTransitions(status, 'CA');
        expect(allowed.caToRo).to.eql(true);
    });

});
