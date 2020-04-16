jest.mock('../../server/data/dataAccess/db')

const licenceClient = require('../../server/data/licenceClient')
const db = require('../../server/data/dataAccess/db')

afterEach(() => {
  db.query.mockReset()
})

describe('licenceClient', () => {
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

  beforeEach(() => {
    db.query.mockReturnValue(standardResponse)
  })

  describe('getLicences', () => {
    test('should call query', () => {
      licenceClient.getLicences(['ABC123'])
      expect(db.query).toHaveBeenCalled()
    })

    test('should pass in the correct sql for multiple nomis IDs', async () => {
      const expectedClause = "where l.booking_id in ('ABC123','DEF456','XYZ789')"

      await licenceClient.getLicences(['ABC123', 'DEF456', 'XYZ789'])

      expect(db.query.mock.calls[0][0].text).toContain(expectedClause)
    })

    test('should pass in the correct sql for a single nomis ID', async () => {
      const expectedClause = `where l.booking_id in ('ABC123')`

      await licenceClient.getLicences(['ABC123'])

      expect(db.query.mock.calls[0][0].text).toContain(expectedClause)
    })
  })

  describe('createLicence', () => {
    test('should pass in the correct sql', async () => {
      const expectedClause =
        'insert into licences (booking_id, licence, stage, version, vary_version) values ($1, $2, $3, $4, $5)'

      await licenceClient.createLicence('ABC123')

      expect(db.query.mock.calls[0][0].text).toContain(expectedClause)
    })

    test('should pass in the correct parameters', async () => {
      const expectedParameters = ['ABC123', {}, 'ELIGIBILITY', 1, 0]

      await licenceClient.createLicence('ABC123')

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })

    test('should pass in the correct parameters if licence passed in', async () => {
      const expectedParameters = ['ABC123', { a: 'b' }, 'ELIGIBILITY', 1, 0]

      await licenceClient.createLicence('ABC123', { a: 'b' })

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })

    test('should pass in the correct parameters if stage passed in', async () => {
      const expectedParameters = ['ABC123', { a: 'b' }, 'SENT', 1, 0]

      await licenceClient.createLicence('ABC123', { a: 'b' }, 'SENT')

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })

    test('should pass in the correct parameters if varyVersion passed in', async () => {
      const expectedParameters = ['ABC123', { a: 'b' }, 'SENT', 1, 1]

      await licenceClient.createLicence('ABC123', { a: 'b' }, 'SENT', 1, 1)

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })
  })

  describe('updateSection', () => {
    test('should pass in the correct sql', async () => {
      const expectedUpdate = 'update licences set licence = jsonb_set(licence, $1, $2)'
      const expectedWhere = 'where booking_id=$3'

      await licenceClient.updateSection('section', 'ABC123', { hi: 'ho' })

      const sql = db.query.mock.calls[0][0].text
      expect(sql).toContain(expectedUpdate)
      expect(sql).toContain(expectedWhere)
    })

    test('should pass in the correct parameters', async () => {
      const expectedParameters = ['{section}', { hi: 'ho' }, 'ABC123']

      await licenceClient.updateSection('section', 'ABC123', { hi: 'ho' })

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })

    test('should then update the version', async () => {
      const expectedContents = 'SET version = version + 1'
      const expectedContents2 = 'WHERE booking_id = $1 and version'
      const expectedContents3 = 'SELECT max(version'

      await licenceClient.updateSection('section', 'ABC123', { hi: 'ho' })

      const sql = db.query.mock.calls[1][0].text
      expect(sql).toContain(expectedContents)
      expect(sql).toContain(expectedContents2)
      expect(sql).toContain(expectedContents3)
    })

    test('should then update the vary_version it postApproval', async () => {
      const expectedContents = 'SET vary_version = vary_version + 1'
      const expectedContents2 = 'WHERE booking_id = $1 and vary_version'
      const expectedContents3 = 'SELECT max(vary_version'

      await licenceClient.updateSection('section', 'ABC123', { hi: 'ho' }, true)

      const sql = db.query.mock.calls[1][0].text
      expect(sql).toContain(expectedContents)
      expect(sql).toContain(expectedContents2)
      expect(sql).toContain(expectedContents3)
    })
  })

  describe('updateStage', () => {
    test('should pass in the correct sql', async () => {
      const expectedUpdate = 'set (stage, transition_date) = ($1, current_timestamp) '
      const expectedWhere = 'where booking_id = $2'

      await licenceClient.updateStage('ABC123', 'NEW_STAGE')

      const sql = db.query.mock.calls[0][0].text
      expect(sql).toContain(expectedUpdate)
      expect(sql).toContain(expectedWhere)
    })

    test('should pass in the correct parameters', async () => {
      const expectedParameters = ['NEW_STAGE', 'ABC123']

      await licenceClient.updateStage('ABC123', 'NEW_STAGE')

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })
  })

  describe('getDeliusUserName', () => {
    test('should call db.query', () => {
      licenceClient.getDeliusUserName(5)
      expect(db.query).toHaveBeenCalled()
    })

    test('should pass in the correct params and do case-insensitive search', async () => {
      const expectedClause = 'where upper(nomis_id) = upper($1)'
      await licenceClient.getDeliusUserName(5)

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toContain(expectedClause)
      expect(values).toEqual([5])
    })
  })

  describe('saveApprovedVersion', () => {
    test('should pass in the correct sql', async () => {
      const expectedVersionUpdate = 'insert into licence_versions'
      const expectedSelect = 'select booking_id, licence, version, vary_version, $1'
      const expectedWhere = 'where booking_id = $2'

      await licenceClient.saveApprovedLicenceVersion('ABC123', 'templateName')

      const sql = db.query.mock.calls[0][0].text
      expect(sql).toContain(expectedWhere)
      expect(sql).toContain(expectedVersionUpdate)
      expect(sql).toContain(expectedSelect)
    })

    test('should pass in the correct parameters', async () => {
      await licenceClient.saveApprovedLicenceVersion('ABC123', 'templateName')

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(['templateName', 'ABC123'])
    })
  })

  describe('getApprovedLicenceVersion', () => {
    test('should call query', () => {
      licenceClient.getApprovedLicenceVersion(['ABC123'])
      expect(db.query).toHaveBeenCalled()
    })

    test('should pass in the correct sql', async () => {
      const expectedSelect = 'select version, vary_version, template, timestamp from licence_versions'
      const expectedWhere = 'where booking_id = $1'
      const expectedOrder = 'order by version desc, vary_version desc limit 1'

      await licenceClient.getApprovedLicenceVersion('ABC123')

      const sql = db.query.mock.calls[0][0].text
      expect(sql).toContain(expectedSelect)
      expect(sql).toContain(expectedWhere)
      expect(sql).toContain(expectedOrder)
    })

    test('should pass in the correct parameters', async () => {
      const expectedParameters = ['ABC123']

      await licenceClient.getApprovedLicenceVersion('ABC123')

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })
  })

  describe('updateLicence', () => {
    test('should call db.query twice', async () => {
      await licenceClient.updateLicence('ABC123', {})
      expect(db.query).toHaveBeenCalledTimes(2)
    })

    test('should first update the licence', async () => {
      const expectedQuery = 'UPDATE licences SET licence = $1 where booking_id=$2'

      await licenceClient.updateLicence('ABC123', {})

      const sql = db.query.mock.calls[0][0].text
      expect(sql).toContain(expectedQuery)
    })

    test('should then update the version', async () => {
      const expectedContents = 'SET version = version + 1'
      const expectedContents2 = 'WHERE booking_id = $1 and version'
      const expectedContents3 = 'SELECT max(version'

      await licenceClient.updateLicence('ABC123', {})

      const sql = db.query.mock.calls[1][0].text
      expect(sql).toContain(expectedContents)
      expect(sql).toContain(expectedContents2)
      expect(sql).toContain(expectedContents3)
    })

    test('should then update the vary_version if postApproval', async () => {
      const expectedContents = 'SET vary_version = vary_version + 1'
      const expectedContents2 = 'WHERE booking_id = $1 and vary_version'
      const expectedContents3 = 'SELECT max(vary_version'

      await licenceClient.updateLicence('ABC123', {}, true)

      const sql = db.query.mock.calls[1][0].text
      expect(sql).toContain(expectedContents)
      expect(sql).toContain(expectedContents2)
      expect(sql).toContain(expectedContents3)
    })
  })

  describe('getLicencesInStageBetweenDates', () => {
    test('should pass in the correct parameters', async () => {
      const expectedParameters = ['stage', 'from', 'upto']

      await licenceClient.getLicencesInStageBetweenDates('stage', 'from', 'upto')

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })
  })

  describe('getLicencesInStageBeforeDate', () => {
    test('should pass in the correct parameters', async () => {
      const expectedParameters = ['stage', 'upto']

      await licenceClient.getLicencesInStageBeforeDate('stage', 'upto')

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })
  })
})
