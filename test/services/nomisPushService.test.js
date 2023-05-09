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
      putApprovalStatus: jest.fn(),
      putChecksPassed: jest.fn(),
      resetHDC: jest.fn(),
    }
    nomisClientBuilder = jest.fn().mockReturnValue(nomisClientMock)
    signInService = {
      getClientCredentialsTokens: jest.fn().mockReturnValue('valid-token'),
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
        {
          example: 'Excluded - servingRecall',
          data: { type: 'excluded', status: 'Yes', reason: 'servingRecall' },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'LRCOMP' },
        },
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
          example: 'Unsuitable - historyOfTerrorism',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: 'historyOfTerrorism' },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'HIST_TERROR' },
        },
        {
          example: 'Unsuitable - categoryA',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: 'categoryA' },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'CATEGORY_A' },
        },
        {
          example: 'Unsuitable - serving4YearsOrMoreOverseas',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: 'serving4YearsOrMoreOverseas' },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'OVERALL_4YRS' },
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

      specs.forEach((spec) => {
        test(`should call nomisClient.putApprovalStatus for ${spec.example} with the correct values`, async () => {
          await service.pushStatus({ bookingId, data: spec.data, username })
          expect(nomisClientBuilder).toHaveBeenCalled()
          expect(nomisClientBuilder).toHaveBeenCalledWith('valid-token')
          expect(signInService.getClientCredentialsTokens).toHaveBeenCalled()
          expect(nomisClientMock.putApprovalStatus).toHaveBeenCalled()
          expect(nomisClientMock.putApprovalStatus).toHaveBeenCalledWith('1', spec.approvalStatus)
        })
      })
    })

    test('should not call nomisClient.putApprovalStatus if no type', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: undefined, status: 'Yes', reason: 'something' },
        username,
      })
      expect(signInService.getClientCredentialsTokens).not.toHaveBeenCalled()
      expect(nomisClientMock.putApprovalStatus).not.toHaveBeenCalled()
    })

    test('should not call nomisClient.putApprovalStatus if no status', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: undefined, reason: 'something' },
        username,
      })
      expect(signInService.getClientCredentialsTokens).not.toHaveBeenCalled()
      expect(nomisClientMock.putApprovalStatus).not.toHaveBeenCalled()
    })

    test('should not call nomisClient.putApprovalStatus if no matching update', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: 'No', reason: 'unmatched-reason' },
        username,
      })
      expect(signInService.getClientCredentialsTokens).not.toHaveBeenCalled()
      expect(nomisClientMock.putApprovalStatus).not.toHaveBeenCalled()
    })

    test('should not call nomisClient.putApprovalStatus if no matching update when array of reasons', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: 'No', reason: ['unmatched-reason'] },
        username,
      })
      expect(signInService.getClientCredentialsTokens).not.toHaveBeenCalled()
      expect(nomisClientMock.putApprovalStatus).not.toHaveBeenCalled()
    })

    test('should not call nomisClient.putApprovalStatus if no matching update when empty array of reasons', async () => {
      await service.pushStatus({ bookingId, data: { type: 'release', status: 'No', reason: [] }, username })
      expect(signInService.getClientCredentialsTokens).not.toHaveBeenCalled()
      expect(nomisClientMock.putApprovalStatus).not.toHaveBeenCalled()
    })

    test('should also accept reason in an array', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: 'No', reason: ['insufficientTime'] },
        username,
      })
      expect(signInService.getClientCredentialsTokens).toHaveBeenCalled()
      expect(nomisClientBuilder).toHaveBeenCalledWith('valid-token')
      expect(nomisClientMock.putApprovalStatus).toHaveBeenCalled()
      expect(nomisClientMock.putApprovalStatus).toHaveBeenCalledWith('1', {
        approvalStatus: 'REJECTED',
        refusedReason: 'LIMITS',
      })
    })

    test('should use the first reason when there are many', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: 'No', reason: ['insufficientTime', 'addressUnsuitable', 'unmatched-reason'] },
        username,
      })
      expect(signInService.getClientCredentialsTokens).toHaveBeenCalled()
      expect(nomisClientBuilder).toHaveBeenCalledWith('valid-token')
      expect(nomisClientMock.putApprovalStatus).toHaveBeenCalled()
      expect(nomisClientMock.putApprovalStatus).toHaveBeenCalledWith('1', {
        approvalStatus: 'REJECTED',
        refusedReason: 'LIMITS',
      })
    })

    test('should not call nomisClient.putApprovalStatus if no matching update when first reason unmatched', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: 'No', reason: ['unmatched-reason', 'insufficientTime', 'addressUnsuitable'] },
        username,
      })
      expect(signInService.getClientCredentialsTokens).not.toHaveBeenCalled()
      expect(nomisClientMock.putApprovalStatus).not.toHaveBeenCalled()
    })

    test('should throw custom error if API gives 409', async () => {
      nomisClientMock.putApprovalStatus.mockRejectedValue({ status: 409 })
      await expect(
        service.pushStatus({ bookingId, data: { type: 'release', status: 'Yes' }, username })
      ).rejects.toThrow('Nomis Push Conflict')
    })
  })

  describe('pushChecksPassed', () => {
    test('should call nomisClient.putChecksPassed', async () => {
      await service.pushChecksPassed({ bookingId, passed: true, username })
      expect(signInService.getClientCredentialsTokens).toHaveBeenCalled()
      expect(nomisClientBuilder).toHaveBeenCalledWith('valid-token')
      expect(nomisClientMock.putChecksPassed).toHaveBeenCalled()
      expect(nomisClientMock.putChecksPassed).toHaveBeenCalledWith({ bookingId: '1', passed: true })
    })

    test('should throw custom error if API gives 409', async () => {
      nomisClientMock.putChecksPassed.mockRejectedValue({ status: 409 })
      await expect(service.pushChecksPassed({ bookingId, passed: true, username })).rejects.toThrow(
        'Nomis Push Conflict'
      )
    })
  })

  describe('resetHDC', () => {
    it('should call nomisClient', async () => {
      await service.resetHDC(bookingId)
      expect(nomisClientMock.resetHDC).toBeCalledWith('1')
    })

    test('should throw error if API gives 409', async () => {
      nomisClientMock.resetHDC.mockRejectedValue({ status: 409 })
      await expect(service.resetHDC(bookingId, username)).rejects.toThrow('Nomis Push Conflict')
    })
  })
})
