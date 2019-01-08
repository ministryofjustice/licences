const {
    addressReviewStarted,
    isAcceptedAddress,
    isRejectedAddress
} = require('../../server/utils/addressHelpers');
describe('addressHelpers', () => {

    describe('addressReviewStarted', () => {
        it('should return true if consent or electricity has a value', () => {
            expect(addressReviewStarted(
                {consent: 'Yes'},
            )).to.eql(true);
        });

        it('should return false if none of consent, electricity or deemedSafe have a value', () => {
            expect(addressReviewStarted({})).to.eql(false);
        });
    });

    describe('isAcceptedAddress', () => {
        it('should return true if all expected answers are Yes', () => {
            expect(isAcceptedAddress({consent: 'Yes', electricity: 'Yes'}, 'Yes')).to.eql(true);
        });

        it('should return false if any are No', () => {
            expect(isAcceptedAddress({consent: 'No', electricity: 'Yes'}, 'Yes')).to.eql(false);
            expect(isAcceptedAddress({consent: 'Yes', electricity: 'No'}, 'Yes')).to.eql(false);
            expect(isAcceptedAddress({consent: 'Yes', electricity: 'Yes'}, 'No')).to.eql(false);
        });

        it('should return true if consent is missed but occupier is the offender', () => {
            expect(isAcceptedAddress({electricity: 'Yes'}, 'Yes', true)).to.eql(true);
        });

    });

    describe('isRejectedAddress', () => {
        it('should return false if all expected answers are Yes', () => {
            expect(isRejectedAddress({consent: 'Yes', electricity: 'Yes'}, 'Yes')).to.eql(false);
        });

        it('should return true if any are No', () => {
            expect(isRejectedAddress({consent: 'No', electricity: 'Yes'}, 'Yes')).to.eql(true);
            expect(isRejectedAddress({consent: 'Yes', electricity: 'No'}, 'Yes')).to.eql(true);
            expect(isRejectedAddress({consent: 'Yes', electricity: 'Yes'}, 'No')).to.eql(true);
        });

    });

});
