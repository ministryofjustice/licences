const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();
const proxyquire = require('proxyquire');
proxyquire.noCallThru();
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);

describe('searchController', () => {
    let callback;

    beforeEach(() => {
        callback = sandbox.spy();
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('healthcheck', () => {
        const dummyStub = sinon.stub().returnsPromise().resolves({name: 'dummy', status: 'ok', message: 'ok'});

        const healthcheckProxy = (dummy = dummyStub) => {
            return proxyquire('../../server/healthcheck', {
                '../data/healthcheck': {
                    dummy: dummy
                }
            });
        };

        it('should return healthy if dummy resolves promise', () => {

            return healthcheckProxy()(callback).then(() => {

                const calledWith = callback.getCalls()[0].args[1];

                expect(callback).to.have.callCount(1);
                expect(calledWith.healthy).to.eql(true);
                expect(calledWith.checks.dummy).to.eql('ok');
            });
        });


    });
});
