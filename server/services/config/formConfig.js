const headerFields = ['OFF_NAME', 'OFF_NOMS', 'EST_PREMISE', 'CREATION_DATE']

const noAddress = 'there is no approved address for you to live at'
const noTime = 'there is not enough time before you’re due to be released'

module.exports = {
  requiredFields: {
    eligible: [...headerFields, 'SENT_HDCED', 'SENT_CRD'],
    optout: [...headerFields, 'SENT_CRD'],
    postponed: [...headerFields, 'POSTPONE_REASON'],
    refused: [...headerFields, 'REFUSAL_REASON', 'SENT_CRD'],
    approved: [...headerFields, 'CURFEW_ADDRESS', 'SENT_HDCED', 'SENT_CRD'],
    address_checks: [...headerFields, 'SENT_HDCED'],
    address: [...headerFields, 'SENT_HDCED'],
    address_unsuitable: headerFields,
    ineligible: [...headerFields, 'INELIGIBLE_REASON'],
    no_time: [...headerFields, 'SENT_CRD'],
    unsuitable: [...headerFields, 'UNSUITABLE_REASON'],
    agency_notification: [
      ...headerFields,
      'CURFEW_FIRST',
      'CURFEW_HOURS',
      'CURFEW_ADDRESS',
      'CURFEW_TELEPHONE',
      'SENT_HDCED',
      'SENT_HDCAD',
      'SENT_CRD',
    ],
    cancel_agency_notification: [...headerFields, 'CURFEW_HOURS', 'CURFEW_ADDRESS', 'SENT_HDCED', 'SENT_CRD'],
    licence_variation: [...headerFields, 'CURFEW_ADDRESS', 'SENT_CRD'],
  },

  refusalReasonlabels: {
    addressUnsuitable: noAddress,
    insufficientTime: noTime,
    outOfTime: noTime,
    noAvailableAddress: noAddress,
  },

  ineligibleReasonlabels: {
    sexOffenderRegister: 'you will be subject to sex offender registration on release',
    convictedSexOffences: 'you are serving an extended sentence',
    rotlFail: 'you did not return from release on temporary licence (ROTL)',
    communityCurfew: 'you breached your community order curfew',
    servingRecall: 'you were recalled from early release on compassionate grounds',
    deportation: 'the court recommended you should be deported from the UK',
    cja2003_19ZA: 'you are serving a sentence for a specified terrorist or terrorist connected offence',
    hdcCurfewConditions: 'you previously broke home detention curfew conditions and were recalled to prison',
    twoThirdsRelease: 'you are serving a sentence subject to two thirds release',
    notice_244zb:
      'the Secretary of State has referred your case to the Parole Board under section 244ZB of the Criminal Justice Act 2003',
    schedule_20B:
      'you are subject to the release provisions for long-term prisoners set out in the Criminal Justice Act 1991 (i.e. Schedule 20B of the 2003 Act)',
  },

  unsuitableReasonlabels: {
    sexOffender: 'of your conviction history',
    deportationLiable: 'you are being considered for deportation',
    immigrationStatusUnclear: 'your immigration status is not clear',
    recalled: 'you were recalled to prison for poor behaviour during your previous home detention curfew release',
    sentenceCategory: 'of the type of offence you were convicted of',
    historyOfTerrorism: 'of your terrorist or terrorist connected offending history',
    categoryA: 'you are a category A prisoner',
    riskOfHarm: 'you are at high risk of harm AND subject to MAPPA level 2 or 3 management',
  },

  postponedReasonlabels: {
    awaitingInformation: 'we are awaiting information in order to decide if you are suitable to release',
    committedOffenceWhileInPrison:
      'you committed an offence while you’ve been in prison and the criminal/Independent Adjudication proceedings are still outstanding',
    remandedInCustodyOnOtherMatters: 'you are remanded in custody on other matters',
    confiscationOrderOutstanding: 'we think you will frustrate your outstanding confiscation order proceedings',
    segregatedForReasonsOtherThanProtection:
      'you are currently segregated from the general population for reasons other than your own protection',
    sentenceReviewedUnderULSScheme: 'your sentence is being reviewed under the unduly lenient sentence (ULS) scheme',
  },
}
