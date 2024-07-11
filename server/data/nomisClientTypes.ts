type Iso8601DateString = string

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
    sentenceStartDate: Iso8601DateString
    confirmedReleaseDate: Iso8601DateString
    releaseDate: Iso8601DateString
    nonDtoReleaseDateType: string
    additionalDaysAwarded: number
    automaticReleaseOverrideDate: Iso8601DateString
    conditionalReleaseOverrideDate: Iso8601DateString
    nonParoleOverrideDate: Iso8601DateString
    postRecallReleaseOverrideDate: Iso8601DateString
    dtoPostRecallReleaseDateOverride: Iso8601DateString
    nonDtoReleaseDate: Iso8601DateString
    sentenceExpiryDate: Iso8601DateString
    automaticReleaseDate: Iso8601DateString
    conditionalReleaseDate: Iso8601DateString
    nonParoleDate: Iso8601DateString
    postRecallReleaseDate: Iso8601DateString
    licenceExpiryDate: Iso8601DateString
    homeDetentionCurfewEligibilityDate: Iso8601DateString
    paroleEligibilityDate: Iso8601DateString
    homeDetentionCurfewActualDate: Iso8601DateString
    actualParoleDate: Iso8601DateString
    releaseOnTemporaryLicenceDate: Iso8601DateString
    earlyRemovalSchemeEligibilityDate: Iso8601DateString
    earlyTermDate: Iso8601DateString
    midTermDate: Iso8601DateString
    lateTermDate: Iso8601DateString
    topupSupervisionExpiryDate: Iso8601DateString
    dtoPostRecallReleaseDate: Iso8601DateString
    tariffDate: Iso8601DateString
    tariffEarlyRemovalSchemeEligibilityDate: Iso8601DateString
    effectiveSentenceEndDate: Iso8601DateString
    topupSupervisionExpiryCalculatedDate: Iso8601DateString
    licenceExpiryCalculatedDate: Iso8601DateString
  }
}
