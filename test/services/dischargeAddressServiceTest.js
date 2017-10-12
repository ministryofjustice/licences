const createLicenceDetailsService = require('../../server/services/dischargeAddressService');
const service = createLicenceDetailsService();
const {expect} = require('../testSetup');

describe('dischargeAddressService', () => {

    describe('getDischargeAddress', () => {
        it('should return licence details', () => {
            const data = service.getDischargeAddress();

            expect(data).to.be.an('object');
        });
    });
});
