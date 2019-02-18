const proxyquire = require('proxyquire')

proxyquire.noCallThru()

describe('licenceClient', () => {
    let queryStub

    const standardResponse = {
        rows: [
            {
                booking_id: 'A6627JH',
                stage: 'ELIGIBILITY',
                licence: {
                    name: 'Bryanston, David',
                    nomisId: 'A6627JH',
                    establishment: 'HMP Birmingham',
                    dischargeDate: '2017-07-10',
                },
            },
        ],
    }
    const licencesProxy = (query = queryStub) => {
        return proxyquire('../../server/data/licenceClient', {
            './dataAccess/db': {
                query,
            },
        })
    }

    beforeEach(() => {
        queryStub = sinon.stub().resolves(standardResponse)
    })

    describe('getLicences', () => {
        it('should call query', () => {
            licencesProxy().getLicences(['ABC123'])
            expect(queryStub).to.have.callCount(1)
        })

        it('should pass in the correct sql for multiple nomis IDs', () => {
            const expectedClause = "where l.booking_id in ('ABC123','DEF456','XYZ789')"

            const result = licencesProxy().getLicences(['ABC123', 'DEF456', 'XYZ789'])

            return result.then(() => {
                expect(queryStub.getCalls()[0].args[0].text).includes(expectedClause)
            })
        })

        it('should pass in the correct sql for a single nomis ID', () => {
            const expectedClause = `where l.booking_id in ('ABC123')`

            const result = licencesProxy().getLicences(['ABC123'])

            return result.then(() => {
                expect(queryStub.getCalls()[0].args[0].text).includes(expectedClause)
            })
        })
    })

    describe('createLicence', () => {
        it('should pass in the correct sql', () => {
            const expectedClause =
                'insert into licences (booking_id, licence, stage, version, vary_version) values ($1, $2, $3, $4, $5)'

            const result = licencesProxy().createLicence('ABC123')

            return result.then(() => {
                expect(queryStub.getCalls()[0].args[0].text).includes(expectedClause)
            })
        })

        it('should pass in the correct parameters', () => {
            const expectedParameters = ['ABC123', {}, 'ELIGIBILITY', 1, 0]

            const result = licencesProxy().createLicence('ABC123')

            return result.then(() => {
                const { values } = queryStub.getCalls()[0].args[0]
                expect(values).to.eql(expectedParameters)
            })
        })

        it('should pass in the correct parameters if licence passed in', () => {
            const expectedParameters = ['ABC123', { a: 'b' }, 'ELIGIBILITY', 1, 0]

            const result = licencesProxy().createLicence('ABC123', { a: 'b' })

            return result.then(() => {
                const { values } = queryStub.getCalls()[0].args[0]
                expect(values).to.eql(expectedParameters)
            })
        })

        it('should pass in the correct parameters if stage passed in', () => {
            const expectedParameters = ['ABC123', { a: 'b' }, 'SENT', 1, 0]

            const result = licencesProxy().createLicence('ABC123', { a: 'b' }, 'SENT')

            return result.then(() => {
                const { values } = queryStub.getCalls()[0].args[0]
                expect(values).to.eql(expectedParameters)
            })
        })

        it('should pass in the correct parameters if varyVersion passed in', () => {
            const expectedParameters = ['ABC123', { a: 'b' }, 'SENT', 1, 1]

            const result = licencesProxy().createLicence('ABC123', { a: 'b' }, 'SENT', 1, 1)

            return result.then(() => {
                const { values } = queryStub.getCalls()[0].args[0]
                expect(values).to.eql(expectedParameters)
            })
        })
    })

    describe('updateSection', () => {
        it('should pass in the correct sql', () => {
            const expectedUpdate = 'update licences set licence = jsonb_set(licence, $1, $2)'
            const expectedWhere = 'where booking_id=$3'

            const result = licencesProxy().updateSection('section', 'ABC123', { hi: 'ho' })

            return result.then(() => {
                const sql = queryStub.getCalls()[0].args[0].text
                expect(sql).to.include(expectedUpdate)
                expect(sql).to.include(expectedWhere)
            })
        })

        it('should pass in the correct parameters', () => {
            const expectedParameters = ['{section}', { hi: 'ho' }, 'ABC123']

            const result = licencesProxy().updateSection('section', 'ABC123', { hi: 'ho' })

            return result.then(() => {
                const { values } = queryStub.getCalls()[0].args[0]
                expect(values).to.eql(expectedParameters)
            })
        })

        it('should then update the version', async () => {
            const expectedContents = 'SET version = version + 1'
            const expectedContents2 = 'WHERE booking_id = $1 and version'
            const expectedContents3 = 'SELECT max(version'

            await licencesProxy().updateSection('section', 'ABC123', { hi: 'ho' })

            const sql = queryStub.getCalls()[1].args[0].text
            expect(sql).to.include(expectedContents)
            expect(sql).to.include(expectedContents2)
            expect(sql).to.include(expectedContents3)
        })

        it('should then update the vary_version it postApproval', async () => {
            const expectedContents = 'SET vary_version = vary_version + 1'
            const expectedContents2 = 'WHERE booking_id = $1 and vary_version'
            const expectedContents3 = 'SELECT max(vary_version'

            await licencesProxy().updateSection('section', 'ABC123', { hi: 'ho' }, true)

            const sql = queryStub.getCalls()[1].args[0].text
            expect(sql).to.include(expectedContents)
            expect(sql).to.include(expectedContents2)
            expect(sql).to.include(expectedContents3)
        })
    })

    describe('updateStage', () => {
        it('should pass in the correct sql', () => {
            const expectedUpdate = 'set (stage, transition_date) = ($1, current_timestamp) '
            const expectedWhere = 'where booking_id = $2'

            const result = licencesProxy().updateStage('ABC123', 'NEW_STAGE')

            return result.then(() => {
                const sql = queryStub.getCalls()[0].args[0].text
                expect(sql).to.include(expectedUpdate)
                expect(sql).to.include(expectedWhere)
            })
        })

        it('should pass in the correct parameters', () => {
            const expectedParameters = ['NEW_STAGE', 'ABC123']

            const result = licencesProxy().updateStage('ABC123', 'NEW_STAGE')

            return result.then(() => {
                const { values } = queryStub.getCalls()[0].args[0]
                expect(values).to.eql(expectedParameters)
            })
        })
    })

    describe('getDeliusUserName', () => {
        it('should call db.query', () => {
            licencesProxy().getDeliusUserName(5)
            expect(queryStub).to.have.callCount(1)
        })

        it('should pass in the correct parameters', () => {
            const result = licencesProxy().getDeliusUserName(5)

            return result.then(() => {
                const { values } = queryStub.getCalls()[0].args[0]
                expect(values).to.eql([5])
            })
        })
    })

    describe('saveApprovedVersion', () => {
        it('should pass in the correct sql', () => {
            const expectedVersionUpdate = 'insert into licence_versions'
            const expectedSelect = 'select booking_id, licence, version, vary_version, $1'
            const expectedWhere = 'where booking_id = $2'

            const result = licencesProxy().saveApprovedLicenceVersion('ABC123', 'templateName')

            return result.then(() => {
                const sql = queryStub.getCalls()[0].args[0].text
                expect(sql).to.include(expectedWhere)
                expect(sql).to.include(expectedVersionUpdate)
                expect(sql).to.include(expectedSelect)
            })
        })

        it('should pass in the correct parameters', () => {
            const result = licencesProxy().saveApprovedLicenceVersion('ABC123', 'templateName')

            return result.then(() => {
                const { values } = queryStub.getCalls()[0].args[0]
                expect(values).to.eql(['templateName', 'ABC123'])
            })
        })
    })

    describe('getApprovedLicenceVersion', () => {
        it('should call query', () => {
            licencesProxy().getApprovedLicenceVersion(['ABC123'])
            expect(queryStub).to.have.callCount(1)
        })

        it('should pass in the correct sql', () => {
            const expectedSelect = 'select version, vary_version, template, timestamp from licence_versions'
            const expectedWhere = 'where booking_id = $1'
            const expectedOrder = 'order by version desc, vary_version desc limit 1'

            const result = licencesProxy().getApprovedLicenceVersion('ABC123')

            return result.then(() => {
                const sql = queryStub.getCalls()[0].args[0].text
                expect(sql).to.include(expectedSelect)
                expect(sql).to.include(expectedWhere)
                expect(sql).to.include(expectedOrder)
            })
        })

        it('should pass in the correct parameters', () => {
            const expectedParameters = ['ABC123']

            const result = licencesProxy().getApprovedLicenceVersion('ABC123')

            return result.then(() => {
                const { values } = queryStub.getCalls()[0].args[0]
                expect(values).to.eql(expectedParameters)
            })
        })
    })

    describe('updateLicence', () => {
        it('should call db.query twice', async () => {
            await licencesProxy().updateLicence('ABC123', {})
            expect(queryStub).to.have.callCount(2)
        })

        it('should first update the licence', async () => {
            const expectedQuery = 'UPDATE licences SET licence = $1 where booking_id=$2'

            await licencesProxy().updateLicence('ABC123', {})

            const sql = queryStub.getCalls()[0].args[0].text
            expect(sql).to.include(expectedQuery)
        })

        it('should then update the version', async () => {
            const expectedContents = 'SET version = version + 1'
            const expectedContents2 = 'WHERE booking_id = $1 and version'
            const expectedContents3 = 'SELECT max(version'

            await licencesProxy().updateLicence('ABC123', {})

            const sql = queryStub.getCalls()[1].args[0].text
            expect(sql).to.include(expectedContents)
            expect(sql).to.include(expectedContents2)
            expect(sql).to.include(expectedContents3)
        })

        it('should then update the vary_version it postApproval', async () => {
            const expectedContents = 'SET vary_version = vary_version + 1'
            const expectedContents2 = 'WHERE booking_id = $1 and vary_version'
            const expectedContents3 = 'SELECT max(vary_version'

            await licencesProxy().updateLicence('ABC123', {}, true)

            const sql = queryStub.getCalls()[1].args[0].text
            expect(sql).to.include(expectedContents)
            expect(sql).to.include(expectedContents2)
            expect(sql).to.include(expectedContents3)
        })
    })
})
