const createConditionsService = require('../../server/services/conditionsService');
const {expect, sandbox} = require('../testSetup');

describe('licenceDetailsService', () => {

    const licenceClient = {
        getStandardConditions: sandbox.stub().returnsPromise().resolves({a: 'b'}),
        getAdditionalConditions: sandbox.stub().returnsPromise().resolves([{TEXT: {value: 'v'}, USER_INPUT: {}}])
    };

    const service = createConditionsService(licenceClient);

    afterEach(() => {
        sandbox.reset();
    });

    describe('getStandardConditions', () => {
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

    describe('getAdditionalConditions', () => {
        it('should request additional conditions from client', () => {
            service.getAdditionalConditions();

            expect(licenceClient.getAdditionalConditions).to.be.calledOnce();
        });

        it('should return the conditions', () => {
            const expected = [
                {
                    TEXT: {value: 'v'},
                    USER_INPUT: {}
                }
            ];

            return expect(service.getAdditionalConditions()).to.eventually.eql(expected);
        });

        it('should throw if error getting conditions', () => {
            licenceClient.getAdditionalConditions.rejects();
            return expect(service.getAdditionalConditions()).to.eventually.be.rejected();
        });
    });
});
