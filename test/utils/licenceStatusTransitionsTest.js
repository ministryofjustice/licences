const {getAllowedTransitions} = require('../../server/utils/licenceStatusTransitions');
const {expect} = require('../testSetup');

describe('getAllowedTransitions', () => {

    it('should allow DM to CA for DM when approval task done', () => {

        const status = {
            tasks: {
                approval: 'DONE'
            }
        };

        const allowed = getAllowedTransitions(status, 'DM');
        expect(allowed.dmToCa).to.eql(true);
    });

    it('should not allow DM to CA for DM when approval task not done', () => {

        const status = {
            tasks: {
                approval: 'UNSTARTED'
            }
        };

        const allowed = getAllowedTransitions(status, 'DM');
        expect(allowed.dmToCa).to.eql(false);
    });

    it('should allow RO to CA for RO when all RO tasks done', () => {

        const status = {
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

    it('should allow CA to RO or DM for CA when all CA tasks done and decisions OK', () => {

        const status = {
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
                curfewAddressApproved: true,
                excluded: false
            }
        };

        const allowed = getAllowedTransitions(status, 'CA');
        expect(allowed.caToRo).to.eql(true);
        expect(allowed.caToDm).to.eql(true);
    });

    it('should not allow CA to RO or DM for CA when any CA tasks not done and decisions not OK', () => {

        const status = {
            tasks: {
                exclusion: 'DONE',
                crdTime: 'DONE',
                suitability: 'UNSTARTED',
                optOut: 'DONE',
                bassReferral: 'DONE'
            },
            decisions: {
                postponed: false,
                curfewAddressApproved: true,
                excluded: true
            }
        };

        const allowed = getAllowedTransitions(status, 'CA');
        expect(allowed.caToRo).to.eql(false);
        expect(allowed.caToDm).to.eql(false);
    });

});
