const createLicenceDetailsService = require('../../server/services/licenceDetailsService');
const service = createLicenceDetailsService();
const {expect} = require('./testSetup');

describe('licenceDetailsService', () => {

    describe('getLicenceDetails', () => {
        it('should return licence details', () => {
            const data = service.getLicenceDetails();

            expect(data).to.be.an('object');
        });
    });
});
