import { AdditionalConditionsVersion, ConditionMetadata } from '../../data/licenceClientTypes'
import { AdditionalConditions } from '../../data/licenceTypes'
import * as additionalConditionsV1 from './conditions/additionalConditions/v1/conditions'
import * as additionalConditionsV2 from './conditions/additionalConditions/v2/conditions'
import { standardConditions as stdConditionsV2 } from './conditions/standardConditions/v2/standardConditions'

export const standardConditions = stdConditionsV2

export const CURRENT_CONDITION_VERSION: AdditionalConditionsVersion = 2

const pssConditions: Map<AdditionalConditionsVersion, string[]> = new Map([
  [1, additionalConditionsV1.pssConditions],
  [2, additionalConditionsV2.pssConditions],
])
export const getPssConditions = (version: AdditionalConditionsVersion) => pssConditions.get(version)

const additionalConditions: Map<AdditionalConditionsVersion, ConditionMetadata[]> = new Map([
  [1, additionalConditionsV1.conditions],
  [2, additionalConditionsV2.conditions],
])
export const getAdditionalConditionsConfig = (version: AdditionalConditionsVersion) => additionalConditions.get(version)

const modifyAdditionalConditions: Map<AdditionalConditionsVersion, (conditions: AdditionalConditions) => void> =
  new Map([
    [1, additionalConditionsV1.modifyAdditionalConditions],
    [2, additionalConditionsV2.modifyAdditionalConditions],
  ])
export const applyModifications = (version: AdditionalConditionsVersion, conditions: AdditionalConditions) =>
  modifyAdditionalConditions.get(version)(conditions)

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
