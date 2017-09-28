process.env.NODE_ENV = 'test';

const proxyquire = require('proxyquire');
proxyquire.noCallThru();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();

describe('getOffenders', function() {

    const standardResponse = [
        {NOMS_NO: {value: 'A1235HG'}},
        {NOMS_NO: {value: 'A6627JH'}}
    ];

    let getCollectionStub = sandbox.stub().callsArgWith(2, standardResponse);

    const deliusProxy = (getCollection = getCollectionStub) => {
        return proxyquire('../../server/data/delius', {
            './dataAccess/dbData': {
                getCollection: getCollection
            }
        });
    };

    const expectedReturnValue = ['A1235HG', 'A6627JH'];

    afterEach(() => {
        sandbox.reset();
    });

    it('should return expected data', () => {
        const result = deliusProxy().getOffenders(['someUserId']);
        return result.then(data => {
            expect(data).to.deep.equal(expectedReturnValue);
        });
    });

    it('should call getCollection', () => {
        deliusProxy().getOffenders(['someUserId']);
        expect(getCollectionStub).to.have.callCount(1);
    });

    it('should pass in the correct sql', () => {

        const expectedSql = `SELECT NOMS_NO FROM DELIUS
                        WHERE STAFF_ID like 'someUserId'`;

        deliusProxy().getOffenders(['someUserId']);
        const sql = getCollectionStub.getCalls()[0].args[0];
        expect(sql).to.eql(expectedSql);
    });
});
