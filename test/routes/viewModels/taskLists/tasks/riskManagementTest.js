const {
    getLabel,
    getRoAction
} = require('../../../../../server/routes/viewModels/taskLists/tasks/riskManagement');

describe('risk management task', () => {
    describe('getLabel', () => {
        it('should return Address unsuitable if addressUnsuitable = true', () => {
            expect(getLabel({
                decisions: {addressUnsuitable: true},
                tasks: {}
            })).to.equal('Address unsuitable');
        });

        it('should return No risks if risk management not needed', () => {
            expect(getLabel({
                decisions: {addressReviewFailed: false, riskManagementNeeded: false},
                tasks: {riskManagement: 'DONE'}
            })).to.equal('No risks');
        });

        it('should return Risk management required if risk management needed', () => {
            expect(getLabel({
                decisions: {addressReviewFailed: false, riskManagementNeeded: true},
                tasks: {riskManagement: 'DONE'}
            })).to.equal('Risk management required');
        });

        it('should return Not completed if risk task not done', () => {
            expect(getLabel({
                decisions: {addressReviewFailed: false, riskManagementNeeded: true},
                tasks: {riskManagement: 'UNSTARTED'}
            })).to.equal('Not completed');
        });

        it('should return warning if still waiting for information', () => {
            expect(getLabel({
                decisions: {awaitingRiskInformation: true},
                tasks: {riskManagement: 'DONE'}
            })).to.equal('WARNING||Still waiting for information');
        });
    });

    describe('getRoAction', () => {

        it('sould show btn to curfewAddressReview if curfewAddressReview: UNSTARTED', () => {
            expect(getRoAction({
                decisions: {},
                tasks: {riskManagement: 'UNSTARTED'}
            })).to.eql({
                text: 'Start now',
                href: '/hdc/risk/riskManagement/',
                type: 'btn'
            });
        });

        it('should show change link to curfewAddressReview if curfewAddressReview: DONE', () => {
            expect(getRoAction({
                decisions: {},
                tasks: {riskManagement: 'DONE'}
            })).to.eql({
                text: 'Change',
                href: '/hdc/risk/riskManagement/',
                type: 'link'
            });
        });

        it('should show continue btn to curfewAddressReview if curfewAddressReview: !DONE || UNSTARTED', () => {
            expect(getRoAction({
                decisions: {},
                tasks: {riskManagement: 'SOMETHING'}
            })).to.eql({
                text: 'Continue',
                href: '/hdc/risk/riskManagement/',
                type: 'btn'
            });
        });
    });
});
