const activeLduClient = require('../../server/data/activeLduClient')
const db = require('../../server/data/dataAccess/db')

jest.mock('../../server/data/dataAccess/db')

afterEach(() => {
  db.query.mockReset()
})

describe('Save and retrieve LDU codes', () => {
  const lduCode = 'ABCDE'
  const probationAreaCode = 'N02'

  describe('addLdu', () => {
    test('should pass in the correct sql', async () => {
      await activeLduClient.addLdu(lduCode, probationAreaCode)

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toContain(`INSERT INTO active_local_delivery_units (ldu_code, probation_area_code) VALUES ($1, $2) 
      ON CONFLICT (ldu_code) DO NOTHING`)
      expect(values).toEqual([lduCode, probationAreaCode])
    })
  })

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
})
