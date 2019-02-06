const {getLabel, getAction} = require('../../../../../server/routes/viewModels/taskLists/tasks/bassOffer');

describe('bass offer task', () => {
    describe('getLabel', () => {
        it('should return Bass area rejected if bassAreaNotSuitable = true', () => {
            expect(getLabel({
                decisions: {bassAreaNotSuitable: true},
                tasks: {}
            })).to.equal('BASS area rejected');
        });

        it('should return BASS offer withdrawn if bassWithdrawalReason = offer', () => {
            expect(getLabel({
                decisions: {bassWithdrawn: true, bassWithdrawalReason: 'offer'},
                tasks: {}
            })).to.equal('BASS offer withdrawn');
        });

        it('should return BASS offer withdrawn if bassWithdrawalReason != offer', () => {
            expect(getLabel({
                decisions: {bassWithdrawn: true, bassWithdrawalReason: 'something else'},
                tasks: {}
            })).to.equal('BASS request withdrawn');
        });

        it('should return offer made if bassOffer = DONE && bassAccepted = Yes', () => {
            expect(getLabel({
                decisions: {bassAccepted: 'Yes'},
                tasks: {bassOffer: 'DONE'}
            })).to.equal('Offer made');
        });

        it('should return Not suitable for BASS if bassOffer = DONE && bassAccepted === Unsuitable', () => {
            expect(getLabel({
                decisions: {bassAccepted: 'Unsuitable'},
                tasks: {bassOffer: 'DONE'}
            })).to.equal('WARNING||Not suitable for BASS');
        });

        it('should return Address not available if bassOffer = DONE && bassAccepted !== Unsuitable or Yes', () => {
            expect(getLabel({
                decisions: {bassAccepted: 'Something else'},
                tasks: {bassOffer: 'DONE'}
            })).to.equal('WARNING||Address not available');
        });

        it('should return Not completed if bassAreaCheck == DONE && bassAreaSuitable', () => {
            expect(getLabel({
                decisions: {bassAreaSuitable: true},
                tasks: {bassAreaCheck: 'DONE'}
            })).to.equal('Not completed');
        });

        it('should return BASS referral requested if bassAreaCheck == DONE && !bassAreaSuitable', () => {
            expect(getLabel({
                decisions: {bassAreaSuitable: false},
                tasks: {bassOffer: 'UNSTARTED'}
            })).to.equal('BASS referral requested');
        });

        it(
            'should return BASS referral requested if !bassAreaNotSuitable, !bassWithdrawn, bassOffer !== DONE, bassAreaCheck !== DONE',
            () => {
                expect(getLabel({
                    decisions: {bassAreaNotSuitable: false, bassWithdrawn: false},
                    tasks: {bassOffer: 'UNSTARTED', bassAreaCheck: 'UNSTARTED'}
                })).to.equal('BASS referral requested');
            });
    });

    describe('getAction', () => {
        it('should link to bass offer if bassWithdrawn', () => {
            expect(getAction({
                decisions: {bassWithdrawn: true},
                tasks: {}
            })).to.eql({
                text: 'Change',
                href: '/hdc/bassReferral/bassOffer/',
                type: 'link'
            });
        });

        it('should show btn to bassOffer if checks: DONE && bassOffer: UNSTARTED', () => {
            expect(getAction({
                decisions: {bassWithdrawn: false},
                tasks: {bassAreaCheck: 'DONE', bassOffer: 'UNSTARTED'}
            })).to.eql({
                text: 'Start now',
                href: '/hdc/bassReferral/bassOffer/',
                type: 'btn'
            });
        });

        it('should show change link to bassOffer if checks: DONE && bassOffer: DONE', () => {
            expect(getAction({
                decisions: {bassWithdrawn: false},
                tasks: {bassAreaCheck: 'DONE', bassOffer: 'DONE'}
            })).to.eql({
                text: 'Change',
                href: '/hdc/bassReferral/bassOffer/',
                type: 'link'
            });
        });

        it('should show continue btn to bassOffer if checks: DONE && bassOffer: !DONE || UNSTARTED', () => {
            expect(getAction({
                decisions: {bassWithdrawn: false},
                tasks: {bassAreaCheck: 'DONE', bassOffer: 'SOMETHING'}
            })).to.eql({
                text: 'Continue',
                href: '/hdc/bassReferral/bassOffer/',
                type: 'btn'
            });
        });

        it('should go to 3 way choice if checks: !DONE && !bassWithdrawn && optout, curfewAddress, bassRequest == UNSTARTED', () => {
            expect(getAction({
                decisions: {bassWithdrawn: false},
                tasks: {bassAreaCheck: 'SOMETHING', optOut: 'UNSTARTED', curfewAddress: 'UNSTARTED', bassRequest: 'UNSTARTED'}
            })).to.eql({
                text: 'Start now',
                href: '/hdc/proposedAddress/curfewAddressChoice/',
                type: 'btn'
            });
        });

        it('should link to 3 way choice if checks: !DONE && !bassWithdrawn && optout, curfewAddress, bassRequest == DONE', () => {
            expect(getAction({
                decisions: {bassWithdrawn: false},
                tasks: {bassAreaCheck: 'SOMETHING', optOut: 'DONE', curfewAddress: 'DONE', bassRequest: 'DONE'}
            })).to.eql({
                text: 'Change',
                href: '/hdc/proposedAddress/curfewAddressChoice/',
                type: 'link'
            });
        });

        it('should continue to 3 way choice if checks: !DONE && !bassWithdrawn && any optout, curfewAddress, bassRequest != DONE', () => {
            expect(getAction({
                decisions: {bassWithdrawn: false},
                tasks: {bassAreaCheck: 'SOMETHING', optOut: 'UNSTARTED', curfewAddress: 'DONE', bassRequest: 'DONE'}
            })).to.eql({
                text: 'Continue',
                href: '/hdc/proposedAddress/curfewAddressChoice/',
                type: 'btn'
            });
        });
    });
});
