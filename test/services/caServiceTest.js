const createCaService = require('../../server/services/caService')

describe('caService', () => {
  let roService
  let caService
  const lduActiveClient = { isLduPresent: () => {} }

  describe('Responsible Officer is allocated and Ldu determined', () => {
    const responsibleOfficer = {
      isAllocated: true,
      lduCode: 'ldu-123',
    }

    beforeEach(() => {
      roService = {
        findResponsibleOfficer: sinon.stub().resolves(responsibleOfficer),
      }
      caService = createCaService(roService, lduActiveClient)
    })

    describe('getReasonForNotContinuing ', () => {
      it('should return null because Ro is COM and ldu is active', async () => {
        lduActiveClient.isLduPresent = sinon.stub().resolves(true)

        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).to.eql(null)
      })

      it('should return LDU_INACTIVE because ldu is not active', async () => {
        lduActiveClient.isLduPresent = sinon.stub().resolves(false)

        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).to.eql('LDU_INACTIVE')
      })

      it('should return COM_NOT_ALLOCATED because COM has not been assigned', async () => {
        lduActiveClient.isLduPresent = sinon.stub().resolves(true)
        responsibleOfficer.isAllocated = false

        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).to.eql('COM_NOT_ALLOCATED')
        responsibleOfficer.isAllocated = true
      })
    })
  })

  describe('Responsible officer not assigned or Ldu not determined', () => {
    const error = {
      code: 'NO_OFFENDER_NUMBER',
      message: 'Offender number not entered in delius',
    }

    beforeEach(() => {
      roService = {
        findResponsibleOfficer: sinon.stub().resolves(error),
      }
      caService = createCaService(roService, lduActiveClient)
    })
    describe('getReasonForNotContinuing', () => {
      it('should return NO_OFFENDER_NUMBER because no offender number on nomis for bookingId', async () => {
        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).to.eql('NO_OFFENDER_NUMBER')
      })

      it('should return NO_COM_ASSIGNED', async () => {
        error.code = 'NO_COM_ASSIGNED'
        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).to.eql('NO_COM_ASSIGNED')
      })
    })
  })
})
