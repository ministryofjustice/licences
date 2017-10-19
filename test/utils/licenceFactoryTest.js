const {expect} = require('../testSetup');
const {createLicenceObject} = require('../../server/utils/licenceFactory');

describe('licenceFactory', () => {

    describe('createLicenceObject', () => {

        it('should filter out any unacceptable data', () => {
           const input = {firstName: 'Matt', bad: 'yes'};

           expect(createLicenceObject(input)).to.eql({firstName: 'Matt'});
        });
    });
});
