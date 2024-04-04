module.exports = {
  statusValues: {
    release: {
      Yes: { approvalStatus: 'APPROVED' },
    },
    optOut: {
      Yes: { approvalStatus: 'OPT_OUT', refusedReason: 'INM_REQUEST' },
    },
  },

  statusReasonValues: {
    release: {
      No: {
        addressUnsuitable: { approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' },
        noAvailableAddress: { approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' },
        insufficientTime: { approvalStatus: 'REJECTED', refusedReason: 'LIMITS' },
        outOfTime: { approvalStatus: 'REJECTED', refusedReason: 'UNDER_14DAYS' },
      },
    },
    refuseReason: {
      No: {
        addressUnsuitable: { approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' },
        insufficientTime: { approvalStatus: 'REJECTED', refusedReason: 'LIMITS' },
      },
    },
    postpone: {
      Yes: {
        investigation: { approvalStatus: 'PP INVEST', refusedReason: 'OUTSTANDING' },
        outstandingRisk: { approvalStatus: 'PP OUT RISK', refusedReason: 'OUTSTANDING' },
        awaitingInformation: { approvalStatus: 'PP AWAITING', refusedReason: 'OUTSTANDING' },
        committedOffenceWhileInPrison: { approvalStatus: 'PP PROC OUT', refusedReason: 'OUTSTANDING' },
        remandedInCustodyOnOtherMatters: { approvalStatus: 'PP REMANDED', refusedReason: 'OUTSTANDING' },
        confiscationOrderOutstanding: { approvalStatus: 'PP CONFISC', refusedReason: 'OUTSTANDING' },
        segregatedForReasonsOtherThanProtection: { approvalStatus: 'PP SEG', refusedReason: 'OUTSTANDING' },
        sentenceReviewedUnderULSScheme: { approvalStatus: 'PP ULS', refusedReason: 'OUTSTANDING' },
      },
    },
    refusal: {
      Yes: {
        addressUnsuitable: { approvalStatus: 'REJECTED', refusedReason: 'ADDRESS' },
        insufficientTime: { approvalStatus: 'REJECTED', refusedReason: 'LIMITS' },
      },
    },
    excluded: {
      Yes: {
        sexOffenderRegister: { approvalStatus: 'INELIGIBLE', refusedReason: 'SEX_OFFENCE' },
        convictedSexOffences: { approvalStatus: 'INELIGIBLE', refusedReason: 'EXT_SENT' },
        rotlFail: { approvalStatus: 'INELIGIBLE', refusedReason: 'FAIL_RTN' },
        communityCurfew: { approvalStatus: 'INELIGIBLE', refusedReason: 'CURFEW' },
        returnedAtRisk: { approvalStatus: 'INELIGIBLE', refusedReason: 'S116' },
        serving4YearsOrMore: { approvalStatus: 'INELIGIBLE', refusedReason: 'CJA03_4YRS' },
        hdcCurfewConditions: { approvalStatus: 'INELIGIBLE', refusedReason: 'HDC_RECALL' },
        servingRecall: { approvalStatus: 'INELIGIBLE', refusedReason: 'LRCOMP' },
        deportation: { approvalStatus: 'INELIGIBLE', refusedReason: 'FNP' },
        cja2003_19ZA: { approvalStatus: 'INELIGIBLE', refusedReason: 'CJA2003_19ZA' },
      },
    },
    exceptionalCircumstances: {
      No: {
        sexOffender: { approvalStatus: 'PRES UNSUIT', refusedReason: 'UNSUIT_SEX' },
        deportationLiable: { approvalStatus: 'PRES UNSUIT', refusedReason: 'DEPORT' },
        immigrationStatusUnclear: { approvalStatus: 'PRES UNSUIT', refusedReason: 'DEPORT' },
        recalled: { approvalStatus: 'PRES UNSUIT', refusedReason: 'CUR' },
        sentenceCategory: { approvalStatus: 'PRES UNSUIT', refusedReason: 'UNSUIT_OFF' },
        historyOfTerrorism: { approvalStatus: 'PRES UNSUIT', refusedReason: 'HIST_TERROR' },
        categoryA: { approvalStatus: 'PRES UNSUIT', refusedReason: 'CATEGORY_A' },
        serving4YearsOrMoreOverseas: { approvalStatus: 'PRES UNSUIT', refusedReason: 'OVERALL_4YRS' },
        riskOfHarm: { approvalStatus: 'PRES UNSUIT', refusedReason: 'ROSH_MAPPA' },
      },
    },
  },
}
