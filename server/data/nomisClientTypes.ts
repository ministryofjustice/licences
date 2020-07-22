type ISO_8601_DATE_STRING = string

export interface OffenderSentence {
  bookingId: number
  offenderNo: string
  firstName: string
  lastName: string
  agencyLocationId: string
  dateOfBirth: string
  agencyLocationDesc: string
  internalLocationDesc: string
  facialImageId: number
  sentenceDetail: {
    bookingId: number
    sentenceStartDate: ISO_8601_DATE_STRING
    confirmedReleaseDate: ISO_8601_DATE_STRING
    releaseDate: ISO_8601_DATE_STRING
    nonDtoReleaseDateType: string
    additionalDaysAwarded: number
    automaticReleaseOverrideDate: ISO_8601_DATE_STRING
    conditionalReleaseOverrideDate: ISO_8601_DATE_STRING
    nonParoleOverrideDate: ISO_8601_DATE_STRING
    postRecallReleaseOverrideDate: ISO_8601_DATE_STRING
    dtoPostRecallReleaseDateOverride: ISO_8601_DATE_STRING
    nonDtoReleaseDate: ISO_8601_DATE_STRING
    sentenceExpiryDate: ISO_8601_DATE_STRING
    automaticReleaseDate: ISO_8601_DATE_STRING
    conditionalReleaseDate: ISO_8601_DATE_STRING
    nonParoleDate: ISO_8601_DATE_STRING
    postRecallReleaseDate: ISO_8601_DATE_STRING
    licenceExpiryDate: ISO_8601_DATE_STRING
    homeDetentionCurfewEligibilityDate: ISO_8601_DATE_STRING
    paroleEligibilityDate: ISO_8601_DATE_STRING
    homeDetentionCurfewActualDate: ISO_8601_DATE_STRING
    actualParoleDate: ISO_8601_DATE_STRING
    releaseOnTemporaryLicenceDate: ISO_8601_DATE_STRING
    earlyRemovalSchemeEligibilityDate: ISO_8601_DATE_STRING
    earlyTermDate: ISO_8601_DATE_STRING
    midTermDate: ISO_8601_DATE_STRING
    lateTermDate: ISO_8601_DATE_STRING
    topupSupervisionExpiryDate: ISO_8601_DATE_STRING
    dtoPostRecallReleaseDate: ISO_8601_DATE_STRING
    tariffDate: ISO_8601_DATE_STRING
    tariffEarlyRemovalSchemeEligibilityDate: ISO_8601_DATE_STRING
    effectiveSentenceEndDate: ISO_8601_DATE_STRING
  }
}
