const headerFields = ['OFF_NAME', 'OFF_NOMS', 'EST_PREMISE', 'CREATION_DATE']

const noAddress = 'there is no suitable address for you to live at'
const noTime = 'there is not enough time before you’re due to be released'

module.exports = {
  requiredFields: {
    forms_hdc_eligible: [...headerFields, 'SENT_HDCED', 'SENT_CRD'],
    forms_hdc_optout: [...headerFields, 'SENT_CRD'],
    forms_hdc_postponed: headerFields,
    forms_hdc_refused: [...headerFields, 'REFUSAL_REASON', 'SENT_CRD'],
    forms_hdc_approved: [...headerFields, 'CURFEW_ADDRESS', 'SENT_HDCED', 'SENT_CRD'],
    forms_hdc_address_checks: [...headerFields, 'SENT_HDCED'],
    forms_hdc_address: [...headerFields, 'SENT_HDCED'],
    forms_hdc_address_unsuitable: headerFields,
    forms_hdc_ineligible: [...headerFields, 'INELIGIBLE_REASON'],
    forms_hdc_no_time: [...headerFields, 'SENT_CRD'],
    forms_hdc_unsuitable: [...headerFields, 'UNSUITABLE_REASON'],
  },

  refusalReasonlabels: {
    addressUnsuitable: noAddress,
    insufficientTime: noTime,
    outOfTime: noTime,
    noAvailableAddress: noAddress,
  },

  ineligibleReasonlabels: {
    sexOffenderRegister: 'of your conviction history',
    convictedSexOffences: 'of the type of offence you were convicted of',
    rotlFail: 'you did not return from release on temporary licence (ROTL)',
    communityCurfew: 'you breached your community order curfew',
    returnedAtRisk: 'you were returned to custody by the court during the at risk period',
    hdcCurfewConditions: 'you broke home detention curfew conditions and were recalled to prison',
    servingRecall: 'you were recalled from early release on compassionate grounds',
    deportation: 'the court recommended you should be deported from the UK',
  },

  unsuitableReasonlabels: {
    sexOffender: 'of your conviction history',
    deportationLiable: 'you are likely to be deported',
    immigrationStatusUnclear: 'your immigration status is not clear',
    recalled: 'you were recalled to prison for poor behaviour during your previous early release',
    sentenceCategory: 'of the type of offence you were convicted of',
  },
}
