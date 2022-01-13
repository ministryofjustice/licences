import { ConditionMetadata } from '../../../data/licenceClientTypes'

export const v2Conditions: ConditionMetadata[] = [
  {
    id: 'NOCONTACTPRISONERV2',
    text: 'V2 Not to contact directly or indirectly any person who is a serving or remand offender or detained in State custody, without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: 'People, contact and relationships',
    subgroup_name: 'Person or group',
  },
  {
    id: 'NOCONTACTASSOCIATEV2',
    text: 'V2 Not to associate with any person currently or formerly associated with [NAME OR DESCRIBE SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer.',
    user_input: 'groupsOrOrganisations',
    field_position: {
      groupsOrOrganisation: 0,
    },
    group_name: 'People, contact and relationships',
    subgroup_name: 'Person or group',
  },
  {
    id: 'NOCONTACTSEXOFFENDERV2',
    text: 'V2 Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: 'People, contact and relationships',
    subgroup_name: 'Person or group',
  },
  {
    id: 'V2ATTENDDEPENDENCY',
    text: 'V2 Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
    user_input: 'appointmentDetails',
    field_position: {
      appointmentDate: 0,
      appointmentTime: 1,
      appointmentAddress: 2,
    },
    group_name: 'Post-sentence supervision only',
    subgroup_name: null,
  },
]
