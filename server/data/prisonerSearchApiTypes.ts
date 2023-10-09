/* eslint-disable camelcase */
declare module 'prisonerOffenderSearchApi' {
  export type BookingIds = Schemas['BookingIds']
  export type Prisoner = Schemas['Prisoner']

  interface Schemas {
    IndexStatus: {
      id: string
      currentIndex: 'INDEX_A' | 'INDEX_B'
      startIndexTime?: string
      endIndexTime?: string
      inProgress: boolean
    }
    Prisoner: {
      /** Prisoner Number */
      prisonerNumber?: string
      /** PNC Number */
      pncNumber?: string
      /** PNC Number */
      pncNumberCanonicalShort?: string
      /** PNC Number */
      pncNumberCanonicalLong?: string
      /** CRO Number */
      croNumber?: string
      /** Booking No. */
      bookingId?: string
      /** Book Number */
      bookNumber?: string
      /** First Name */
      firstName?: string
      /** Middle Names */
      middleNames?: string
      /** Last name */
      lastName?: string
      /** Date of Birth */
      dateOfBirth?: string
      /** Gender */
      gender?: string
      /** Ethnicity */
      ethnicity?: string
      /** Youth Offender? */
      youthOffender?: boolean
      /** Marital Status */
      maritalStatus?: string
      /** Religion */
      religion?: string
      /** Nationality */
      nationality?: string
      /** Status of the prisoner */
      status?: string
      /** Prison ID */
      prisonId?: string
      /** Prison Name */
      prisonName?: string
      /** In prison cell location */
      cellLocation?: string
      /** Aliases Names and Details */
      aliases?: Schemas['PrisonerAlias'][]
      /** Alerts */
      alerts?: Schemas['PrisonerAlert'][]
      /** Cell Sharing Risk Assessment */
      csra?: string
      /** Prisoner Category */
      category?: string
      /** Legal Status */
      legalStatus?:
        | 'RECALL'
        | 'DEAD'
        | 'INDETERMINATE_SENTENCE'
        | 'SENTENCED'
        | 'CONVICTED_UNSENTENCED'
        | 'CIVIL_PRISONER'
        | 'IMMIGRATION_DETAINEE'
        | 'REMAND'
        | 'UNKNOWN'
        | 'OTHER'
      /** Most serious offence for this sentence */
      mostSeriousOffence?: string
      /** Indicates that the offender has been recalled */
      recall?: boolean
      /** Indicates the the offender has an indeterminate sentence */
      indeterminateSentence?: boolean
      /** Start Date for this sentence */
      sentenceStartDate?: string
      /** Actual of most likely Release Date */
      releaseDate?: string
      /** Release Date Confirmed */
      confirmedReleaseDate?: string
      /** Sentence Expiry Date */
      sentenceExpiryDate?: string
      /** Licence Expiry Date */
      licenceExpiryDate?: string
      /** HDC Eligibility Date */
      homeDetentionCurfewEligibilityDate?: string
      /** HDC Actual Date */
      homeDetentionCurfewActualDate?: string
      /** Top-up supervision expiry date */
      topupSupervisionExpiryDate?: string
      /** Days added to sentence term due to adjustments. */
      additionalDaysAwarded?: number
      /** Release date for Non determinant sentence (if applicable). This will be based on one of ARD, CRD, NPD or PRRD. */
      nonDtoReleaseDate?: string
      /** Indicates which type of non-DTO release date is the effective release date. One of 'ARD’, 'CRD’, ‘NPD’ or 'PRRD’. */
      nonDtoReleaseDateType?: 'ARD' | 'CRD' | 'NPD' | 'PRRD'
      /** Date prisoner was received into the prison */
      receptionDate?: string
      /** Parole  Eligibility Date */
      paroleEligibilityDate?: string
      /** Automatic Release Date. If automaticReleaseOverrideDate is available then it will be set as automaticReleaseDate */
      automaticReleaseDate?: string
      /** Post Recall Release Date. if postRecallReleaseOverrideDate is available then it will be set as postRecallReleaseDate */
      postRecallReleaseDate?: string
      /** Conditional Release Date. If conditionalReleaseOverrideDate is available then it will be set as conditionalReleaseDate */
      conditionalReleaseDate?: string
      /** Actual Parole Date */
      actualParoleDate?: string
      /** current prison or outside with last movement information. */
      locationDescription?: string
    }
    /** Alerts */
    PrisonerAlert: {
      /** Alert Type */
      alertType: string
      /** Alert Code */
      alertCode: string
    }
    /** Aliases Names and Details */
    PrisonerAlias: {
      /** First Name */
      firstName: string
      /** Middle names */
      middleNames?: string
      /** Last name */
      lastName: string
      /** Date of birth */
      dateOfBirth: string
      /** Gender */
      gender?: string
      /** Ethnicity */
      ethnicity?: string
    }
    PrisonerNumbers: {
      /** List of prisoner numbers to search by */
      prisonerNumbers: string[]
    }
    /** Search Criteria for Prisoner Search */
    PrisonSearch: {
      /** Prisoner identifier, one of prisoner number, book number, booking ID or PNC */
      prisonerIdentifier?: string
      /** First Name */
      firstName?: string
      /** Last Name */
      lastName?: string
      /** Prison Id, Prison Id or OUT or TRN */
      prisonId?: string
      /** Include aliases in search */
      includeAliases: boolean
    }
    /** Search Criteria for Prisoner Search */
    SearchCriteria: {
      /** Prisoner identifier, one of prisoner number, book number, booking ID or PNC */
      prisonerIdentifier?: string
      /** First Name */
      firstName?: string
      /** Last Name */
      lastName?: string
      /** List of Prison Ids (can include OUT and TRN) to restrict the search by. Unrestricted if not supplied or null */
      prisonIds?: string[]
      /** Include aliases in search */
      includeAliases: boolean
    }
    BookingIds: {
      /** List of bookingIds to search by */
      bookingIds: number[]
    }
    /** Search Criteria for Global Prisoner Search */
    GlobalSearchCriteria: {
      /** Prisoner identifier, one of prisoner number, book number, booking ID or PNC */
      prisonerIdentifier?: string
      /** First Name */
      firstName?: string
      /** Last Name */
      lastName?: string
      /** Gender, F - Female, M - Male, NK - Not Known / Not Recorded or NS - Not Specified (Indeterminate) */
      gender?: 'M' | 'F' | 'NK' | 'NS' | 'ALL'
      /** Location, All or Inside or Outside */
      location?: string
      /** Date of birth */
      dateOfBirth?: string
      /** Include aliases in search */
      includeAliases: boolean
    }
    Pageable: {
      offset?: number
      sort?: Schemas['Sort']
      paged?: boolean
      unpaged?: boolean
      pageNumber?: number
      pageSize?: number
    }
    Sort: {
      sorted?: boolean
      unsorted?: boolean
      empty?: boolean
    }
    PagePrisoner: {
      totalPages?: number
      totalElements?: number
      size?: number
      content?: Schemas['Prisoner'][]
      number?: number
      sort?: Schemas['Sort']
      last?: boolean
      first?: boolean
      numberOfElements?: number
      pageable?: Schemas['Pageable']
      empty?: boolean
    }
  }
}
