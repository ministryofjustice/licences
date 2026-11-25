const createNomisPushService = require('../../server/services/nomisPushService')
const { createHdcServiceStub } = require('../mockServices')

describe('nomisPushService', () => {
  let service
  let nomisClientBuilder
  let nomisClientMock
  let signInService
  let hdcService

  const bookingId = '1'
  const username = 'user'
  const licenceId = 1
  const offenderNo = 'A1234AA'

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
    hdcService = createHdcServiceStub()
    service = createNomisPushService(nomisClientBuilder, signInService, hdcService)
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
          data: { type: 'release', status: 'No', reason: ['addressUnsuitable'] },
          approvalStatus: { approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' },
        },
        {
          example: 'Release refused - insufficientTime',
          data: { type: 'release', status: 'No', reason: ['insufficientTime'] },
          approvalStatus: { approvalStatus: 'REJECTED', refusedReason: 'LIMITS' },
        },
        {
          example: 'Release refused - outOfTime',
          data: { type: 'release', status: 'No', reason: ['outOfTime'] },
          approvalStatus: { approvalStatus: 'REJECTED', refusedReason: 'UNDER_14DAYS' },
        },
        {
          example: 'Release refused - noAvailableAddress',
          data: { type: 'release', status: 'No', reason: ['noAvailableAddress'] },
          approvalStatus: { approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' },
        },
        {
          example: 'Opted out',
          data: { type: 'optOut', status: 'Yes' },
          approvalStatus: { approvalStatus: 'OPT_OUT', refusedReason: 'INM_REQUEST' },
        },
        {
          example: 'Excluded - sexOffenderRegister',
          data: { type: 'excluded', status: 'Yes', reason: ['sexOffenderRegister'] },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'SEX_OFFENCE' },
        },
        {
          example: 'Excluded - convictedSexOffences',
          data: { type: 'excluded', status: 'Yes', reason: ['convictedSexOffences'] },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'EXT_SENT' },
        },
        {
          example: 'Excluded - rotlFail',
          data: { type: 'excluded', status: 'Yes', reason: ['rotlFail'] },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'FAIL_RTN' },
        },
        {
          example: 'Excluded - communityCurfew',
          data: { type: 'excluded', status: 'Yes', reason: ['communityCurfew'] },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'CURFEW' },
        },
        {
          example: 'Excluded - servingRecall',
          data: { type: 'excluded', status: 'Yes', reason: ['servingRecall'] },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'LRCOMP' },
        },
        {
          example: 'Excluded - deportation',
          data: { type: 'excluded', status: 'Yes', reason: ['deportation'] },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'FNP' },
        },
        {
          example: 'Excluded - cja2003_19ZA',
          data: { type: 'excluded', status: 'Yes', reason: ['cja2003_19ZA'] },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'CJA2003_19ZA' },
        },
        {
          example: 'Excluded - curfewConditionsRecall',
          data: { type: 'excluded', status: 'Yes', reason: ['curfewConditionsRecall'] },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'RECALL_2YRS' },
        },
        {
          example: 'Excluded - twoThirdsRelease',
          data: { type: 'excluded', status: 'Yes', reason: ['twoThirdsRelease'] },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: '2_THIRD_REL' },
        },
        {
          example: 'Excluded - notice_244zb',
          data: { type: 'excluded', status: 'Yes', reason: ['notice_244zb'] },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: '244ZB_NOTICE' },
        },
        {
          example: 'Excluded - schedule_20B',
          data: { type: 'excluded', status: 'Yes', reason: ['schedule_20B'] },
          approvalStatus: { approvalStatus: 'INELIGIBLE', refusedReason: 'SCHEDULE_20B' },
        },
        {
          example: 'Unsuitable - sexOffender',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: ['sexOffender'] },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'UNSUIT_SEX' },
        },
        {
          example: 'Unsuitable - deportationLiable',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: ['deportationLiable'] },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'DEPORT' },
        },
        {
          example: 'Unsuitable - immigrationStatusUnclear',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: ['immigrationStatusUnclear'] },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'DEPORT' },
        },
        {
          example: 'Unsuitable - recalled',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: ['recalled'] },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'CUR' },
        },
        {
          example: 'Unsuitable - sentenceCategory',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: ['sentenceCategory'] },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'UNSUIT_OFF' },
        },
        {
          example: 'Unsuitable - historyOfTerrorism',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: ['historyOfTerrorism'] },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'HIST_TERROR' },
        },
        {
          example: 'Unsuitable - categoryA',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: ['categoryA'] },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'CATEGORY_A' },
        },
        {
          example: 'Unsuitable - riskOfHarm',
          data: { type: 'exceptionalCircumstances', status: 'No', reason: ['riskOfHarm'] },
          approvalStatus: { approvalStatus: 'PRES UNSUIT', refusedReason: 'ROSH_MAPPA' },
        },
        {
          example: 'Postponed - investigation',
          data: { type: 'postpone', status: 'Yes', reason: ['investigation'] },
          approvalStatus: { approvalStatus: 'PP INVEST', refusedReason: 'OUTSTANDING' },
        },
        {
          example: 'Postponed - outstandingRisk',
          data: { type: 'postpone', status: 'Yes', reason: ['outstandingRisk'] },
          approvalStatus: { approvalStatus: 'PP OUT RISK', refusedReason: 'OUTSTANDING' },
        },
        {
          example: 'Postponed - awaitingInformation',
          data: { type: 'postpone', status: 'Yes', reason: ['awaitingInformation'] },
          approvalStatus: { approvalStatus: 'PP AWAITING', refusedReason: 'OUTSTANDING' },
        },
        {
          example: 'Postponed - committedOffenceWhileInPrison',
          data: { type: 'postpone', status: 'Yes', reason: ['committedOffenceWhileInPrison'] },
          approvalStatus: { approvalStatus: 'PP PROC OUT', refusedReason: 'OUTSTANDING' },
        },
        {
          example: 'Postponed - remandedInCustodyOnOtherMatters',
          data: { type: 'postpone', status: 'Yes', reason: ['remandedInCustodyOnOtherMatters'] },
          approvalStatus: { approvalStatus: 'PP REMANDED', refusedReason: 'OUTSTANDING' },
        },
        {
          example: 'Postponed - confiscationOrderOutstanding',
          data: { type: 'postpone', status: 'Yes', reason: ['confiscationOrderOutstanding'] },
          approvalStatus: { approvalStatus: 'PP CONFISC', refusedReason: 'OUTSTANDING' },
        },
        {
          example: 'Postponed - segregatedForReasonsOtherThanProtection',
          data: { type: 'postpone', status: 'Yes', reason: ['segregatedForReasonsOtherThanProtection'] },
          approvalStatus: { approvalStatus: 'PP SEG', refusedReason: 'OUTSTANDING' },
        },
        {
          example: 'Postponed - sentenceReviewedUnderULSScheme',
          data: { type: 'postpone', status: 'Yes', reason: ['sentenceReviewedUnderULSScheme'] },
          approvalStatus: { approvalStatus: 'PP ULS', refusedReason: 'OUTSTANDING' },
        },
        {
          example: 'Refused - addressUnsuitable',
          data: { type: 'refusal', status: 'Yes', reason: ['addressUnsuitable'] },
          approvalStatus: { approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' },
        },
        {
          example: 'Refused - insufficientTime',
          data: { type: 'refusal', status: 'Yes', reason: ['insufficientTime'] },
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
        data: { type: undefined, status: 'Yes', reason: ['something'] },
        username,
      })
      expect(signInService.getClientCredentialsTokens).not.toHaveBeenCalled()
      expect(nomisClientMock.putApprovalStatus).not.toHaveBeenCalled()
    })

    test('should not call nomisClient.putApprovalStatus if no status', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: undefined, reason: ['something'] },
        username,
      })
      expect(signInService.getClientCredentialsTokens).not.toHaveBeenCalled()
      expect(nomisClientMock.putApprovalStatus).not.toHaveBeenCalled()
    })

    test('should not call nomisClient.putApprovalStatus if no matching update', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: 'No', reason: ['unmatched-reason'] },
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

    test('should not call hdcService.postCvlEvent if no matching event type', async () => {
      await service.pushStatus({
        bookingId,
        data: { type: 'release', status: 'No', reason: ['addressUnsuitable'] },
        username,
      })
      expect(hdcService.postCvlEvent).not.toHaveBeenCalled()
    })

    const specs = [
      {
        example: 'OptOut',
        data: { type: 'optOut', status: 'Yes', cvlEventReason: `${username} opted out of HDC after COM added an approved premises` },
        cvlEvent: { eventType: 'OPT_OUT', reason: `user opted out of HDC after COM added an approved premises` }
      },
      {
        example: 'Postpone - investigation',
        data: { type: 'postpone', status: 'Yes', reason: ['investigation' ]},
        cvlEvent: { eventType: 'POSTPONE', reason: 'investigation' }
      },
      {
        example: 'Postpone - outstandingRisk',
        data: { type: 'postpone', status: 'Yes', reason: ['outstandingRisk']},
        cvlEvent: { eventType: 'POSTPONE', reason: 'outstandingRisk' }
      },
      {
        example: 'Postpone - awaitingInformation',
        data: { type: 'postpone', status: 'Yes', reason: ['awaitingInformation'] },
        cvlEvent: { eventType: 'POSTPONE', reason: 'awaitingInformation' }
      },
      {
        example: 'Postpone - committedOffenceWhileInPrison',
        data: { type: 'postpone', status: 'Yes', reason: ['committedOffenceWhileInPrison'] },
        cvlEvent: { eventType: 'POSTPONE', reason: 'committedOffenceWhileInPrison' }
      },
      {
        example: 'Postpone - remandedInCustodyOnOtherMatters',
        data: { type: 'postpone', status: 'Yes', reason: ['remandedInCustodyOnOtherMatters'] },
        cvlEvent: { eventType: 'POSTPONE', reason: 'remandedInCustodyOnOtherMatters' }
      },
      {
        example: 'Postpone - confiscationOrderOutstanding',
        data: { type: 'postpone', status: 'Yes', reason: ['confiscationOrderOutstanding']},
        cvlEvent: { eventType: 'POSTPONE', reason: 'confiscationOrderOutstanding' }
      },
      {
        example: 'Postpone - segregatedForReasonsOtherThanProtection',
        data: { type: 'postpone', status: 'Yes', reason: ['segregatedForReasonsOtherThanProtection'] },
        cvlEvent: { eventType: 'POSTPONE', reason: 'segregatedForReasonsOtherThanProtection' }
      },
      {
        example: 'Postpone - sentenceReviewedUnderULSScheme',
        data: { type: 'postpone', status: 'Yes', reason: ['sentenceReviewedUnderULSScheme'] },
        cvlEvent: { eventType: 'POSTPONE', reason: 'sentenceReviewedUnderULSScheme' }
      },
      {
        example: 'Refusal - addressUnsuitable',
        data: { type: 'refusal', status: 'Yes', reason: ['addressUnsuitable'] },
        cvlEvent: { eventType: 'REFUSE', reason: 'addressUnsuitable' }
      },
      {
        example: 'Refusal - insufficientTime',
        data: { type: 'refusal', status: 'Yes', reason: ['insufficientTime'] },
        cvlEvent: { eventType: 'REFUSE', reason: 'insufficientTime' }
      },
      {
        example: 'Excluded - sexOffenderRegister',
        data: { type: 'excluded', status: 'Yes', reason: ['sexOffenderRegister'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'sexOffenderRegister' }
      },
      {
        example: 'Excluded - convictedSexOffences',
        data: { type: 'excluded', status: 'Yes', reason: ['convictedSexOffences'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'convictedSexOffences' }
      },
      {
        example: 'Excluded - rotlFail',
        data: { type: 'excluded', status: 'Yes', reason: ['rotlFail'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'rotlFail' }
      },
      {
        example: 'Excluded - communityCurfew',
        data: { type: 'excluded', status: 'Yes', reason: ['communityCurfew'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'communityCurfew' }
      },
      {
        example: 'Excluded - servingRecall',
        data: { type: 'excluded', status: 'Yes', reason: ['servingRecall'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'servingRecall' }
      },
      {
        example: 'Excluded - deportation',
        data: { type: 'excluded', status: 'Yes', reason: ['deportation'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'deportation' }
      },
      {
        example: 'Excluded - cja2003_19ZA',
        data: { type: 'excluded', status: 'Yes', reason: ['cja2003_19ZA'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'cja2003_19ZA' }
      },
      {
        example: 'Excluded - curfewConditionsRecall',
        data: { type: 'excluded', status: 'Yes', reason: ['curfewConditionsRecall'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'curfewConditionsRecall' }
      },
      {
        example: 'Excluded - twoThirdsRelease',
        data: { type: 'excluded', status: 'Yes', reason: ['twoThirdsRelease'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'twoThirdsRelease' }
      },
      {
        example: 'Excluded - notice_244zb',
        data: { type: 'excluded', status: 'Yes', reason: ['notice_244zb'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'notice_244zb' }
      },
      {
        example: 'Excluded - schedule_20B',
        data: { type: 'excluded', status: 'Yes', reason: ['schedule_20B'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'schedule_20B' }
      },
      {
        example: 'Exceptional Circumstances - sexOffender',
        data: { type: 'exceptionalCircumstances', status: 'No', reason: ['sexOffender'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'sexOffender' }
      },
      {
        example: 'Exceptional Circumstances - deportationLiable',
        data: { type: 'exceptionalCircumstances', status: 'No', reason: ['deportationLiable'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'deportationLiable' }
      },
      {
        example: 'Exceptional Circumstances - immigrationStatusUnclear',
        data: { type: 'exceptionalCircumstances', status: 'No', reason: ['immigrationStatusUnclear'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'immigrationStatusUnclear' }
      },
      {
        example: 'Exceptional Circumstances - recalled',
        data: { type: 'exceptionalCircumstances', status: 'No', reason: ['recalled'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'recalled' }
      },
      {
        example: 'Exceptional Circumstances - sentenceCategory',
        data: { type: 'exceptionalCircumstances', status: 'No', reason: ['sentenceCategory'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'sentenceCategory' }
      },
      {
        example: 'Exceptional Circumstances - historyOfTerrorism',
        data: { type: 'exceptionalCircumstances', status: 'No', reason: ['historyOfTerrorism'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'historyOfTerrorism' }
      },
      {
        example: 'Exceptional Circumstances - categoryA',
        data: { type: 'exceptionalCircumstances', status: 'No', reason: ['categoryA'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'categoryA' }
      },
      {
        example: 'Exceptional Circumstances - riskOfHarm',
        data: { type: 'exceptionalCircumstances', status: 'No', reason: ['riskOfHarm'] },
        cvlEvent: { eventType: 'INELIGIBLE', reason: 'riskOfHarm' }
      },
    ]

    specs.forEach((spec) => {
      test(`should call hdcService.postCvlEvent for ${spec.example} with the correct values`, async () => {
        await service.pushStatus({ bookingId, data: spec.data, username, licenceId, offenderNo })
        expect(nomisClientBuilder).toHaveBeenCalled()
        expect(nomisClientBuilder).toHaveBeenCalledWith('valid-token')
        expect(signInService.getClientCredentialsTokens).toHaveBeenCalled()
        expect(hdcService.postCvlEvent).toHaveBeenCalled()
        expect(hdcService.postCvlEvent).toHaveBeenCalledWith({
          eventType: spec.cvlEvent.eventType,
          bookingId: parseInt(bookingId, 10),
          licenceId,
          nomsNumber: offenderNo,
          triggeredBy: username,
          reason: spec.cvlEvent.reason,
        })
      })
    })

    test('should throw custom error if API gives 409', async () => {
      nomisClientMock.putApprovalStatus.mockRejectedValue({ status: 409 })
      await expect(
        service.pushStatus({ bookingId, data: { type: 'release', status: 'Yes' }, username })
      ).rejects.toThrow('Nomis Push Conflict')
    })
  })

  describe('pushChecksPassed', () => {
    test('should call nomisClient.putChecksPassed and postCvlEvent if passed is true', async () => {
      await service.pushChecksPassed({ bookingId, passed: true, username, licenceId, offenderNo })
      expect(signInService.getClientCredentialsTokens).toHaveBeenCalled()
      expect(nomisClientBuilder).toHaveBeenCalledWith('valid-token')
      expect(nomisClientMock.putChecksPassed).toHaveBeenCalled()
      expect(nomisClientMock.putChecksPassed).toHaveBeenCalledWith({ bookingId: '1', passed: true })
      expect(hdcService.postCvlEvent).toHaveBeenCalled()
      expect(hdcService.postCvlEvent).toHaveBeenCalledWith({
        eventType: 'ELIGIBLE',
        bookingId: parseInt(bookingId, 10),
        licenceId,
        nomsNumber: offenderNo,
        triggeredBy: username,
        reason: `${username} passed eligibility checks for HDC`
      })
    })

     test('should not call postCvlEvent if passed is false', async () => {
      await service.pushChecksPassed({ bookingId, passed: false, username, licenceId, offenderNo })
      expect(signInService.getClientCredentialsTokens).toHaveBeenCalled()
      expect(nomisClientBuilder).toHaveBeenCalledWith('valid-token')
      expect(nomisClientMock.putChecksPassed).toHaveBeenCalled()
      expect(nomisClientMock.putChecksPassed).toHaveBeenCalledWith({ bookingId: '1', passed: false })
      expect(hdcService.postCvlEvent).not.toHaveBeenCalled()
    })

    test('should throw custom error if API gives 409', async () => {
      nomisClientMock.putChecksPassed.mockRejectedValue({ status: 409 })
      await expect(service.pushChecksPassed({ bookingId, passed: true, username, licenceId, offenderNo })).rejects.toThrow(
        'Nomis Push Conflict'
      )
    })
  })

  describe('resetHDC', () => {
    it('should call nomisClient', async () => {
      await service.resetHDC(bookingId)
      expect(nomisClientMock.resetHDC).toHaveBeenCalledWith('1')
    })

    test('should throw error if API gives 409', async () => {
      nomisClientMock.resetHDC.mockRejectedValue({ status: 409 })
      await expect(service.resetHDC(bookingId, username)).rejects.toThrow('Nomis Push Conflict')
    })
  })
})
