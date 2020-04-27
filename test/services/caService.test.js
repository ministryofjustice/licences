const createCaService = require('../../server/services/caService')
const { createRoServiceStub } = require('../mockServices')

let roService
let caService
/** @type {any} */
let lduActiveClient

const responsibleOfficer = {
  isAllocated: true,
  lduCode: 'ldu-123',
}

describe('caService', () => {
  beforeEach(() => {
    roService = createRoServiceStub()
    roService.findResponsibleOfficer.mockResolvedValue(responsibleOfficer)
    lduActiveClient = { isLduPresent: jest.fn() }

    caService = createCaService(roService, lduActiveClient)
  })

  describe('Allow CA to proceed to RO', () => {
    describe('getReasonForNotContinuing', () => {
      it('Should return null', async () => {
        lduActiveClient.isLduPresent.mockResolvedValue(true)
        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).toEqual(null)
      })
    })
  })

  describe('Prevent CA from proceeding to RO', () => {
    describe('getReasonForNotContinuing', () => {
      it('should return [] because RO is allocated, Ldu is active', async () => {
        lduActiveClient.isLduPresent.mockResolvedValue(true)

        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).toEqual(null)
      })

      it('should return LDU_INACTIVE', async () => {
        lduActiveClient.isLduPresent.mockResolvedValue(false)
        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).toEqual('LDU_INACTIVE')
      })

      it('should return COM_NOT_ALLOCATED', async () => {
        lduActiveClient.isLduPresent.mockResolvedValue(true)
        responsibleOfficer.isAllocated = false

        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).toEqual('COM_NOT_ALLOCATED')
      })

      it('should only return LDU_INACTIVE when LDU_INACTIVE and COM_NOT_ALLOCATED', async () => {
        lduActiveClient.isLduPresent.mockResolvedValue(false)
        responsibleOfficer.isAllocated = false
        roService = { findResponsibleOfficer: jest.fn().mockResolvedValue(responsibleOfficer) }

        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).toEqual('LDU_INACTIVE')
      })
    })
  })
  describe('Responsible officer not assigned or Ldu not determined, roService returns error', () => {
    const error = {
      code: 'NO_OFFENDER_NUMBER',
      message: 'Offender number not entered in delius',
    }

    beforeEach(() => {
      roService.findResponsibleOfficer.mockResolvedValue(error)
    })
    it('should return NO_OFFENDER_NUMBER because no offender number on nomis for bookingId', async () => {
      const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
      expect(result).toEqual('NO_OFFENDER_NUMBER')
    })

    it('should return NO_COM_ASSIGNED', async () => {
      error.code = 'NO_COM_ASSIGNED'
      const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
      expect(result).toEqual('COM_NOT_ALLOCATED')
    })
  })
})
