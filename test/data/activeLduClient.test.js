jest.mock('../../server/data/dataAccess/db')

const activeLduClient = require('../../server/data/activeLduClient')
const db = require('../../server/data/dataAccess/db')

afterEach(() => {
  db.query.mockReset()
})

describe('Persist and check exitence of LDUs in active_local_delivery_units table', () => {
  const lduCode = 'ABCDE'
  const probationAreaCode = 'N02'
  const activeLduCodes = ['ABCDE', 'terry', '1234']

  describe('isLduPresent', () => {
    test('should pass in the correct sql', async () => {
      db.query.mockReturnValue({ rows: [{ count: 1 }] })
      await activeLduClient.isLduPresent(lduCode, probationAreaCode)

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toContain('SELECT count(*) FROM active_local_delivery_units')
      expect(text).toContain('WHERE ldu_code=$1 AND probation_area_code=$2')
      expect(values).toEqual([lduCode, probationAreaCode])
    })

    test('should return true if ldu is present', async () => {
      db.query.mockReturnValue({ rows: [{ count: 1 }] })
      const result = await activeLduClient.isLduPresent(lduCode, probationAreaCode)
      expect(result).toBe(true)
    })

    test('should return false if ldu is not present', async () => {
      db.query.mockReturnValue({ rows: [{ count: 0 }] })

      const result = await activeLduClient.isLduPresent()
      expect(result).toBe(false)
    })
  })

  describe('allActiveLdusInArea', () => {
    const expectedResult = [{ lduCode: 'ABC' }, { lduCode: 'ABC123' }, { lduCode: 'ABC987' }]
    test('should return list of cross-matching (ie the active ones) ldus', async () => {
      db.query.mockReturnValue({ rows: expectedResult })
      const result = await activeLduClient.allActiveLdusInArea(probationAreaCode)
      expect(result).toEqual(expectedResult)

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toContain('SELECT ldu_code "code" FROM active_local_delivery_units WHERE probation_area_code=$1')
      expect(values).toStrictEqual([probationAreaCode])
    })
  })

  describe('Transaction to delete and insert LDUs in active_local_delivery_units table', () => {
    describe('updateActiveLdu', () => {
      test('should send correct SQLl', async () => {
        db.inTransaction = (callback) => callback(db)
        await activeLduClient.updateActiveLdu(probationAreaCode, activeLduCodes)
        const { text, values } = db.query.mock.calls[0][0]
        expect(text).toContain('DELETE FROM active_local_delivery_units WHERE probation_area_code = $1')
        expect(values).toStrictEqual(['N02'])

        const { text: t } = db.query.mock.calls[1][0]
        expect(t).toContain(
          "INSERT INTO active_local_delivery_units (probation_area_code, ldu_code) VALUES ('N02', 'ABCDE'), ('N02', 'terry'), ('N02', '1234')"
        )
      })
    })
  })
})
