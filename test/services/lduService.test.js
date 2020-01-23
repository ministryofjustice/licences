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
    deliusClient.getAllProbationAreas.mockResolvedValue({
      content: [{ code: 'ABC123', description: 'desc-1' }, { code: 'DEF345', description: 'desc-2' }],
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getAllProbationAreas', () => {
    it('Should return an array of Probation areas', async () => {
      await lduService.getAllProbationAreas()
      expect(deliusClient.getAllProbationAreas).toHaveBeenCalled()
    })

    it('Should sort probation areas by description in alpha order', async () => {
      const result = await lduService.getAllProbationAreas()
      expect(result).toEqual([{ code: 'ABC123', description: 'desc-1' }, { code: 'DEF345', description: 'desc-2' }])
      expect(result).not.toEqual([{ code: 'DEF345', description: 'desc-2' }, { code: 'ABC123', description: 'desc-1' }])
    })
  })

  describe('getProbationArea', () => {
    it(`Should return all the LDUs from Delius for London and cross match with those in active_local_delivery_units table in DB. 
    Those that cross-matchs will have a 'active = true' status`, async () => {
      deliusClient.getAllLdusForProbationArea.mockResolvedValue({
        content: [
          { code: 'ham', description: 'Hampstead' },
          { code: 'wtl', description: 'Waterloo' },
          { code: 'pic', description: 'Picadilly' },
        ],
      })

      deliusClient.getAllProbationAreas.mockResolvedValue({ content: [{ code: 'Lon', description: 'London' }] })
      activeLduClient.allActiveLdusInArea.mockResolvedValue([{ code: 'ham' }, { code: 'pic' }])

      const result = await lduService.getProbationArea('Lon')

      expect(result).toEqual({
        code: 'Lon',
        description: 'London',
        ldus: [
          { code: 'ham', description: 'Hampstead', active: true },
          { code: 'pic', description: 'Picadilly', active: true },
          { code: 'wtl', description: 'Waterloo', active: false },
        ],
      })
    })

    it('Should remove duplicate ldus and only show the first description', async () => {
      deliusClient.getAllLdusForProbationArea.mockResolvedValue({
        content: [
          { code: 'ham', description: 'Hampstead' },
          { code: 'pic', description: 'Picadilly' },
          { code: 'ham', description: 'Hampstead2' },
          { code: 'pic', description: 'Picadilly2' },
          { code: 'wtl', description: 'Waterloo2' },
          { code: 'pic', description: 'Picadilly' },
          { code: 'ham', description: 'Hampstead2' },
          { code: 'pic', description: 'Picadilly2' },
          { code: 'wtl', description: 'Waterloo' },
        ],
      })

      deliusClient.getAllProbationAreas.mockResolvedValue({ content: [{ code: 'Lon', description: 'London' }] })
      activeLduClient.allActiveLdusInArea.mockResolvedValue([{ code: 'ham' }, { code: 'pic' }])

      const result = await lduService.getProbationArea('Lon')

      expect(result).toEqual({
        code: 'Lon',
        description: 'London',
        ldus: [
          { code: 'ham', description: 'Hampstead', active: true },
          { code: 'pic', description: 'Picadilly', active: true },
          { code: 'wtl', description: 'Waterloo', active: false },
        ],
      })
    })

    it('Should NOT return duplicate ldus', async () => {
      deliusClient.getAllLdusForProbationArea.mockResolvedValue({
        content: [
          { code: 'ham', description: 'Hampstead' },
          { code: 'wtl', description: 'Waterloo' },
          { code: 'pic', description: 'Picadilly' },
          { code: 'ham', description: 'Hampstead2' },
          { code: 'pic', description: 'Picadilly2' },
          { code: 'wtl', description: 'Waterloo2' },
          { code: 'ham', description: 'Hampstead' },
          { code: 'wtl', description: 'Waterloo' },
          { code: 'pic', description: 'Picadilly' },
          { code: 'ham', description: 'Hampstead2' },
          { code: 'pic', description: 'Picadilly2' },
          { code: 'wtl', description: 'Waterloo2' },
        ],
      })

      deliusClient.getAllProbationAreas.mockResolvedValue({ content: [{ code: 'Lon', description: 'London' }] })
      activeLduClient.allActiveLdusInArea.mockResolvedValue([{ code: 'ham' }, { code: 'pic' }])

      const result = await lduService.getProbationArea('Lon')

      expect(result).not.toEqual({
        code: 'Lon',
        description: 'London',
        ldus: [
          { code: 'ham', description: 'Hampstead' },
          { code: 'wtl', description: 'Waterloo' },
          { code: 'pic', description: 'Picadilly' },
          { code: 'ham', description: 'Hampstead2', active: true },
          { code: 'pic', description: 'Picadilly2', active: true },
          { code: 'wtl', description: 'Waterloo2', active: false },
        ],
      })
    })
  })

  describe('updateActiveLdus', () => {
    it('Should call the activeLduClient to persist the new LDUs', async () => {
      await lduService.updateActiveLdus(probationAreaCode, activeLdus)

      expect(activeLduClient.updateActiveLdu).toHaveBeenCalledWith(probationAreaCode, activeLdus)
    })
  })
})
