const createConditionsService = require('../../server/services/conditionsService');
const {expect, sandbox} = require('../testSetup');

describe('licenceDetailsService', () => {

    const licenceClient = {
        getStandardConditions: sandbox.stub().returnsPromise().resolves({a: 'b'})
    };

    const service = createConditionsService(licenceClient);

    afterEach(() => {
        sandbox.reset();
    });

    describe('getLicence', () => {
        it('should request standard conditions from client', () => {
            service.getStandardConditions();

            expect(licenceClient.getStandardConditions).to.be.calledOnce();
        });

        it('should return the conditions', () => {
            return expect(service.getStandardConditions()).to.eventually.eql({a: 'b'});
        });

        it('should throw if error getting conditions', () => {
            licenceClient.getStandardConditions.rejects();
            return expect(service.getStandardConditions()).to.eventually.be.rejected();
        });
    });

});
