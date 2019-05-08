const createNomisPushService = require('../../server/services/nomisPushService')

describe('nomisPushService', () => {
  let service
  let nomisClientBuilder
  let nomisClientMock
  let signInService

  const bookingId = '1'
  const username = 'user'

  beforeEach(() => {
    nomisClientMock = {
      putApprovalStatus: sinon.stub().resolves(),
      putChecksPassed: sinon.stub().resolves(),
    }
    nomisClientBuilder = sinon.stub().returns(nomisClientMock)
    signInService = {
      getClientCredentialsTokens: sinon.stub().returns({ token: 'valid-token' }),
    }
    service = createNomisPushService(nomisClientBuilder, signInService)
  })

  describe('pushStatus', () => {
    describe('required pushes', () => {
      const specs = [
        {
          example: 'Release approved',
          data: { type: 'release', status: 'Yes' },
          approvalStatus: { approvalStatus: 'APPROVED' },
        },
        {
          example: 'Release refused - addressUnsuitable',
          data: { type: 'release', status: 'No', reason: 'addressUnsuitable' },
          approvalStatus: { approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' },
        },
        {
          example: 'Release refused - insufficientTime',
          data: { type: 'release', status: 'No', reason: 'insufficientTime' },
          approvalStatus: { approvalStatus: 'REJECTED', refusedReason: 'LIMITS' },
        },
        {
          example: 'Release refused - outOfTime',
          data: { type: 'release', status: 'No', reason: 'outOfTime' },
          approvalStatus: { approvalStatus: 'REJECTED', refusedReason: 'UNDER_14DAYS' },
        },
        {
          example: 'Release refused - noAvailableAddress',
          data: { type: 'release', status: 'No', reason: 'noAvailableAddress' },
          approvalStatus: { approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' },
        },
        {
          example: 'Opted out',
          data: { type: 'optOut', status: 'Yes' },
          approvalStatus: { approvalStatus: 'OPT_OUT', refusedReason: 'INM_REQUEST' },
        },
        {
          example: 'Excluded - sexOffenderRegister',
          data: { type: 'excluded', status: 'Yes', reason: 'sexOffenderRegister' },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'SEX_OFFENCE' },
        },
        {
          example: 'Excluded - convictedSexOffences',
          data: { type: 'excluded', status: 'Yes', reason: 'convictedSexOffences' },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'EXT_SENT' },
        },
        {
          example: 'Excluded - rotlFail',
          data: { type: 'excluded', status: 'Yes', reason: 'rotlFail' },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'FAIL_RTN' },
        },
        {
          example: 'Excluded - communityCurfew',
          data: { type: 'excluded', status: 'Yes', reason: 'communityCurfew' },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'CURFEW' },
        },
        {
          example: 'Excluded - returnedAtRisk',
          data: { type: 'excluded', status: 'Yes', reason: 'returnedAtRisk' },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'S116' },
        },
        {
          example: 'Excluded - hdcCurfewConditions',
          data: { type: 'excluded', status: 'Yes', reason: 'hdcCurfewConditions' },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'HDC_RECALL' },
        },
        // PENDING - requires definition of refusal reason
        // {
        //   example: 'Excluded - servingRecall',
        //   data: { type: 'excluded', status: 'Yes', reason: 'servingRecall' },
        //   approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'TBD' },
        // },
        {
          example: 'Excluded - deportation',
          data: { type: 'excluded', status: 'Yes', reason: 'deportation' },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'FNP' },
        },
        {
          example: 'Unsuitable - sexOffender',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: 'sexOffender' },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'UNSUIT_SEX' },
        },
        {
          example: 'Unsuitable - deportationLiable',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: 'deportationLiable' },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'DEPORT' },
        },
        {
          example: 'Unsuitable - immigrationStatusUnclear',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: 'immigrationStatusUnclear' },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'DEPORT' },
        },
        {
          example: 'Unsuitable - recalled',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: 'recalled' },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'CUR' },
        },
        {
          example: 'Unsuitable - sentenceCategory',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: 'sentenceCategory' },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'UNSUIT_OFF' },
        },
        {
          example: 'Postponed - investigation',
          data: { type: 'postpone', status: 'Yes', reason: 'investigation' },
          approvalStatus: { approvalStatus: 'PP INVEST', refusedReason: 'OUTSTANDING' },
        },
        {
          example: 'Postponed - outstandingRisk',
          data: { type: 'postpone', status: 'Yes', reason: 'outstandingRisk' },
          approvalStatus: { approvalStatus: 'PP OUT RISK', refusedReason: 'OUTSTANDING' },
        },
        {
          example: 'Refused - addressUnsuitable',
          data: { type: 'refusal', status: 'Yes', reason: 'addressUnsuitable' },
          approvalStatus: { approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' },
        },
        {
          example: 'Refused - addressUnsuitable',
          data: { type: 'refusal', status: 'Yes', reason: 'insufficientTime' },
          approvalStatus: { approvalStatus: 'REJECTED', refusedReason: 'LIMITS' },
        },
      ]

      specs.forEach(spec => {
        it(`should call nomisClient.putApprovalStatus for ${spec.example} with the correct values`, async () => {
          await service.pushStatus({ bookingId, data: spec.data, username })
          expect(nomisClientBuilder).to.be.calledOnce()
          expect(nomisClientBuilder).to.be.calledWith('valid-token')
          expect(signInService.getClientCredentialsTokens).to.be.calledOnce()
          expect(nomisClientMock.putApprovalStatus).to.be.calledOnce()
          expect(nomisClientMock.putApprovalStatus).to.be.calledWith('1', spec.approvalStatus)
        })
      })
    })

    it('should not call nomisClient.putApprovalStatus if no type', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: undefined, status: 'Yes', reason: 'something' },
        username,
      })
      expect(signInService.getClientCredentialsTokens).not.to.be.calledOnce()
      expect(nomisClientMock.putApprovalStatus).not.to.be.calledOnce()
    })

    it('should not call nomisClient.putApprovalStatus if no status', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: undefined, reason: 'something' },
        username,
      })
      expect(signInService.getClientCredentialsTokens).not.to.be.calledOnce()
      expect(nomisClientMock.putApprovalStatus).not.to.be.calledOnce()
    })

    it('should not call nomisClient.putApprovalStatus if no matching update', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: 'No', reason: 'unmatched-reason' },
        username,
      })
      expect(signInService.getClientCredentialsTokens).not.to.be.calledOnce()
      expect(nomisClientMock.putApprovalStatus).not.to.be.calledOnce()
    })

    it('should not call nomisClient.putApprovalStatus if no matching update when array of reasons', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: 'No', reason: ['unmatched-reason'] },
        username,
      })
      expect(signInService.getClientCredentialsTokens).not.to.be.calledOnce()
      expect(nomisClientMock.putApprovalStatus).not.to.be.calledOnce()
    })

    it('should not call nomisClient.putApprovalStatus if no matching update when empty array of reasons', async () => {
      await service.pushStatus({ bookingId, data: { type: 'release', status: 'No', reason: [] }, username })
      expect(signInService.getClientCredentialsTokens).not.to.be.calledOnce()
      expect(nomisClientMock.putApprovalStatus).not.to.be.calledOnce()
    })

    it('should also accept reason in an array', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: 'No', reason: ['insufficientTime'] },
        username,
      })
      expect(signInService.getClientCredentialsTokens).to.be.calledOnce()
      expect(nomisClientBuilder).to.be.calledWith('valid-token')
      expect(nomisClientMock.putApprovalStatus).to.be.calledOnce()
      expect(nomisClientMock.putApprovalStatus).to.be.calledWith('1', {
        approvalStatus: 'REJECTED',
        refusedReason: 'LIMITS',
      })
    })

    it('should use the first reason when there are many', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: 'No', reason: ['insufficientTime', 'addressUnsuitable', 'unmatched-reason'] },
        username,
      })
      expect(signInService.getClientCredentialsTokens).to.be.calledOnce()
      expect(nomisClientBuilder).to.be.calledWith('valid-token')
      expect(nomisClientMock.putApprovalStatus).to.be.calledOnce()
      expect(nomisClientMock.putApprovalStatus).to.be.calledWith('1', {
        approvalStatus: 'REJECTED',
        refusedReason: 'LIMITS',
      })
    })

    it('should not call nomisClient.putApprovalStatus if no matching update when first reason unmatched', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: 'No', reason: ['unmatched-reason', 'insufficientTime', 'addressUnsuitable'] },
        username,
      })
      expect(signInService.getClientCredentialsTokens).not.to.be.calledOnce()
      expect(nomisClientMock.putApprovalStatus).not.to.be.calledOnce()
    })

    it('should throw custom error if API gives 409', async () => {
      nomisClientMock.putApprovalStatus.rejects({ status: 409 })
      await expect(
        service.pushStatus({ bookingId, data: { type: 'release', status: 'Yes' }, username })
      ).to.be.rejectedWith('Nomis Push Conflict')
    })
  })

  describe('pushChecksPassed', () => {
    it('should call nomisClient.putChecksPassed', async () => {
      await service.pushChecksPassed({ bookingId, passed: true, username })
      expect(signInService.getClientCredentialsTokens).to.be.calledOnce()
      expect(nomisClientBuilder).to.be.calledWith('valid-token')
      expect(nomisClientMock.putChecksPassed).to.be.calledOnce()
      expect(nomisClientMock.putChecksPassed).to.be.calledWith({ bookingId: '1', passed: true })
    })

    it('should throw custom error if API gives 409', async () => {
      nomisClientMock.putChecksPassed.rejects({ status: 409 })
      await expect(service.pushChecksPassed({ bookingId, passed: true, username })).to.be.rejectedWith(
        'Nomis Push Conflict'
      )
    })
  })
})
