import { Licence } from '../../server/data/licenceTypes'
import { licenceClient } from '../../server/data/licenceClient'
import { query } from '../../server/data/dataAccess/db'

jest.mock('../../server/data/dataAccess/db')

const BOOKING_ID = 123456
const PRISON_NUMBER = 'A1234AA'

const db = { query: query as jest.Mock<Promise<any>> }

afterEach(() => {
  ;(query as jest.Mock<Promise<any>>).mockReset()
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
    db.query.mockResolvedValue(standardResponse)
  })

  describe('getLicences', () => {
    test('should call query', async () => {
      await licenceClient.getLicences([BOOKING_ID])
      expect(db.query).toHaveBeenCalled()
    })

    test('should pass in the correct sql for multiple nomis IDs', async () => {
      const expectedClause = `where l.booking_id in ('${BOOKING_ID}','4444','5555')`

      await licenceClient.getLicences([BOOKING_ID, 4444, 5555])

      expect(db.query.mock.calls[0][0].text).toContain(expectedClause)
    })

    test('should pass in the correct sql for a single nomis ID', async () => {
      const expectedClause = `where l.booking_id in ('${BOOKING_ID}')`

      await licenceClient.getLicences([BOOKING_ID])

      expect(db.query.mock.calls[0][0].text).toContain(expectedClause)
    })
  })

  describe('getLicence', () => {
    test('should pass in the correct parameters', async () => {
      await licenceClient.getLicence(10001)
      expect(db.query).toHaveBeenCalledWith({
        text: `select licence, booking_id, stage, version, vary_version, additional_conditions_version, standard_conditions_version from v_licences_excluding_deleted where booking_id = $1`,
        values: [10001],
      })
    })
  })

  describe('createLicence', () => {
    const LICENCE_SAMPLE: Licence = { eligibility: { excluded: { decision: 'Yes' } } }

    test('should pass in the correct sql', async () => {
      const expectedClause =
        'insert into licences (booking_id, prison_number, licence, stage, version, vary_version) values ($1, $2, $3, $4, $5, $6)'

      await licenceClient.createLicence(BOOKING_ID, PRISON_NUMBER)

      expect(db.query.mock.calls[0][0].text).toContain(expectedClause)
    })

    test('should pass in the correct parameters', async () => {
      const expectedParameters = [BOOKING_ID, PRISON_NUMBER, {}, 'ELIGIBILITY', 1, 0]

      await licenceClient.createLicence(BOOKING_ID, PRISON_NUMBER)

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })

    test('should pass in the correct parameters if licence passed in', async () => {
      const expectedParameters = [BOOKING_ID, PRISON_NUMBER, LICENCE_SAMPLE, 'ELIGIBILITY', 1, 0]

      await licenceClient.createLicence(BOOKING_ID, PRISON_NUMBER, LICENCE_SAMPLE)

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })

    test('should pass in the correct parameters if stage passed in', async () => {
      const expectedParameters = [BOOKING_ID, PRISON_NUMBER, LICENCE_SAMPLE, 'SENT', 1, 0]

      await licenceClient.createLicence(BOOKING_ID, PRISON_NUMBER, LICENCE_SAMPLE, 'SENT')

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })

    test('should pass in the correct parameters if varyVersion passed in', async () => {
      const expectedParameters = [BOOKING_ID, PRISON_NUMBER, LICENCE_SAMPLE, 'SENT', 1, 1]

      await licenceClient.createLicence(BOOKING_ID, PRISON_NUMBER, LICENCE_SAMPLE, 'SENT', 1, 1)

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })
  })

  describe('updateSection', () => {
    test('should pass in the correct sql', async () => {
      const expectedUpdate = 'update v_licences_excluding_deleted set licence = jsonb_set(licence, $1, $2)'
      const expectedWhere = 'where booking_id=$3'

      await licenceClient.updateSection('section', BOOKING_ID, { hi: 'ho' })

      const sql = db.query.mock.calls[0][0].text
      expect(sql).toContain(expectedUpdate)
      expect(sql).toContain(expectedWhere)
    })

    test('should pass in the correct parameters', async () => {
      const expectedParameters = ['{section}', { hi: 'ho' }, BOOKING_ID]

      await licenceClient.updateSection('section', BOOKING_ID, { hi: 'ho' })

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })

    test('should then update the version', async () => {
      const expectedContents = 'SET version = version + 1'
      const expectedContents2 = 'WHERE booking_id = $1 and version'
      const expectedContents3 = 'SELECT max(version'

      await licenceClient.updateSection('section', BOOKING_ID, { hi: 'ho' })

      const sql = db.query.mock.calls[1][0].text
      expect(sql).toContain(expectedContents)
      expect(sql).toContain(expectedContents2)
      expect(sql).toContain(expectedContents3)
    })

    test('should then update the vary_version it postApproval', async () => {
      const expectedContents = 'SET vary_version = vary_version + 1'
      const expectedContents2 = 'WHERE booking_id = $1 and vary_version'
      const expectedContents3 = 'SELECT max(vary_version'

      await licenceClient.updateSection('section', BOOKING_ID, { hi: 'ho' }, true)

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

      await licenceClient.updateStage(BOOKING_ID, 'NEW_STAGE')

      const sql = db.query.mock.calls[0][0].text
      expect(sql).toContain(expectedUpdate)
      expect(sql).toContain(expectedWhere)
    })

    test('should pass in the correct parameters', async () => {
      const expectedParameters = ['NEW_STAGE', BOOKING_ID]

      await licenceClient.updateStage(BOOKING_ID, 'NEW_STAGE')

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })
  })

  describe('getDeliusIds', () => {
    test('should call db.query', () => {
      licenceClient.getDeliusIds(5)
      expect(db.query).toHaveBeenCalled()
    })

    test('should pass in the correct params and do case-insensitive search', async () => {
      const expectedClause = 'where upper(nomis_id) = upper($1)'
      await licenceClient.getDeliusIds(5)

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toContain(expectedClause)
      expect(values).toEqual([5])
    })
  })

  describe('saveApprovedVersion', () => {
    test('should pass in the correct sql', async () => {
      const expectedVersionUpdate = 'insert into licence_versions'
      const expectedSelect = 'select prison_number, booking_id, licence, version, vary_version, $1'
      const expectedWhere = 'where booking_id = $2'

      await licenceClient.saveApprovedLicenceVersion(BOOKING_ID, 'templateName')

      const sql = db.query.mock.calls[0][0].text
      expect(sql).toContain(expectedWhere)
      expect(sql).toContain(expectedVersionUpdate)
      expect(sql).toContain(expectedSelect)
    })

    test('should pass in the correct parameters', async () => {
      await licenceClient.saveApprovedLicenceVersion(BOOKING_ID, 'templateName')

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(['templateName', BOOKING_ID])
    })
  })

  describe('getApprovedLicenceVersion', () => {
    test('should call query', () => {
      licenceClient.getApprovedLicenceVersion([BOOKING_ID])
      expect(db.query).toHaveBeenCalled()
    })

    test('should pass in the correct sql', async () => {
      const expectedSelect =
        'select version, vary_version, template, timestamp from v_licence_versions_excluding_deleted'
      const expectedWhere = 'where booking_id = $1'
      const expectedOrder = 'order by version desc, vary_version desc limit 1'

      await licenceClient.getApprovedLicenceVersion(BOOKING_ID)

      const sql = db.query.mock.calls[0][0].text
      expect(sql).toContain(expectedSelect)
      expect(sql).toContain(expectedWhere)
      expect(sql).toContain(expectedOrder)
    })

    test('should pass in the correct parameters', async () => {
      const expectedParameters = [BOOKING_ID]

      await licenceClient.getApprovedLicenceVersion(BOOKING_ID)

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })
  })

  describe('updateLicence', () => {
    test('should call db.query twice', async () => {
      await licenceClient.updateLicence(BOOKING_ID, {})
      expect(db.query).toHaveBeenCalledTimes(2)
    })

    test('should first update the licence', async () => {
      const expectedQuery = 'UPDATE v_licences_excluding_deleted SET licence = $1 where booking_id=$2'

      await licenceClient.updateLicence(BOOKING_ID, {})

      const sql = db.query.mock.calls[0][0].text
      expect(sql).toContain(expectedQuery)
    })

    test('should then update the version', async () => {
      const expectedContents = 'SET version = version + 1'
      const expectedContents2 = 'WHERE booking_id = $1 and version'
      const expectedContents3 = 'SELECT max(version'

      await licenceClient.updateLicence(BOOKING_ID, {})

      const sql = db.query.mock.calls[1][0].text
      expect(sql).toContain(expectedContents)
      expect(sql).toContain(expectedContents2)
      expect(sql).toContain(expectedContents3)
    })

    test('should then update the vary_version if postApproval', async () => {
      const expectedContents = 'SET vary_version = vary_version + 1'
      const expectedContents2 = 'WHERE booking_id = $1 and vary_version'
      const expectedContents3 = 'SELECT max(vary_version'

      await licenceClient.updateLicence(BOOKING_ID, {}, true)

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

  describe('getLicencesInStage', () => {
    test('should pass in the correct parameters', async () => {
      const expectedParameters = ['stage']

      await licenceClient.getLicencesInStage('stage')

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })
  })

  describe('setAdditionalConditionsVersion', () => {
    test('should pass in the correct parameters', async () => {
      await licenceClient.setAdditionalConditionsVersion(10001, 2)

      expect(db.query).toHaveBeenCalledWith({
        text: 'update v_licences_excluding_deleted l set additional_conditions_version = $1 where booking_id = $2',
        values: [2, 10001],
      })
    })
  })

  describe('setStandardConditionsVersion', () => {
    test('should pass in the correct parameters', async () => {
      await licenceClient.setStandardConditionsVersion(10001, 1)

      expect(db.query).toHaveBeenCalledWith({
        text: `update v_licences_excluding_deleted l
             set standard_conditions_version = $1
             where booking_id = $2`,
        values: [1, 10001],
      })
    })
  })
})
