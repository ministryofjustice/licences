import { ConditionVersion, ConditionMetadata } from '../../data/licenceClientTypes'
import { AdditionalConditions } from '../../data/licenceTypes'
import * as v1 from './conditions/v1/conditions'
import * as v2 from './conditions/v2/conditions'
import { standardConditions as stdConditions } from './conditions/standardConditions'

export const standardConditions = stdConditions

export const CURRENT_CONDITION_VERSION: ConditionVersion = 1

const additionalConditions: Map<ConditionVersion, ConditionMetadata[]> = new Map([
  [1, v1.conditions],
  [2, v2.conditions],
])
export const getAdditionalConditionsConfig = (version: ConditionVersion) => additionalConditions.get(version)

const persistedAbuseAndBehaviours: Map<ConditionVersion, (conditions: AdditionalConditions) => string[]> = new Map([
  [1, v1.getPersistedAbuseAndBehaviours],
  [2, v2.getPersistedAbuseAndBehaviours],
])
export const getPersistedAbuseBehaviours = (version: ConditionVersion, conditions: AdditionalConditions) =>
  persistedAbuseAndBehaviours.get(version)(conditions)

export const multiFields = {
  appointmentDetails: {
    fields: ['appointmentAddress', 'appointmentDate', 'appointmentTime'],
    joining: [' on ', ' at '],
  },
  appointmentDetailsInDrugsSection: {
    fields: ['appointmentAddressInDrugsSection', 'appointmentDateInDrugsSection', 'appointmentTimeInDrugsSection'],
    joining: [' on ', ' at '],
  },
  attendSampleDetails: {
    fields: ['attendSampleDetailsName', 'attendSampleDetailsAddress'],
    joining: [', '],
  },
  drug_testing: {
    fields: ['drug_testing_name', 'drug_testing_address'],
    joining: [', '],
  },
  alcoholMonitoring: {
    fields: ['timeframe', 'endDate'],
    joining: [' ending on '],
  },
}
