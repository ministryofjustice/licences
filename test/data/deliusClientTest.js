const proxyquire = require('proxyquire');
proxyquire.noCallThru();

const {
    sandbox,
    expect
} = require('../testSetup');

describe('deliusClient', () => {
    const result = [{NOMS_NO: '65'}, {NOMS_NO: '92'}];
    const collectionStub = sandbox.stub().returnsPromise().resolves(result);
    const deliusClient = proxyquire('../../server/data/deliusClient', {
        './dataAccess/db': {
            getCollection: collectionStub
        }
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('getUpcomingReleasesFor', () => {
        it('should getCollection from db', () => {
            deliusClient.getPrisonersFor('ab1');
            expect(collectionStub).to.be.calledOnce();
            expect(collectionStub).to.be.calledWithMatch('SELECT NOMS_NO FROM DELIUS WHERE STAFF_ID like \'ab1\'');
        });

        it('should return an array of ids', () => {
            expect(deliusClient.getPrisonersFor('ab1')).to.eventually.equal(['65', '92']);
        });
    });
});
