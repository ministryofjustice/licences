export const cvlEventConfig = {
    optOut: {
        Yes: { eventType: 'OPT_OUT' },
    },
    postpone: {
        Yes: {
            investigation: { eventType: 'POSTPONE' },
            outstandingRisk: { eventType: 'POSTPONE' },
            awaitingInformation: { eventType: 'POSTPONE' },
            committedOffenceWhileInPrison: { eventType: 'POSTPONE' },
            remandedInCustodyOnOtherMatters: { eventType: 'POSTPONE' },
            confiscationOrderOutstanding: { eventType: 'POSTPONE' },
            segregatedForReasonsOtherThanProtection: { eventType: 'POSTPONE' },
            sentenceReviewedUnderULSScheme: { eventType: 'POSTPONE' },
        },
    },
    refusal: {
        Yes: {
            addressUnsuitable: { eventType: 'REFUSE' },
            insufficientTime: { eventType: 'REFUSE' },
        },
    },
    excluded: {
        Yes: {
            sexOffenderRegister: { eventType: 'INELIGIBLE' },
            convictedSexOffences: { eventType: 'INELIGIBLE' },
            rotlFail: { eventType: 'INELIGIBLE' },
            communityCurfew: { eventType: 'INELIGIBLE' },
            servingRecall: { eventType: 'INELIGIBLE' },
            deportation: { eventType: 'INELIGIBLE' },
            cja2003_19ZA: { eventType: 'INELIGIBLE' },
            curfewConditionsRecall: { eventType: 'INELIGIBLE' },
            twoThirdsRelease: { eventType: 'INELIGIBLE' },
            notice_244zb: { eventType: 'INELIGIBLE' },
            schedule_20B: { eventType: 'INELIGIBLE' },
        },
    },
    exceptionalCircumstances: {
      No: {
        sexOffender: { eventType: 'INELIGIBLE' },
        deportationLiable: { eventType: 'INELIGIBLE' },
        immigrationStatusUnclear: { eventType: 'INELIGIBLE' },
        recalled: { eventType: 'INELIGIBLE' },
        sentenceCategory: { eventType: 'INELIGIBLE' },
        historyOfTerrorism: { eventType: 'INELIGIBLE' },
        categoryA: { eventType: 'INELIGIBLE' },
        riskOfHarm: { eventType: 'INELIGIBLE' },
      },
    },
}
