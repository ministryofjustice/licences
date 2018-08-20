const proxyquire = require('proxyquire');
proxyquire.noCallThru();

describe('licenceClient', () => {
    let queryStub;

    const standardResponse = {
        rows: [{
            booking_id: 'A6627JH',
            stage: 'ELIGIBILITY',
            licence: {
                name: 'Bryanston, David',
                bookingId: 'A6627JH',
                establishment: 'HMP Birmingham',
                dischargeDate: '2017-07-10'
            }
        }]
    };
    const licencesProxy = (query = queryStub) => {
        return proxyquire('../../server/data/licenceClient', {
            './dataAccess/db': {
                query
            }
        });
    };

    beforeEach(() => {
        queryStub = sinon.stub().resolves(standardResponse);
    });


    describe('getLicences', function() {

        it('should call query', () => {
            licencesProxy().getLicences(['ABC123']);
            expect(queryStub).to.have.callCount(1);
        });

        it('should pass in the correct sql for multiple nomis IDs', () => {

            const expectedClause = 'where booking_id in (\'ABC123\',\'DEF456\',\'XYZ789\')';

            const result = licencesProxy().getLicences(['ABC123', 'DEF456', 'XYZ789']);

            return result.then(data => {
                expect(queryStub.getCalls()[0].args[0].text).includes(expectedClause);
            });
        });

        it('should pass in the correct sql for a single nomis ID', () => {

            const expectedClause = `where booking_id in ('ABC123')`;

            const result = licencesProxy().getLicences(['ABC123']);

            return result.then(data => {
                expect(queryStub.getCalls()[0].args[0].text).includes(expectedClause);
            });
        });

    });

    describe('createLicence', () => {

        it('should pass in the correct sql', () => {

            const expectedClause = 'insert into licences (booking_id, licence, stage, version) values ($1, $2, $3, $4)';

            const result = licencesProxy().createLicence('ABC123');

            return result.then(data => {
                expect(queryStub.getCalls()[0].args[0].text).includes(expectedClause);
            });
        });

        it('should pass in the correct parameters', () => {

            const expectedParameters = ['ABC123', {}, 'ELIGIBILITY', 1];

            const result = licencesProxy().createLicence('ABC123');

            return result.then(data => {
                const values = queryStub.getCalls()[0].args[0].values;
                expect(values).to.eql(expectedParameters);
            });
        });

        it('should pass in the correct parameters if licence passed in', () => {

            const expectedParameters = ['ABC123', {a: 'b'}, 'ELIGIBILITY', 1];

            const result = licencesProxy().createLicence('ABC123', {a: 'b'});

            return result.then(data => {
                const values = queryStub.getCalls()[0].args[0].values;
                expect(values).to.eql(expectedParameters);
            });
        });

        it('should pass in the correct parameters if stage passed in', () => {

            const expectedParameters = ['ABC123', {a: 'b'}, 'SENT', 1];

            const result = licencesProxy().createLicence('ABC123', {a: 'b'}, 'SENT');

            return result.then(data => {
                const values = queryStub.getCalls()[0].args[0].values;
                expect(values).to.eql(expectedParameters);
            });
        });
    });

    describe('updateSection', () => {

        it('should pass in the correct sql', () => {

            const expectedUpdate = 'update licences set licence = jsonb_set(licence, $1, $2)';
            const expectedWhere = 'where booking_id=$3';

            const result = licencesProxy().updateSection('section', 'ABC123', {hi: 'ho'});

            return result.then(data => {
                const sql = queryStub.getCalls()[0].args[0].text;
                expect(sql).to.include(expectedUpdate);
                expect(sql).to.include(expectedWhere);
            });
        });

        it('should pass in the correct parameters', () => {

            const expectedParameters = ['{licenceConditions}', {hi: 'ho'}, 'ABC123'];

            const result = licencesProxy().updateSection('section', 'ABC123', {hi: 'ho'});

            return result.then(data => {
                const values = queryStub.getCalls()[0].args[0].values;
                expect(values).to.eql(expectedParameters);
            });
        });
    });

    describe('getStandardConditions', () => {

        it('should call getStandardConditions', () => {
            licencesProxy().getStandardConditions();
            expect(queryStub).to.have.callCount(1);
        });
    });

    describe('getAdditionalConditions', () => {

        it('should call db.query', () => {
            licencesProxy().getAdditionalConditions();
            expect(queryStub).to.have.callCount(1);
        });

        it('should not pass parameters to query', () => {
            licencesProxy().getAdditionalConditions();

            const params = queryStub.getCalls()[0].args[0].values;
            expect(params).to.be.undefined();
        });

        describe('when no ids are passed in', () => {

            it('should use sql without IN clause', () => {
                const result = licencesProxy().getAdditionalConditions();

                return result.then(data => {
                    const sql = queryStub.getCalls()[0].args[0];
                    const expectedSql = 'where conditions.type = \'ADDITIONAL\' and active = true';
                    expect(sql).to.contain(expectedSql);
                });
            });
        });

        describe('when ids are passed in', () => {

            it('should use sql with IN clause', () => {
                const result = licencesProxy().getAdditionalConditions(['1', '2']);

                return result.then(data => {
                    const sql = queryStub.getCalls()[0].args[0];
                    const expectedSql = 'where conditions.type = \'ADDITIONAL\' and conditions.id in (\'1\',\'2\') ' +
                        'and active = true';
                    expect(sql).to.contain(expectedSql);
                });
            });

            it('should use sql with IN clause when there is 1 id', () => {
                const result = licencesProxy().getAdditionalConditions('1');

                return result.then(data => {
                    const sql = queryStub.getCalls()[0].args[0];
                    const expectedSql = 'where conditions.type = \'ADDITIONAL\' and conditions.id in (\'1\') ' +
                        'and active = true';
                    expect(sql).to.contain(expectedSql);
                });
            });
        });
    });

    describe('updateStage', () => {

        it('should pass in the correct sql', () => {

            const expectedUpdate = 'set stage = $1';
            const expectedWhere = 'where booking_id = $2';

            const result = licencesProxy().updateStage('ABC123', 'NEW_STAGE');

            return result.then(data => {
                const sql = queryStub.getCalls()[0].args[0].text;
                expect(sql).to.include(expectedUpdate);
                expect(sql).to.include(expectedWhere);
            });
        });

        it('should pass in the correct parameters', () => {

            const expectedParameters = ['NEW_STAGE', 'ABC123'];

            const result = licencesProxy().updateStage('ABC123', 'NEW_STAGE');

            return result.then(data => {
                const values = queryStub.getCalls()[0].args[0].values;
                expect(values).to.eql(expectedParameters);
            });
        });

    });

    describe('getDeliusUserName', () => {

        it('should call db.query', () => {
            licencesProxy().getDeliusUserName(5);
            expect(queryStub).to.have.callCount(1);
        });

        it('should pass in the correct parameters', () => {
            const result = licencesProxy().getDeliusUserName(5);

            return result.then(data => {
                const values = queryStub.getCalls()[0].args[0].values;
                expect(values).to.eql([5]);
            });
        });
    });

    describe('saveApprovedVersion', () => {

        it('should pass in the correct sql', () => {

            const expectedVersionUpdate = 'insert into licence_versions';
            const expectedSelect = 'select booking_id, licence, version, $1';
            const expectedWhere = 'where booking_id = $2';

            const result = licencesProxy().saveApprovedLicenceVersion('ABC123', 'templateName');

            return result.then(data => {
                const sql = queryStub.getCalls()[0].args[0].text;
                expect(sql).to.include(expectedWhere);
                expect(sql).to.include(expectedVersionUpdate);
                expect(sql).to.include(expectedSelect);
            });
        });

        it('should pass in the correct parameters', () => {
            const result = licencesProxy().saveApprovedLicenceVersion('ABC123', 'templateName');

            return result.then(data => {
                const values = queryStub.getCalls()[0].args[0].values;
                expect(values).to.eql(['templateName', 'ABC123']);
            });
        });
    });


    describe('getApprovedLicenceVersion', () => {

        it('should call query', () => {
            licencesProxy().getApprovedLicenceVersion(['ABC123']);
            expect(queryStub).to.have.callCount(1);
        });

        it('should pass in the correct sql', () => {

            const expectedSelect = 'select version, template, timestamp from licence_versions';
            const expectedWhere = 'where booking_id = $1';
            const expectedOrder = 'order by version desc limit 1';

            const result = licencesProxy().getApprovedLicenceVersion('ABC123');

            return result.then(data => {
                const sql = queryStub.getCalls()[0].args[0].text;
                expect(sql).to.include(expectedSelect);
                expect(sql).to.include(expectedWhere);
                expect(sql).to.include(expectedOrder);
            });
        });

        it('should pass in the correct parameters', () => {

            const expectedParameters = ['ABC123'];

            const result = licencesProxy().getApprovedLicenceVersion('ABC123');

            return result.then(data => {
                const values = queryStub.getCalls()[0].args[0].values;
                expect(values).to.eql(expectedParameters);
            });
        });


    });
});

