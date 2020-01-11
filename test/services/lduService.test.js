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
    it('Should return success message', async () => {
      lduActiveClient.updateWithActiveLdu.mockResolvedValue('success')
      const result = await createLduService(deliusClient.getAllLdusForProbationArea, lduActiveClient).updateActiveLdus(
        probationAreaCode,
        activeLdus
      )
      expect(result).toEqual('success')
    })

    it('Should return failure message', async () => {
      lduActiveClient.updateWithActiveLdu.mockRejectedValue('fail')

      const result = await createLduService(deliusClient.getAllLdusForProbationArea, lduActiveClient).updateActiveLdus(
        probationAreaCode,
        activeLdus
      )
      expect(result).toEqual('fail')
    })
  })
})
