const proxyquire = require('proxyquire');
proxyquire.noCallThru();
const TYPES = require('tedious').TYPES;

const {
    expect,
    sandbox
} = require('../testSetup');


describe('licenceClient', () => {

    const getCollectionStub = sandbox.stub();
    const addRowStub = sandbox.stub();

    const licencesProxy = (getCollection = getCollectionStub, addRow = addRowStub) => {
        return proxyquire('../../server/data/licenceClient', {
            './dataAccess/dbMethods': {
                getCollection,
                addRow
            }
        });
    };

    afterEach(() => {
        sandbox.reset();
    });

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

        it('should return expected data', () => {
            getCollectionStub.callsArgWith(2, standardResponse);
            return expect(licencesProxy().getLicences(['ABC123'])).to.eventually.eql(expectedReturnValue);
        });

        it('should call getCollection', () => {
            licencesProxy().getLicences(['ABC123']);
            expect(getCollectionStub).to.have.callCount(1);
        });

        it('should return recordset as an array', () => {
            getCollectionStub.callsArgWith(2, standardResponse);
            return expect(licencesProxy().getLicences(['ABC123'])).to.eventually.be.an('array');
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

    describe('createLicence', () => {

        addRowStub.callsArg(2);

        it('should pass in the correct sql', () => {

            const expectedClause = 'INSERT INTO LICENCES (NOMIS_ID, LICENCE, STATUS) ' +
                'VALUES (@nomisId, @licence, @status)';

            licencesProxy().createLicence('ABC123');
            const sql = addRowStub.getCalls()[0].args[0];
            expect(sql).to.eql(expectedClause);
        });

        it('should pass in the correct parameters', () => {

            const expectedParameters = [
                {column: 'nomisId', type: TYPES.VarChar, value: 'ABC123'},
                {column: 'licence', type: TYPES.VarChar, value: JSON.stringify({})},
                {column: 'status', type: TYPES.VarChar, value: 'STARTED'}
            ];

            licencesProxy().createLicence('ABC123');
            const sql = addRowStub.getCalls()[0].args[1];
            expect(sql).to.eql(expectedParameters);
        });

        it('should pass in the correct parameters if licence passed in', () => {

            const expectedParameters = [
                {column: 'nomisId', type: TYPES.VarChar, value: 'ABC123'},
                {column: 'licence', type: TYPES.VarChar, value: JSON.stringify({a: 'b'})},
                {column: 'status', type: TYPES.VarChar, value: 'STARTED'}
            ];

            licencesProxy().createLicence('ABC123', {a: 'b'});
            const sql = addRowStub.getCalls()[0].args[1];
            expect(sql).to.eql(expectedParameters);
        });

        it('should pass in the correct parameters if status passed in', () => {

            const expectedParameters = [
                {column: 'nomisId', type: TYPES.VarChar, value: 'ABC123'},
                {column: 'licence', type: TYPES.VarChar, value: JSON.stringify({a: 'b'})},
                {column: 'status', type: TYPES.VarChar, value: 'SENT'}
            ];

            licencesProxy().createLicence('ABC123', {a: 'b'}, 'SENT');
            const sql = addRowStub.getCalls()[0].args[1];
            expect(sql).to.eql(expectedParameters);
        });
    });

    describe('updateSection', () => {
        addRowStub.callsArgWith(2);

        it('should pass in the correct sql', () => {

            const expectedUpdate = 'SET LICENCE = JSON_MODIFY(LICENCE, @section, JSON_QUERY(@object))';
            const expectedWhere = 'WHERE NOMIS_ID=@nomisId';

            licencesProxy().updateSection('section', 'ABC123', {hi: 'ho'});
            const sql = addRowStub.getCalls()[0].args[0];
            expect(sql).to.include(expectedUpdate);
            expect(sql).to.include(expectedWhere);
        });

        it('should pass in the correct parameters', () => {

            const expectedParameters = [
                {column: 'section', type: TYPES.VarChar, value: '$.section'},
                {column: 'object', type: TYPES.VarChar, value: JSON.stringify({hi: 'ho'})},
                {column: 'nomisId', type: TYPES.VarChar, value: 'ABC123'}
            ];

            licencesProxy().updateSection('section', 'ABC123', {hi: 'ho'});
            const params = addRowStub.getCalls()[0].args[1];
            expect(params).to.eql(expectedParameters);
        });

    });

    describe('getStandardConditions', () => {
        const standardConditions = [
            {
                ID: '1',
                TIMESTAMP: '2017-10-26',
                TYPE: 'STANDARD',
                TEXT: 'Text'
            },
            {
                ID: '2',
                TIMESTAMP: '2017-10-26',
                TYPE: 'STANDARD',
                TEXT: 'Text2'
            }
        ];

        it('should return expected conditions data', () => {
            getCollectionStub.callsArgWith(2, standardConditions);
            const result = licencesProxy().getStandardConditions();
            return result.then(data => {
                expect(data).to.deep.equal(standardConditions);
            });
        });

        it('should call getStandardConditions', () => {
            licencesProxy().getStandardConditions();
            expect(getCollectionStub).to.have.callCount(1);
        });
    });
});

