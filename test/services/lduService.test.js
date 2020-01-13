const createLduService = require('../../server/services/lduService')

const deliusClient = { getAllLdusForProbationArea: jest.fn() }
const lduActiveClient = { allActiveLdusInArea: jest.fn(), updateWithActiveLdu: jest.fn() }
const onlyActiveLdus = ['ABC123', 'DEF345']
const probationAreaCode = 'N02'
const activeLdus = {}

describe('lduService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  describe('getActiveLdusForProbationArea', () => {
    it('Should return an array of only the active LDUs', async () => {
      lduActiveClient.allActiveLdusInArea.mockResolvedValue(onlyActiveLdus)
      const result = await createLduService(
        deliusClient.getAllLdusForProbationArea,
        lduActiveClient
      ).getActiveLdusForProbationArea(probationAreaCode)
      expect(result).toEqual(['ABC123', 'DEF345'])
    })

    it('Should Not return LDUs not in the DB', async () => {
      lduActiveClient.allActiveLdusInArea.mockResolvedValue(onlyActiveLdus)
      const result = await createLduService(
        deliusClient.getAllLdusForProbationArea,
        lduActiveClient
      ).getActiveLdusForProbationArea(probationAreaCode)
      expect(result).not.toEqual(['ABC123', 'DEF345', 'XYZ'])
    })
  })

  describe('updateActiveLdus', () => {
    it('Should return true if successful message', async () => {
      lduActiveClient.updateWithActiveLdu.mockResolvedValue(true)
      const result = await createLduService(deliusClient.getAllLdusForProbationArea, lduActiveClient).updateActiveLdus(
        probationAreaCode,
        activeLdus
      )
      expect(result).toBe(true)
    })

    it('Should return false if operation failed', async () => {
      lduActiveClient.updateWithActiveLdu.mockRejectedValue(false)

      const result = await createLduService(deliusClient.getAllLdusForProbationArea, lduActiveClient).updateActiveLdus(
        probationAreaCode,
        activeLdus
      )
      expect(result).toBe(false)
    })
  })
})
