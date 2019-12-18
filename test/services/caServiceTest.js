const createCaService = require('../../server/services/caService')

describe('caService', () => {
  let roService
  let caService
  const lduActiveClient = { isLduPresent: () => {} }

  describe('Creating the caService', () => {
    describe('Ro is allocated, ldu is active and continueCaToRoFeatureFlag is yes', async () => {
      const responsibleOfficer = {
        isAllocated: true,
        lduCode: 'ldu-123',
      }

      roService = { findResponsibleOfficer: sinon.stub().resolves(responsibleOfficer) }
      const config = { continueCaToRoFeatureFlag: 'yes' }
      caService = createCaService(roService, lduActiveClient, config)

      it('Should return null', async () => {
        lduActiveClient.isLduPresent = sinon.stub().resolves(true)
        const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
        expect(result).to.eql(null)
      })
    })

    describe('Responsible Officer is allocated and Ldu is determined but continueCaToRoFeatureFlag is no', () => {
      const responsibleOfficer = {
        isAllocated: true,
        lduCode: 'ldu-123',
      }

      beforeEach(() => {
        roService = {
          findResponsibleOfficer: sinon.stub().resolves(responsibleOfficer),
        }

        const config = { continueCaToRoFeatureFlag: 'no' }

        caService = createCaService(roService, lduActiveClient, config)
      })

      describe('getReasonForNotContinuing ', () => {
        it('should return null because Ro is COM and ldu is active but continueCaToRoFeatureFlag is no', async () => {
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
        })

        it('should return LDU_INACTIVE because continueCaToRoFeatureFlag is no', async () => {
          lduActiveClient.isLduPresent = sinon.stub().resolves(false)

          const result = await caService.getReasonForNotContinuing('bookingId-1', 'token-1')
          expect(result).to.eql('LDU_INACTIVE')
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

        const config = { continueCaToRoFeatureFlag: 'no' }

        caService = createCaService(roService, lduActiveClient, config)
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
})
