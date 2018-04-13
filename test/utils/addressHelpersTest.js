const {separateAddresses, addressReviewStarted, getAddressToShow} = require('../../server/utils/addressHelpers');
const {expect} = require('../testSetup');

describe('addressHelpers', () => {

    const addressList = [
        {addressLine1: 'line1', consent: 'Yes', electricity: 'Yes', deemedSafe: 'Yes'},
        {addressLine1: 'line2', alternative: 'alternative'},
        {addressLine1: 'line3', consent: 'No', electricity: 'Yes', deemedSafe: 'Yes'},
        {addressLine1: 'line4'},
        {addressLine1: 'line5', consent: 'Yes', electricity: 'Yes'}
    ];

    describe('separateAddresses', () => {
        it('should split the address list into 3 lists', () => {

            const expectedOutput = {
                activeAddresses: [{index: '3', addressLine1: 'line4'}, {
                    index: '4',
                    addressLine1: 'line5',
                    consent: 'Yes',
                    electricity: 'Yes'
                }],
                acceptedAddresses: [{
                    index: '0',
                    addressLine1: 'line1',
                    consent: 'Yes',
                    electricity: 'Yes',
                    deemedSafe: 'Yes'
                }],
                rejectedAddresses: [{
                    index: '2',
                    addressLine1: 'line3',
                    consent: 'No',
                    electricity: 'Yes',
                    deemedSafe: 'Yes'
                }],
                alternativeAddresses: [{
                    index: '1',
                    addressLine1: 'line2',
                    alternative: 'alternative'
                }]
            };

            expect(separateAddresses(addressList)).to.eql(expectedOutput);
        });
    });

    describe('addressReviewStarted', () => {
        it('should return true if any of consent, electricity or deemedSafe have a value', () => {
            expect(addressReviewStarted(addressList[0])).to.eql(true);
        });

        it('should return false if none of consent, electricity or deemedSafe have a value', () => {
            expect(addressReviewStarted(addressList[3])).to.eql(false);
        });
    });

    describe('getAddressToShow', () => {

        const {activeAddresses, acceptedAddresses, rejectedAddresses} = {
            activeAddresses: [
                {index: 3, addressLine1: 'line4'},
                {index: 4, addressLine1: 'line5', consent: 'Yes', electricity: 'Yes'}
            ],
            acceptedAddresses: [
                {index: 0, addressLine1: 'line1', consent: 'Yes', electricity: 'Yes', deemedSafe: 'Yes'}
            ],
            rejectedAddresses: [
                {index: 2, addressLine1: 'line3', consent: 'No', electricity: 'Yes', deemedSafe: 'Yes'},
                {index: 5, addressLine1: 'line6', consent: 'No', electricity: 'Yes', deemedSafe: 'Yes'}
            ]
        };

        it('should return the active address list if there are any present', () => {

            const expectedOutput = [
                {index: 3, addressLine1: 'line4'}, {index: 4, addressLine1: 'line5', consent: 'Yes', electricity: 'Yes'}
            ];

            expect(getAddressToShow(activeAddresses, acceptedAddresses, rejectedAddresses)).to.eql(expectedOutput);
        });

        it('should return accepted addresses if there are no active', () => {
            const activeAddresses = [];

            const expectedOutput = [
                {index: 0, addressLine1: 'line1', consent: 'Yes', electricity: 'Yes', deemedSafe: 'Yes'}
            ];

            expect(getAddressToShow(activeAddresses, acceptedAddresses, rejectedAddresses)).to.eql(expectedOutput);
        });

        it('should return the final rejected address if there are no expected or active addresses', () => {
            const activeAddresses = [];
            const acceptedAddresses = [];

            const expectedOutput = [
                {index: 5, addressLine1: 'line6', consent: 'No', electricity: 'Yes', deemedSafe: 'Yes'}
            ];

            expect(getAddressToShow(activeAddresses, acceptedAddresses, rejectedAddresses)).to.eql(expectedOutput);
        });
    });
});
