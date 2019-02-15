const {
    getLabel,
    getCaAction
} = require('../../../../../server/routes/viewModels/taskLists/tasks/caSubmitAddressReview');

describe('ca submit for address review task', () => {
    describe('getLabel', () => {
        it('should return Ready to submit if task DONE', () => {
            expect(getLabel({
                decisions: {},
                tasks: {curfewAddress: 'DONE'}
            })).to.equal('Ready to submit');
        });

        it('should return Not completed if task not DONE', () => {
            expect(getLabel({
                decisions: {},
                tasks: {curfewAddress: 'SOMETHING'}
            })).to.equal('Not completed');
        });
    });

    describe('getRoAction', () => {

        it('should show btn to curfewAddress if curfewAddress: DONE and not opted out', () => {
            expect(getCaAction({
                decisions: {optedOut: false},
                tasks: {curfewAddress: 'DONE'}
            })).to.eql({
                text: 'Continue',
                href: '/hdc/review/curfewAddress/',
                type: 'btn'
            });
        });

        it('should show nothing if curfewAddress: not DONE and not opted out', () => {
            expect(getCaAction({
                decisions: {optedOut: false},
                tasks: {curfewAddress: 'SOMETHING'}
            })).to.eql(null);
        });

        it('should show nothing if  opted out', () => {
            expect(getCaAction({
                decisions: {optedOut: true},
                tasks: {curfewAddress: 'DONE'}
            })).to.eql(null);
        });
    });
});
