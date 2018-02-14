const proxyquire = require('proxyquire');
proxyquire.noCallThru();
const TYPES = require('tedious').TYPES;

const {
    expect,
    sandbox
} = require('../testSetup');


describe('licenceClient', () => {

    const getCollectionStub = sandbox.stub();
    const execSqlStub = sandbox.stub();

    const licencesProxy = (getCollection = getCollectionStub, execSql = execSqlStub) => {
        return proxyquire('../../server/data/licenceClient', {
            './dataAccess/dbMethods': {
                getCollection,
                execSql
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

        execSqlStub.callsArg(2);

        it('should pass in the correct sql', () => {

            const expectedClause = 'INSERT INTO LICENCES (NOMIS_ID, LICENCE, STATUS) ' +
                'VALUES (@nomisId, @licence, @status)';

            licencesProxy().createLicence('ABC123');
            const sql = execSqlStub.getCalls()[0].args[0];
            expect(sql).to.eql(expectedClause);
        });

        it('should pass in the correct parameters', () => {

            const expectedParameters = [
                {column: 'nomisId', type: TYPES.VarChar, value: 'ABC123'},
                {column: 'licence', type: TYPES.VarChar, value: JSON.stringify({})},
                {column: 'status', type: TYPES.VarChar, value: 'ELIGIBILITY'}
            ];

            licencesProxy().createLicence('ABC123');
            const sql = execSqlStub.getCalls()[0].args[1];
            expect(sql).to.eql(expectedParameters);
        });

        it('should pass in the correct parameters if licence passed in', () => {

            const expectedParameters = [
                {column: 'nomisId', type: TYPES.VarChar, value: 'ABC123'},
                {column: 'licence', type: TYPES.VarChar, value: JSON.stringify({a: 'b'})},
                {column: 'status', type: TYPES.VarChar, value: 'ELIGIBILITY'}
            ];

            licencesProxy().createLicence('ABC123', {a: 'b'});
            const sql = execSqlStub.getCalls()[0].args[1];
            expect(sql).to.eql(expectedParameters);
        });

        it('should pass in the correct parameters if status passed in', () => {

            const expectedParameters = [
                {column: 'nomisId', type: TYPES.VarChar, value: 'ABC123'},
                {column: 'licence', type: TYPES.VarChar, value: JSON.stringify({a: 'b'})},
                {column: 'status', type: TYPES.VarChar, value: 'SENT'}
            ];

            licencesProxy().createLicence('ABC123', {a: 'b'}, 'SENT');
            const sql = execSqlStub.getCalls()[0].args[1];
            expect(sql).to.eql(expectedParameters);
        });
    });

    describe('updateSection', () => {
        execSqlStub.callsArgWith(2);

        it('should pass in the correct sql', () => {

            const expectedUpdate = 'SET LICENCE = JSON_MODIFY(LICENCE, @section, JSON_QUERY(@object))';
            const expectedWhere = 'WHERE NOMIS_ID=@nomisId';

            licencesProxy().updateSection('section', 'ABC123', {hi: 'ho'});
            const sql = execSqlStub.getCalls()[0].args[0];
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
            const params = execSqlStub.getCalls()[0].args[1];
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

        it('should return expected conditions data', async () => {
            getCollectionStub.callsArgWith(2, standardConditions);
            const result = await licencesProxy().getStandardConditions();

            return expect(result).to.deep.equal(standardConditions);
        });

        it('should call getStandardConditions', () => {
            licencesProxy().getStandardConditions();
            expect(getCollectionStub).to.have.callCount(1);
        });
    });

    describe('getAdditionalConditions', () => {

        const additionalConditionsResponse = [
            {
                ID: '1',
                TIMESTAMP: '2017-10-26',
                TYPE: 'ADDITIONAL',
                TEXT: 'Text',
                FIELD_POSITION: {value: '{"a": "Text2"}'}
            },
            {
                ID: '2',
                TIMESTAMP: '2017-10-26',
                TYPE: 'ADDITIONAL',
                TEXT: 'Text2',
                FIELD_POSITION: {value: '{"a": "Text2"}'}
            }
        ];

        const additionalConditions = [
            {
                ID: '1',
                TIMESTAMP: '2017-10-26',
                TYPE: 'ADDITIONAL',
                TEXT: 'Text',
                FIELD_POSITION: {value: {a: 'Text2'}}
            },
            {
                ID: '2',
                TIMESTAMP: '2017-10-26',
                TYPE: 'ADDITIONAL',
                TEXT: 'Text2',
                FIELD_POSITION: {value: {a: 'Text2'}}
            }
        ];

        it('it should return expected additional conditions data', async () => {
            getCollectionStub.callsArgWith(2, additionalConditionsResponse);
            const result = await licencesProxy().getAdditionalConditions();

            return expect(result).to.deep.equal(additionalConditions);
        });

        it('should call get collection from dbMethods', () => {
            licencesProxy().getAdditionalConditions();
            expect(getCollectionStub).to.have.callCount(1);
        });

        it('should not pass parameters to get collection', () => {
            licencesProxy().getAdditionalConditions();

            const params = getCollectionStub.getCalls()[0].args[1];
            expect(params).to.be.null();
        });

        describe('when no ids are passed in', () => {

            it('should use sql without IN clause', () => {
                licencesProxy().getAdditionalConditions();

                const sql = getCollectionStub.getCalls()[0].args[0];
                const expectedSql = 'WHERE CONDITIONS.TYPE = \'ADDITIONAL\' AND ACTIVE = 1';
                expect(sql).to.contain(expectedSql);
            });
        });

        describe('when ids are passed in', () => {

            it('should use sql with IN clause', () => {
                licencesProxy().getAdditionalConditions(['1', '2']);

                const sql = getCollectionStub.getCalls()[0].args[0];
                const expectedSql = 'WHERE CONDITIONS.TYPE = \'ADDITIONAL\' AND CONDITIONS.ID IN (\'1\',\'2\') ' +
                    'AND ACTIVE = 1';
                expect(sql).to.contain(expectedSql);
            });

            it('should use sql with IN clause when there is 1 id', () => {
                licencesProxy().getAdditionalConditions('1');

                const sql = getCollectionStub.getCalls()[0].args[0];
                const expectedSql = 'WHERE CONDITIONS.TYPE = \'ADDITIONAL\' AND CONDITIONS.ID IN (\'1\') ' +
                    'AND ACTIVE = 1';
                expect(sql).to.contain(expectedSql);
            });
        });
    });

    describe('updateStatus', () => {
        execSqlStub.callsArgWith(2);

        it('should pass in the correct sql', () => {

            const expectedUpdate = 'SET STATUS = @status';
            const expectedWhere = 'WHERE NOMIS_ID = @nomisId';

            licencesProxy().updateStatus('ABC123', 'NEW_STATUS');
            const sql = execSqlStub.getCalls()[0].args[0];
            expect(sql).to.include(expectedUpdate);
            expect(sql).to.include(expectedWhere);
        });

        it('should pass in the correct parameters', () => {

            const expectedParameters = [
                {column: 'status', type: TYPES.VarChar, value: 'NEW_STATUS'},
                {column: 'nomisId', type: TYPES.VarChar, value: 'ABC123'}
            ];

            licencesProxy().updateStatus('ABC123', 'NEW_STATUS');
            const params = execSqlStub.getCalls()[0].args[1];
            expect(params).to.eql(expectedParameters);
        });

    });

    describe('getDeliusUserName', () => {

        const deliusUserName = [{ID: '1'}];

        it('it should return expected deliusUserName', async () => {
            getCollectionStub.callsArgWith(2, deliusUserName);
            const result = await licencesProxy().getDeliusUserName(5);

            return expect(result).to.deep.equal(deliusUserName);
        });

        it('should call get collection from dbMethods', () => {
            licencesProxy().getDeliusUserName(5);
            expect(getCollectionStub).to.have.callCount(1);
        });

        it('should pass parameters to get collection', () => {
            licencesProxy().getDeliusUserName(5);

            const params = getCollectionStub.getCalls()[0].args[1];
            expect(params).to.eql([
                {column: 'nomisUserName', type: TYPES.VarChar, value: 5}
            ]);
        });
    });
});

