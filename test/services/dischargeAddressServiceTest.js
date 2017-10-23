const createDischargeAddressService = require('../../server/services/dischargeAddressService');
const {
    sandbox,
    expect
} = require('../testSetup');


describe('dischargeAddressService', () => {

    const nomisClient = {
        getDischargeAddress: sandbox.stub().returnsPromise()
    };

    const nomisClientBuilder = sandbox.stub().returns(nomisClient);

    const service = createDischargeAddressService(nomisClientBuilder);

    describe('getDischargeAddress', () => {
        it('should get the discharge address from nomis', () => {
            service.getDischargeAddress('123');

            expect(nomisClient.getDischargeAddress).to.be.calledOnce();
            expect(nomisClient.getDischargeAddress).to.be.calledWith('123');
        });

        it('should return the data from nomis', () => {
            nomisClient.getDischargeAddress.resolves({1: '2'});

            expect(service.getDischargeAddress('123')).to.eventually.eql({1: '2'});
        });

        it('should throw if error in db', () => {

            nomisClient.getDischargeAddress.rejects(new Error('dead'));

            return expect(nomisClient.getDischargeAddress('123')).to.be.rejected();
        });
    });
});
