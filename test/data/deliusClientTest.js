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
        './dataAccess/dbMethods': {
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

            const sql = collectionStub.getCalls()[0].args[0];
            expect(sql).includes('SELECT NOMS_NO FROM DELIUS WHERE STAFF_ID LIKE');
            expect(sql).includes('SELECT STAFF_ID FROM STAFF_IDS WHERE NOMIS_ID LIKE \'ab1\'');

        });

        it('should return an array of ids', () => {
            expect(deliusClient.getPrisonersFor('ab1')).to.eventually.equal(['65', '92']);
        });
    });
});
