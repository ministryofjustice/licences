import { ConditionVersion, ConditionMetadata } from '../../data/licenceClientTypes'
import { AdditionalConditions } from '../../data/licenceTypes'
import * as v1 from './conditions/additionalConditionsV1'
import * as v2 from './conditions/additionalConditionsV2'
import { standardConditions as stdConditions } from './conditions/standardConditions'

export const standardConditions = stdConditions

export const CURRENT_CONDITION_VERSION: ConditionVersion = 1

const additionalConditions: Map<ConditionVersion, ConditionMetadata[]> = new Map([
  [1, v1.conditions],
  [2, v2.conditions],
])
export const getAdditionalConditionsConfig = (version: ConditionVersion) => additionalConditions.get(version)

const abuseAndBehaviours: Map<ConditionVersion, (conditions: any) => string[]> = new Map([
  [1, v1.getAbuseAndBehaviours],
  [2, v2.getAbuseAndBehaviours],
])
export const getAbuseAndBehaviours = (version: ConditionVersion, conditions: any) =>
  abuseAndBehaviours.get(version)(conditions)

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
}
