process.env.NODE_ENV = 'test';

const proxyquire = require('proxyquire');
proxyquire.noCallThru();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();

describe('getLicences', function() {

    const standardResponse = [{
        JSON1: {
            value: JSON.stringify([{
                nomisId: 'A6627JH',
                id: 4,
                licence: {
                    name: 'Bryanston, David',
                    nomisId: 'A6627JH',
                    establishment: 'HMP Birmingham',
                    dischargeDate: '2017-07-10'
                }
            }])
        }
    }];

    let getCollectionStub = sandbox.stub().callsArgWith(2, standardResponse);

    const licencesProxy = (getCollection = getCollectionStub) => {
        return proxyquire('../../server/data/dbClient', {
            './dataAccess/db': {
                getCollection: getCollection
            }
        });
    };

    const expectedReturnValue = [{
        nomisId: 'A6627JH',
        id: 4,
        licence: {
            name: 'Bryanston, David',
            nomisId: 'A6627JH',
            establishment: 'HMP Birmingham',
            dischargeDate: '2017-07-10'
        }
    }];


    afterEach(() => {
        sandbox.reset();
    });

    it('should return expected data', () => {
        const result = licencesProxy().getLicences(['ABC123']);
        return result.then(data => {
            expect(data).to.deep.equal(expectedReturnValue);
        });
    });

    it('should call getCollection', () => {
        licencesProxy().getLicences(['ABC123']);
        expect(getCollectionStub).to.have.callCount(1);
    });

    it('should return recordset as an array', () => {
        const result = licencesProxy().getLicences(['ABC123']);

        return result.then(data => {
            expect(data).to.be.an('array');
        });
    });

    it('should pass in the correct sql for multiple nomis IDs', () => {

        const expectedClause = 'WHERE NOMIS_ID IN (\'ABC123\',\'DEF456\',\'XYZ789\')';

        licencesProxy().getLicences(['ABC123', 'DEF456', 'XYZ789']);
        const sql = getCollectionStub.getCalls()[0].args[0];
        expect(sql).includes(expectedClause);
    });

    it('should pass in the correct sql for a single nomis ID', () => {

        const expectedClause = `WHERE NOMIS_ID IN ('ABC123') FOR JSON PATH`;

        licencesProxy().getLicences(['ABC123']);
        const sql = getCollectionStub.getCalls()[0].args[0];
        expect(sql).includes(expectedClause);
    });

});
