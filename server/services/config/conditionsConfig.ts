import { ConditionVersion, ConditionMetadata } from '../../data/licenceClientTypes'
import { v1Conditions } from './conditions/additionalConditionsV1'
import { v2Conditions } from './conditions/additionalConditionsV2'
import { standardConditions as stdConditions } from './conditions/standardConditions'

export const standardConditions = stdConditions

export const CURRENT_CONDITION_VERSION: ConditionVersion = 1

const additionalConditions: Map<ConditionVersion, ConditionMetadata[]> = new Map([
  [1, v1Conditions],
  [2, v2Conditions],
])
export const getAdditionalConditionsConfig = (version: ConditionVersion) => additionalConditions.get(version)

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
