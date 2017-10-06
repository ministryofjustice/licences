const createPrisonerDetailsService = require('../../server/services/prisonerDetailsService');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.use(require('chai-as-promised'));
chai.use(require('dirty-chai'));
const expect = chai.expect;
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);
const sandbox = sinon.sandbox.create();

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
