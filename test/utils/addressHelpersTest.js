const {
    addressReviewStarted,
    isAcceptedAddress,
    isRejectedAddress
} = require('../../server/utils/addressHelpers');
describe('addressHelpers', () => {

    const addressList = [
        {addressLine1: 'line1', consent: 'Yes', electricity: 'Yes', deemedSafe: 'Yes'},
        {addressLine1: 'line2'},
        {addressLine1: 'line3', consent: 'No', electricity: 'Yes', deemedSafe: 'Yes'},
        {addressLine1: 'line4'},
        {addressLine1: 'line5', consent: 'Yes', electricity: 'Yes'}
    ];

    describe('addressReviewStarted', () => {
        it('should return true if any of consent, electricity or deemedSafe have a value', () => {
            expect(addressReviewStarted(addressList[0])).to.eql(true);
        });

        it('should return false if none of consent, electricity or deemedSafe have a value', () => {
            expect(addressReviewStarted(addressList[3])).to.eql(false);
        });
    });

    describe('isAcceptedAddress', () => {

        const address1 = {consent: 'Yes', electricity: 'Yes', deemedSafe: 'Yes'};
        const address2 = {consent: 'No', electricity: 'Yes', deemedSafe: 'Yes'};
        const address3 = {consent: 'Yes', electricity: 'No', deemedSafe: 'Yes'};
        const address4 = {consent: 'Yes', electricity: 'Yes', deemedSafe: 'No'};
        const address5 = {occupier: {isOffender: 'Yes'}, electricity: 'Yes', deemedSafe: 'Yes'};

        it('should return true if all expected answers are Yes', () => {
            expect(isAcceptedAddress(address1)).to.eql(true);
        });

        it('should return false if any are No', () => {
            expect(isAcceptedAddress(address2)).to.eql(false);
            expect(isAcceptedAddress(address3)).to.eql(false);
            expect(isAcceptedAddress(address4)).to.eql(false);
        });

        it('should return true if consent is missed but occupier is the offender', () => {
            expect(isAcceptedAddress(address5)).to.eql(true);
        });

    });

    describe('isRejectedAddress', () => {

        const address1 = {consent: 'Yes', electricity: 'Yes', deemedSafe: 'Yes'};
        const address2 = {consent: 'No', electricity: 'Yes', deemedSafe: 'Yes'};
        const address3 = {consent: 'Yes', electricity: 'No', deemedSafe: 'Yes'};
        const address4 = {consent: 'Yes', electricity: 'Yes', deemedSafe: 'No'};

        it('should return false if all expected answers are Yes', () => {
            expect(isRejectedAddress(address1)).to.eql(false);
        });

        it('should return true if any are No', () => {
            expect(isRejectedAddress(address2)).to.eql(true);
            expect(isRejectedAddress(address3)).to.eql(true);
            expect(isRejectedAddress(address4)).to.eql(true);
        });

    });

});
