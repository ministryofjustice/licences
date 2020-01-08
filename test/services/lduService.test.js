const createLduService = require('../../server/services/lduService')

const deliusClient = { getAllLdusForProbationArea: jest.fn() }
const lduActiveClient = { allActiveLdusInArea: jest.fn() }
const onlyActiveLdus = ['ABC123', 'DEF345']
const probationAreaCode = 'N02'

describe('lduService', () => {
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

  describe('updateActiveLdus', async () => {
    it('Should save to the DB', () => {})
  })
})
