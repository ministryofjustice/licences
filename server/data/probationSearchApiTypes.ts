/* eslint-disable camelcase */
declare module 'probationSearchApi' {
  export type OffenderDetail = Schemas['OffenderDetail']

  interface Schemas {
    OffenderDetail: {
      /** Other Ids */
      otherIds?: Schemas['OtherIds']

      /** Offender Managers */
      offenderManagers?: Schemas['OffenderManager'][]
    }

    /** Other Id Details */
    OtherIds: {
      /** CRN */
      crn: string

      /** Nomis Number */
      nomsNumber?: string
    }

    /** Offender Manager */
    OffenderManager: {
      /** Staff */
      staff: Schemas['Staff']

      /** Probation Area */
      probationArea: Schemas['ProbationArea']

      /** Offender Manager Active */
      active?: string
    }

    /** Staff */
    Staff: {
      /** Staff Code */
      code: string

      /** Staff Forenames */
      forenames: string

      /** Staff Surname */
      surname: string

      /** Unallocated */
      unallocated: boolean
    }

    /** Probation Area */
    ProbationArea: {
      /** Probation Area Description */
      description: string
    }
  }
}
