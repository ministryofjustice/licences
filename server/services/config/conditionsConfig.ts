import { AdditionalConditionsVersion, ConditionMetadata } from '../../data/licenceClientTypes'
import { AdditionalConditions } from '../../data/licenceTypes'
import * as v1 from './conditions/v1/conditions'
import * as v2 from './conditions/v2/conditions'
import { standardConditions as stdConditionsV1 } from './conditions/standardConditions/v1/standardConditions'

export const standardConditionsV1 = stdConditionsV1

export const CURRENT_CONDITION_VERSION: AdditionalConditionsVersion = 2

const pssConditions: Map<AdditionalConditionsVersion, string[]> = new Map([
  [1, v1.pssConditions],
  [2, v2.pssConditions],
])
export const getPssConditions = (version: AdditionalConditionsVersion) => pssConditions.get(version)

const additionalConditions: Map<AdditionalConditionsVersion, ConditionMetadata[]> = new Map([
  [1, v1.conditions],
  [2, v2.conditions],
])
export const getAdditionalConditionsConfig = (version: AdditionalConditionsVersion) => additionalConditions.get(version)

const modifyAdditionalConditions: Map<AdditionalConditionsVersion, (conditions: AdditionalConditions) => void> =
  new Map([
    [1, v1.modifyAdditionalConditions],
    [2, v2.modifyAdditionalConditions],
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
