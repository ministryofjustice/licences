const {expect} = require('../testSetup');
const {createLicenceObject, createAddressObject} = require('../../server/utils/licenceFactory');

describe('licenceFactory', () => {

    describe('createLicenceObject', () => {

        it('should filter out any unacceptable data', () => {
           const input = {firstName: 'Matt', bad: 'yes'};

           expect(createLicenceObject(input)).to.eql({firstName: 'Matt'});
        });
    });

    describe('createAddressObject', () => {

        it('should filter out any unacceptable data', () => {
            const input = {firstName: 'Matt', address1: 'yes'};

            expect(createAddressObject(input)).to.eql({address1: 'yes'});
        });
    });
});
