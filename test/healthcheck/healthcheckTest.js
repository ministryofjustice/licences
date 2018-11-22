const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const sandbox = sinon.createSandbox();
const proxyquire = require('proxyquire');
proxyquire.noCallThru();

describe('healthcheck', () => {
    let callback;

    beforeEach(() => {
        callback = sandbox.spy();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('healthcheck', () => {
        let dbCheckStub;
        let nomisApiCheckStub;
        let authCheckStub;

        beforeEach(() => {
            dbCheckStub = sandbox.stub().resolves([{totalRows: {value: 0}}]);
            nomisApiCheckStub = sandbox.stub().resolves('OK');
            authCheckStub = sandbox.stub().resolves('OK');
        });

        const healthcheckProxy = (
            dbCheck = dbCheckStub,
            nomisApiCheck = nomisApiCheckStub,
            authCheck = authCheckStub) => {
            return proxyquire('../../server/healthcheck', {
                './data/healthcheck': {
                    dbCheck: dbCheck,
                    nomisApiCheck: nomisApiCheck,
                    authCheck: authCheck
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
                expect(calledWith.checks.auth).to.eql('OK');
            });
        });

        it('should return unhealthy if db rejects promise', () => {

            const dbCheckStubReject = sandbox.stub().rejects({message: 'rubbish'});

            return healthcheckProxy(dbCheckStubReject)(callback).then(() => {
                const calledWith = callback.getCalls()[0].args[1];

                expect(callback).to.have.callCount(1);
                expect(calledWith.healthy).to.eql(false);
                expect(calledWith.checks.db).to.eql('rubbish');
                expect(calledWith.checks.nomis).to.eql('OK');
                expect(calledWith.checks.auth).to.eql('OK');
            });
        });

        it('should return unhealthy if nomis rejects promise', () => {

            const nomisApiCheckStubReject = sandbox.stub().rejects(404);

            return healthcheckProxy(dbCheckStub, nomisApiCheckStubReject)(callback).then(() => {

                const calledWith = callback.getCalls()[0].args[1];

                expect(callback).to.have.callCount(1);
                expect(calledWith.healthy).to.eql(false);
                expect(calledWith.checks.db).to.eql('OK');
                expect(calledWith.checks.nomis).to.eql(404);
                expect(calledWith.checks.auth).to.eql('OK');
            });
        });

        it('should return unhealthy if auth rejects promise', () => {

            const authCheckStubReject = sandbox.stub().rejects(404);

            return healthcheckProxy(dbCheckStub, nomisApiCheckStub, authCheckStubReject)(callback).then(() => {

                const calledWith = callback.getCalls()[0].args[1];

                expect(callback).to.have.callCount(1);
                expect(calledWith.healthy).to.eql(false);
                expect(calledWith.checks.db).to.eql('OK');
                expect(calledWith.checks.nomis).to.eql('OK');
                expect(calledWith.checks.auth).to.eql(404);
            });
        });

    });
});
