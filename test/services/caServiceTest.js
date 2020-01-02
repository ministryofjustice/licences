const createCaService = require('../../server/services/caService')

let roService
let caService
const lduActiveClient = { isLduPresent: () => {} }
const responsibleOfficer = {
  isAllocated: true,
  lduCode: 'ldu-123',
}
roService = { findResponsibleOfficer: sinon.stub().resolves(responsibleOfficer) }

describe('caService', () => {
  describe('Allow CA to proceed to RO', async () => {
    const config = { continueCaToRoFeatureFlag: false }
    caService = createCaService(roService, lduActiveClient, config)

    describe('getReasonForNotContinuing', async () => {
      it('Should return []', async () => {
        lduActiveClient.isLduPresent = sinon.stub().resolves(true)
        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).to.eql([])
      })
    })
  })

  describe('Prevent CA from proceeding to RO', async () => {
    beforeEach(() => {
      const config = { continueCaToRoFeatureFlag: true }
      caService = createCaService(roService, lduActiveClient, config)
    })

    describe('getReasonForNotContinuing', async () => {
      it('should return [] because RO is allocated, Ldu is active', async () => {
        lduActiveClient.isLduPresent = sinon.stub().resolves(true)

        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).to.eql([])
      })

      it('should return LDU_INACTIVE', async () => {
        lduActiveClient.isLduPresent = sinon.stub().resolves(false)
        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).to.eql(['LDU_INACTIVE'])
      })

      it('should return COM_NOT_ALLOCATED', async () => {
        lduActiveClient.isLduPresent = sinon.stub().resolves(true)
        responsibleOfficer.isAllocated = false

        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).to.eql(['COM_NOT_ALLOCATED'])
      })

      it('should return LDU_INACTIVE and COM_NOT_ALLOCATED', async () => {
        lduActiveClient.isLduPresent = sinon.stub().resolves(false)
        responsibleOfficer.isAllocated = false
        roService = { findResponsibleOfficer: sinon.stub().resolves(responsibleOfficer) }

        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).to.eql(['LDU_INACTIVE', 'COM_NOT_ALLOCATED'])
      })
    })
  })
  describe('Responsible officer not assigned or Ldu not determined, roService returns error', () => {
    const error = {
      code: 'NO_OFFENDER_NUMBER',
      message: 'Offender number not entered in delius',
    }

    beforeEach(() => {
      roService = {
        findResponsibleOfficer: sinon.stub().resolves(error),
      }

      const config = { continueCaToRoFeatureFlag: true }

      caService = createCaService(roService, lduActiveClient, config)
    })
    it('should return NO_OFFENDER_NUMBER because no offender number on nomis for bookingId', async () => {
      const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
      expect(result).to.eql(['NO_OFFENDER_NUMBER'])
    })

    it('should return NO_COM_ASSIGNED', async () => {
      error.code = 'NO_COM_ASSIGNED'
      const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
      expect(result).to.eql(['NO_COM_ASSIGNED'])
    })
  })
})
