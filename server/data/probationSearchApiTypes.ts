/* eslint-disable camelcase */
declare module 'probationSearchApi' {
  export type OffenderDetail = Schemas['OffenderDetail']

  interface Schemas {
    OffenderDetail: {
      /** Other Ids */
      otherIds?: Schemas['OtherId']

      /** Offender Managers */
      offenderManagers?: Schemas['OffenderManager'][]
    }

    /** Other Id Details */
    OtherId: {
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

      /** Nomis Number */
      active?: string
    }

    /** Staff */
    Staff: {
      /** Unallocated */
      unallocated: boolean
    }

    /** Probation Area */
    ProbationArea: {
      /** Probation Area Details */
      probationArea: Schemas['ProbationArea']

      /** Nomis Number */
      nomsNumber?: string
    }
  }
}
