const createPrisonerDetailsService = require('../../server/services/prisonerDetailsService');
const {
    sandbox,
    expect
} = require('./testSetup');

describe('prisonerDetailsService', () => {

    const apiMock = {
        getPrisonerInfo: sandbox.stub().returnsPromise().resolves({value: 0})
    };

    const service = createPrisonerDetailsService(apiMock);

    afterEach(() => {
        sandbox.reset();
    });

    describe('getPrisonerDetails', () => {
        it('should call the api with the nomis id', () => {
            service.getPrisonerDetails('123');

            expect(apiMock.getPrisonerInfo).to.be.calledOnce();
            expect(apiMock.getPrisonerInfo).to.be.calledWith('123');
        });

        it('should return the result of the api call', () => {
            return expect(service.getPrisonerDetails('123'))
                .to.eventually.eql({value: 0});
        });

        it('should throw if error in api', () => {
            apiMock.getPrisonerInfo.rejects(new Error('dead'));

            return expect(service.getPrisonerDetails('123')).to.be.rejected();
        });
    });
});
