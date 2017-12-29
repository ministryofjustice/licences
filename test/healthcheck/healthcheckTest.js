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

describe('healthcheck', () => {
    let callback;

    beforeEach(() => {
        callback = sandbox.spy();
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('healthcheck', () => {
        let dbCheckStub;
        let nomisApiCheckStub;

        beforeEach(() => {
            dbCheckStub = sandbox.stub().returnsPromise().resolves([{totalRows: {value: 0}}]);
            nomisApiCheckStub = sandbox.stub().returnsPromise().resolves('OK');
        });

        const healthcheckProxy = (dbCheck = dbCheckStub, nomisApiCheck = nomisApiCheckStub) => {
            return proxyquire('../../server/healthcheck', {
                './data/healthcheck': {
                    dbCheck: dbCheck,
                    nomisApiCheck: nomisApiCheck
                }
            });
        };

        it('should return healthy if db and licences checks resolve OK', () => {

            return healthcheckProxy()(callback).then(() => {

                const calledWith = callback.getCalls()[0].args[1];

                expect(callback).to.have.callCount(1);
                expect(calledWith.healthy).to.eql(true);

                expect(calledWith.checks.db).to.eql('OK');
                expect(calledWith.checks.nomis).to.eql('OK');
            });
        });

        it('should return unhealthy if db rejects promise', () => {

            const dbCheckStubReject = sandbox.stub().returnsPromise().rejects({message: 'rubbish'});

            return healthcheckProxy(dbCheckStubReject)(callback).then(() => {
                const calledWith = callback.getCalls()[0].args[1];

                expect(callback).to.have.callCount(1);
                expect(calledWith.healthy).to.eql(false);
                expect(calledWith.checks.db).to.eql('rubbish');
                expect(calledWith.checks.nomis).to.eql('OK');
            });
        });

        it('should return unhealthy if nomis rejects promise', () => {

            const nomisApiCheckStubReject = sandbox.stub().returnsPromise().rejects(404);

            return healthcheckProxy(dbCheckStub, nomisApiCheckStubReject)(callback).then(() => {

                const calledWith = callback.getCalls()[0].args[1];

                expect(callback).to.have.callCount(1);
                expect(calledWith.healthy).to.eql(false);
                expect(calledWith.checks.db).to.eql('OK');
                expect(calledWith.checks.nomis).to.eql(404);
            });
        });
    });
});
