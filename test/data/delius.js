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

    const standardResponse = [{
        JSON1: {
            value: JSON.stringify({offenders: ['A1235HG', 'A6627JH']})
        }
    }];

    let getCollectionStub = sandbox.stub().callsArgWith(2, standardResponse);

    const deliusProxy = (getCollection = getCollectionStub) => {
        return proxyquire('../../server/data/delius', {
            './dataAccess/dbData': {
                getCollection: getCollection
            }
        });
    };

    const expectedReturnValue = {offenders: ['A1235HG', 'A6627JH']};

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

        const expectedSql = `SELECT JSON_QUERY(OFFENDERS) AS nomisIds
                     FROM DELIUS
                     WHERE OM_ID LIKE 'someUserId'
                     FOR JSON PATH, WITHOUT_ARRAY_WRAPPER`;

        deliusProxy().getOffenders(['someUserId']);
        const sql = getCollectionStub.getCalls()[0].args[0];
        expect(sql).to.eql(expectedSql);
    });
});
