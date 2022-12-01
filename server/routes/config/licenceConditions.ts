import type { AdditionalConditionsVersion } from '../../data/licenceClientTypes'
import { additionalConditionsV1 } from '../../services/config/conditions/v1/fieldConfig'
import { additionalConditionsV2 } from '../../services/config/conditions/v2/fieldConfig'

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

export const additional = new Map<AdditionalConditionsVersion, any>([
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
