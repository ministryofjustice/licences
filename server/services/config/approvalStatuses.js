module.exports = {
  statusValues: {
    release: {
      Yes: [{ approvalStatus: 'APPROVED' }],
    },
    optOut: {
      Yes: [{ approvalStatus: 'OPT_OUT', refusedReason: 'INM_REQUEST' }, { cvlEventType: 'OPT_OUT' }],
    },
  },

  statusReasonValues: {
    release: {
      No: {
        addressUnsuitable: [{ approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' }],
        noAvailableAddress: [{ approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' }],
        insufficientTime: [{ approvalStatus: 'REJECTED', refusedReason: 'LIMITS' }],
        outOfTime: [{ approvalStatus: 'REJECTED', refusedReason: 'UNDER_14DAYS' }],
      },
    },
    refuseReason: {
      No: {
        addressUnsuitable: [{ approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' }],
        insufficientTime: [{ approvalStatus: 'REJECTED', refusedReason: 'LIMITS' }],
      },
    },
    postpone: {
      Yes: {
        investigation: [{ approvalStatus: 'PP INVEST', refusedReason: 'OUTSTANDING' }, { cvlEventType: 'POSTPONE' }],
        outstandingRisk: [{ approvalStatus: 'PP OUT RISK', refusedReason: 'OUTSTANDING' }, { cvlEventType: 'POSTPONE' }],
        awaitingInformation: [{ approvalStatus: 'PP AWAITING', refusedReason: 'OUTSTANDING' }, { cvlEventType: 'POSTPONE' }],
        committedOffenceWhileInPrison: [{ approvalStatus: 'PP PROC OUT', refusedReason: 'OUTSTANDING' }, { cvlEventType: 'POSTPONE' }],
        remandedInCustodyOnOtherMatters: [{ approvalStatus: 'PP REMANDED', refusedReason: 'OUTSTANDING' }, { cvlEventType: 'POSTPONE' }],
        confiscationOrderOutstanding: [{ approvalStatus: 'PP CONFISC', refusedReason: 'OUTSTANDING' }, { cvlEventType: 'POSTPONE' }],
        segregatedForReasonsOtherThanProtection: [{ approvalStatus: 'PP SEG', refusedReason: 'OUTSTANDING' }, { cvlEventType: 'POSTPONE' }],
        sentenceReviewedUnderULSScheme: [{ approvalStatus: 'PP ULS', refusedReason: 'OUTSTANDING' }, { cvlEventType: 'POSTPONE' }],
      },
    },
    refusal: {
      Yes: {
        addressUnsuitable: [{ approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' }, { cvlEventType: 'REFUSE' }],
        insufficientTime: [{ approvalStatus: 'REJECTED', refusedReason: 'LIMITS' }, { cvlEventType: 'REFUSE' }],
      },
    },
    excluded: {
      Yes: {
        sexOffenderRegister: [{ approvalStatus: 'INELIGIBLE', refusedReason: 'SEX_OFFENCE' }, { cvlEventType: 'INELIGIBLE' }],
        convictedSexOffences: [{ approvalStatus: 'INELIGIBLE', refusedReason: 'EXT_SENT' }, { cvlEventType: 'INELIGIBLE' }],
        rotlFail: [{ approvalStatus: 'INELIGIBLE', refusedReason: 'FAIL_RTN' }, { cvlEventType: 'INELIGIBLE' }],
        communityCurfew: [{ approvalStatus: 'INELIGIBLE', refusedReason: 'CURFEW' }, { cvlEventType: 'INELIGIBLE' }],
        servingRecall: [{ approvalStatus: 'INELIGIBLE', refusedReason: 'LRCOMP' }, { cvlEventType: 'INELIGIBLE' }],
        deportation: [{ approvalStatus: 'INELIGIBLE', refusedReason: 'FNP' }, { cvlEventType: 'INELIGIBLE' }],
        cja2003_19ZA: [{ approvalStatus: 'INELIGIBLE', refusedReason: 'CJA2003_19ZA' }, { cvlEventType: 'INELIGIBLE' }],
        curfewConditionsRecall: [{ approvalStatus: 'INELIGIBLE', refusedReason: 'RECALL_2YRS' }, { cvlEventType: 'INELIGIBLE' }],
        twoThirdsRelease: [{ approvalStatus: 'INELIGIBLE', refusedReason: '2_THIRD_REL' }, { cvlEventType: 'INELIGIBLE' }],
        notice_244zb: [{ approvalStatus: 'INELIGIBLE', refusedReason: '244ZB_NOTICE' }, { cvlEventType: 'INELIGIBLE' }],
        schedule_20B: [{ approvalStatus: 'INELIGIBLE', refusedReason: 'SCHEDULE_20B' }, { cvlEventType: 'INELIGIBLE' }],
      },
    },
    exceptionalCircumstances: {
      No: {
        sexOffender: [{ approvalStatus: 'PRES UNSUIT', refusedReason: 'UNSUIT_SEX' }, { cvlEventType: 'INELIGIBLE' }],
        deportationLiable: [{ approvalStatus: 'PRES UNSUIT', refusedReason: 'DEPORT' }, { cvlEventType: 'INELIGIBLE' }],
        immigrationStatusUnclear: [{ approvalStatus: 'PRES UNSUIT', refusedReason: 'DEPORT' }, { cvlEventType: 'INELIGIBLE' }],
        recalled: [{ approvalStatus: 'PRES UNSUIT', refusedReason: 'CUR' }, { cvlEventType: 'INELIGIBLE' }],
        sentenceCategory: [{ approvalStatus: 'PRES UNSUIT', refusedReason: 'UNSUIT_OFF' }, { cvlEventType: 'INELIGIBLE' }],
        historyOfTerrorism: [{ approvalStatus: 'PRES UNSUIT', refusedReason: 'HIST_TERROR' }, { cvlEventType: 'INELIGIBLE' }],
        categoryA: [{ approvalStatus: 'PRES UNSUIT', refusedReason: 'CATEGORY_A' }, { cvlEventType: 'INELIGIBLE' }],
        riskOfHarm: [{ approvalStatus: 'PRES UNSUIT', refusedReason: 'ROSH_MAPPA' }, { cvlEventType: 'INELIGIBLE' }],
      },
    },
  },
}
