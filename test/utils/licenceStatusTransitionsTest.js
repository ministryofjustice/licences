const {getAllowedTransition} = require('../../server/utils/licenceStatusTransitions');

describe('getAllowedTransition', () => {
    it('should allow DM to CA for DM when approval task done', () => {
        const status = {
            stage: 'APPROVAL',
            tasks: {
                approval: 'DONE'
            }
        };

        const allowed = getAllowedTransition(status, 'DM');
        expect(allowed).to.eql('dmToCa');
    });

    it('should not allow DM to CA for DM when approval task not done', () => {
        const status = {
            stage: 'APPROVAL',
            tasks: {
                approval: 'UNSTARTED'
            }
        };

        const allowed = getAllowedTransition(status, 'DM');
        expect(allowed).to.eql(null);
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

        const allowed = getAllowedTransition(status, 'RO');
        expect(allowed).to.eql('roToCa');
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

        const allowed = getAllowedTransition(status, 'RO');
        expect(allowed).to.eql(null);
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

        const allowed = getAllowedTransition(status, 'RO');
        expect(allowed).to.eql('roToCa');
    });

    it('should allow RO to CA for RO when opted out even when other tasks not done', () => {
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
                optedOut: true
            }
        };

        const allowed = getAllowedTransition(status, 'RO');
        expect(allowed).to.eql('roToCa');
    });

    it('should allow RO to CA for RO when bass area rejected even when other tasks not done', () => {
        const status = {
            stage: 'PROCESSING_RO',
            tasks: {
                curfewAddressReview: 'DONE',
                bassAreaCheck: 'DONE',
                curfewHours: 'UNSTARTED',
                licenceConditions: 'UNSTARTED',
                riskManagement: 'UNSTARTED',
                reportingInstructions: 'UNSTARTED'
            },
            decisions: {
                bassReferralNeeded: true
            }
        };

        const allowed = getAllowedTransition(status, 'RO');
        expect(allowed).to.eql('roToCa');
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

        const allowed = getAllowedTransition(status, 'RO');
        expect(allowed).to.eql(null);
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
                postponed: null,
                curfewAddressApproved: 'approved',
                excluded: null,
                eligible: true
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql('caToRo');
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

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql(null);
    });

    it('should not allow CA to RO in the ELIGIBILITY stage when address has been rejected', () => {
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
                curfewAddressApproved: 'null'
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql(null);
    });

    it('should not allow CA to RO in the ELIGIBILITY stage when ineligible', () => {
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
                postponed: null,
                curfewAddressApproved: 'approved',
                excluded: null,
                eligible: null
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql(null);
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
                postponed: null,
                curfewAddressApproved: 'approved',
                excluded: null
            }
        };

        const allowed = getAllowedTransition(status, 'CA');

        expect(allowed).to.eql('caToDm');
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
                postponed: null,
                curfewAddressApproved: 'approved',
                excluded: true
            }
        };

        const allowed = getAllowedTransition(status, 'CA');

        expect(allowed).to.eql(null);
    });

    it('should allow CA to DM in the PROCESSING_CA for BASS when only BASS offer and final checks tasks done', () => {
        const status = {
            stage: 'PROCESSING_CA',
            tasks: {
                curfewAddress: 'UNSTARTED',
                bassOffer: 'DONE',
                finalChecks: 'DONE'
            },
            decisions: {
                bassReferralNeeded: true
            }
        };

        const allowed = getAllowedTransition(status, 'CA');

        expect(allowed).to.eql('caToDm');
    });

    it('should allow CA to DM refusal when eligible and insufficient time', () => {
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
                insufficientTimeStop: true,
                eligible: true
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql('caToDmRefusal');
    });

    it('should allow CA to DM refusal when ineligble but insufficientTimeStop', () => {
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
                insufficientTimeStop: true,
                eligible: null
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql('caToDmRefusal');
    });

    it('should not allow CA to DM refusal if ineligible without', () => {
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
                eligible: null,
                curfewAddressApproved: 'rejected'
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql(null);
    });

    it('should allow CA to DM refusal if curfew address is rejected', () => {
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
                eligible: true,
                curfewAddressApproved: 'rejected'
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql('caToDmRefusal');
    });

    it('should allow CA to DM refusal if BASS area is rejected - ELIGIBILITY', () => {
        const status = {
            stage: 'ELIGIBILITY',
            tasks: {
                bassReferral: 'DONE'
            },
            decisions: {
                eligible: true,
                bassAreaNotSuitable: true
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql('caToDmRefusal');
    });

    it('should allow CA to DM refusal if BASS area is rejected - POST_APPROVAL', () => {
        const status = {
            stage: 'MODIFIED',
            tasks: {
                bassReferral: 'DONE'
            },
            decisions: {
                eligible: true,
                bassAreaNotSuitable: true
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql('caToDmRefusal');
    });

    it('should allow CA to DM refusal if BASS outcome is Unsuitable - POST_APPROVAL', () => {
        const status = {
            stage: 'MODIFIED',
            tasks: {
                bassReferral: 'DONE'
            },
            decisions: {
                eligible: true,
                bassAreaSuitable: true,
                bassAccepted: 'Unsuitable'
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql('caToDmRefusal');
    });

    it('should allow CA to DM refusal if BASS outcome is Unavailable - POST_APPROVAL', () => {
        const status = {
            stage: 'MODIFIED',
            tasks: {
                bassReferral: 'DONE'
            },
            decisions: {
                eligible: true,
                bassAreaSuitable: true,
                bassAccepted: 'Unavailable'
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql('caToDmRefusal');
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
                postponed: null,
                curfewAddressApproved: 'approved',
                excluded: null,
                finalChecksRefused: true
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql(null);
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
                postponed: null,
                curfewAddressApproved: 'approved',
                excluded: null,
                finalChecksRefused: true
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql('caToRo');
    });

    it('should allow CA to DM when address has been withdrawn', () => {
        const status = {
            stage: 'PROCESSING_CA',
            tasks: {},
            decisions: {
                curfewAddressApproved: 'withdrawn'
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql('caToDmRefusal');
    });

    it('should allow CA to DM when address has been withdrawn (but no new address added) in Post-decision', () => {
        const status = {
            stage: 'MODIFIED',
            tasks: {},
            decisions: {
                curfewAddressApproved: 'withdrawn'
            }
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql('caToDmRefusal');
    });

    it('should allow CA to RO when address has been withdrawn and a new address added in Post-decision', () => {
        const status = {
            stage: 'MODIFIED',
            tasks: {
                curfewAddressReview: 'UNSTARTED'
            },
            decisions: {}
        };

        const allowed = getAllowedTransition(status, 'CA');
        expect(allowed).to.eql('caToRo');
    });

});
