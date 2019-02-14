const {
    getLabel,
    getCaAction
} = require('../../../../../server/routes/viewModels/taskLists/tasks/bassAddress');

describe('bass address task', () => {
    describe('getLabel', () => {
        it('should return BASS area rejected if decision = true', () => {
            expect(getLabel({
                decisions: {bassAreaNotSuitable: true},
                tasks: {}
            })).to.equal('BASS area rejected');
        });

        it('should return BASS offer withdrawn if suitable, withdrawn and bassWithdrawalReason === offer', () => {
            expect(getLabel({
                decisions: {bassAreaNotSuitable: false, bassWithdrawn: true, bassWithdrawalReason: 'offer'},
                tasks: {}
            })).to.equal('BASS offer withdrawn');
        });

        it('should return BASS request withdrawn if suitable, withdrawn and bassWithdrawalReason !== offer', () => {
            expect(getLabel({
                decisions: {bassAreaNotSuitable: false, bassWithdrawn: true, bassWithdrawalReason: 'something'},
                tasks: {}
            })).to.equal('BASS request withdrawn');
        });

        it('should return Offer made and address provided if bass offer made and bass address DONE', () => {
            expect(getLabel({
                decisions: {bassAreaNotSuitable: false, bassWithdrawn: false, bassAccepted: 'Yes'},
                tasks: {bassOffer: 'DONE', bassAddress: 'DONE'}
            })).to.equal('Offer made and address provided');
        });

        it('should return Offer made, awaiting address if bass offer made and bass address not DONE', () => {
            expect(getLabel({
                decisions: {bassAreaNotSuitable: false, bassWithdrawn: false, bassAccepted: 'Yes'},
                tasks: {bassOffer: 'DONE', bassAddress: 'SOMTHING'}
            })).to.equal('Offer made, awaiting address');
        });

        it('should return warning if Offer not made', () => {
            expect(getLabel({
                decisions: {bassAreaNotSuitable: false, bassWithdrawn: false, bassAccepted: 'Unsuitable'},
                tasks: {bassOffer: 'DONE'}
            })).to.equal('WARNING||Not suitable for BASS');
        });

        it('should return warning if Offer not made but not deemed unsuitable', () => {
            expect(getLabel({
                decisions: {bassAreaNotSuitable: false, bassWithdrawn: false, bassAccepted: 'Something'},
                tasks: {bassOffer: 'DONE'}
            })).to.equal('WARNING||Address not available');
        });

        it('should return Not completed if none of the above', () => {
            expect(getLabel({
                decisions: {bassAreaNotSuitable: false, bassWithdrawn: false},
                tasks: {bassOffer: 'SOMETHING'}
            })).to.equal('Not completed');
        });
    });

    describe('getCaAction', () => {

        it('should show btn to curfewAddressReview if curfewAddressReview: UNSTARTED', () => {
            expect(getCaAction({
                decisions: {},
                tasks: {bassAddress: 'UNSTARTED'}
            })).to.eql({
                text: 'Start now',
                href: '/hdc/bassReferral/bassOffer/',
                type: 'btn'
            });
        });

        it('should show change link to curfewAddressReview if curfewAddressReview: DONE', () => {
            expect(getCaAction({
                decisions: {},
                tasks: {bassAddress: 'DONE'}
            })).to.eql({
                text: 'Change',
                href: '/hdc/bassReferral/bassOffer/',
                type: 'link'
            });
        });

        it('should show continue btn to curfewAddressReview if curfewAddressReview: !DONE || UNSTARTED', () => {
            expect(getCaAction({
                decisions: {},
                tasks: {bassAddress: 'SOMETHING'}
            })).to.eql({
                text: 'Continue',
                href: '/hdc/bassReferral/bassOffer/',
                type: 'btn'
            });
        });
    });
});
