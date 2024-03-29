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
    returnedAtRisk: 'you were returned to custody by the court during the at risk period',
    serving4YearsOrMore: 'you are serving a sentence of 4 or more years',
    hdcCurfewConditions: 'you broke home detention curfew conditions and were recalled to prison',
    servingRecall: 'you were recalled from early release on compassionate grounds',
    deportation: 'the court recommended you should be deported from the UK',
    cja2003_19ZA: 'you are serving a sentence for a specified terrorist or terrorist connected offence',
  },

  unsuitableReasonlabels: {
    sexOffender: 'of your conviction history',
    deportationLiable: 'you are being considered for deportation',
    immigrationStatusUnclear: 'your immigration status is not clear',
    recalled: 'you were recalled to prison for poor behaviour during your previous home detention curfew release',
    sentenceCategory: 'of the type of offence you were convicted of',
    historyOfTerrorism: 'of your terrorist or terrorist connected offending history',
    categoryA: 'you are a category A prisoner',
    serving4YearsOrMoreOverseas: 'your original sentence was of 4 or more years',
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
