import type { ConditionVersion } from '../../data/licenceClientTypes'
import { additionalConditionsV1 } from './additionalConditionsV1'
import { additionalConditionsV2 } from './additionalConditionsV2'

export const standard = {
  fields: [
    {
      additionalConditionsRequired: {
        responseType: 'requiredYesNo',
        validationMessage: 'Select yes or no',
      },
    },
  ],
  modificationRequiresApproval: true,
}

export const additional = new Map<ConditionVersion, any>([
  [1, additionalConditionsV1],
  [2, additionalConditionsV2],
])

export const conditionsSummary = {
  fields: [
    {
      additionalConditionsJustification: {
        responseType: 'requiredString',
        validationMessage: 'You must explain why you selected these additional conditions',
      },
    },
  ],
  validate: true,
  nextPath: {
    path: '/hdc/taskList/',
    change: '/hdc/review/licenceDetails/',
  },
}
