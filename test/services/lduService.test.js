const createLduService = require('../../server/services/lduService')

const deliusClient = {
  getAllLdusForProbationArea: jest.fn(),
  getAllProbationAreas: jest.fn(),
}
const activeLduClient = {
  allActiveLdusInArea: jest.fn(),
  updateActiveLdu: jest.fn(),
}

const probationAreaCode = 'N02'
const activeLdus = ['ABC1234', 'DEF345']
let lduService

describe('lduService', () => {
  beforeEach(async () => {
    lduService = await createLduService(deliusClient, activeLduClient)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getAllProbationAreas', () => {
    it('Should return an array of Probation areas', async () => {
      deliusClient.getAllProbationAreas.mockResolvedValue([
        { code: 'ABC123', description: 'desc-1' },
        { code: 'DEF345', description: 'desc-2' },
      ])

      const result = await lduService.getAllProbationAreas()

      expect(result).toEqual([{ code: 'ABC123', description: 'desc-1' }, { code: 'DEF345', description: 'desc-2' }])

      expect(deliusClient.getAllProbationAreas).toHaveBeenCalled()
    })
  })

  describe('getLdusForProbationArea', () => {
    it('Should return an array of only the active LDUs', async () => {
      deliusClient.getAllLdusForProbationArea.mockResolvedValue([
        { code: 'ABC123', description: 'desc-1' },
        { code: 'DEF345', description: 'desc-2' },
        { code: 'GHI678', description: 'desc-3' },
      ])

      activeLduClient.allActiveLdusInArea.mockResolvedValue([{ code: 'ABC123' }, { code: 'GHI678' }])

      const result = await lduService.getLdusForProbationArea(probationAreaCode)
      expect(result).toEqual([
        { code: 'ABC123', description: 'desc-1', active: true },
        { code: 'DEF345', description: 'desc-2', active: false },
        { code: 'GHI678', description: 'desc-3', active: true },
      ])
    })
  })

  describe('updateActiveLdus', () => {
    it('Should call the activeLduClient to persist the new LDUs', async () => {
      await lduService.updateActiveLdus(probationAreaCode, activeLdus)

      expect(activeLduClient.updateActiveLdu).toHaveBeenCalledWith(probationAreaCode, activeLdus)
    })
  })
})
