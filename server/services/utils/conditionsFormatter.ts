import { ConditionMetadata } from '../../data/licenceClientTypes'

import { merge } from '../../utils/functionalHelpers'

const ALWAYS_REQUIRED = ['additionalConditions', 'bookingId']

export function formatConditionsText({ content }) {
  const formattedCondition = getConditionText(content)
  return { text: formattedCondition }
}

export function getConditionText(content) {
  return content
    .map(({ text, variable }) => text || variable)
    .join('')
    .replace(/\.+$/, '')
}

export function formatConditionsInput(
  inputObject,
  selectedConditionsConfig: ConditionMetadata[]
): Record<string, unknown> {
  const conditionsFieldsRequired = selectedConditionsConfig.reduce(getSelectedFieldNamesReducer, [])
  const inputObjectWithDates = combineDatesIn(conditionsFieldsRequired, inputObject)
  return filterInputs(inputObjectWithDates, conditionsFieldsRequired)
}

function filterInputs(inputObject, conditionsFieldsRequired: string[]) {
  return Object.keys(inputObject).reduce((filteredInput, fieldName) => {
    if (!ALWAYS_REQUIRED.includes(fieldName) && !conditionsFieldsRequired.includes(fieldName)) {
      return filteredInput
    }

    const fieldInput = inputObject[fieldName]

    return { ...filteredInput, [fieldName]: fieldInput }
  }, {})
}

function getSelectedFieldNamesReducer(array: string[], condition: ConditionMetadata) {
  if (!condition.field_position) {
    return array
  }
  const inputItems = Object.keys(condition.field_position).map((key) => key)
  return [...array, ...inputItems]
}

const dateFields = Object.entries({
  appointmentDate: {
    day: 'appointmentDay',
    month: 'appointmentMonth',
    year: 'appointmentYear',
  },
  appointmentDateInDrugsSection: {
    day: 'appointmentDayInDrugsSection',
    month: 'appointmentMonthInDrugsSection',
    year: 'appointmentYearInDrugsSection',
  },
  trailEndDate: {
    day: 'trailEndDay',
    month: 'trailEndMonth',
    year: 'trailEndYear',
  },
  endDate: {
    day: 'endDay',
    month: 'endMonth',
    year: 'endYear',
  },
})

function combineDatesIn(conditionsFieldsRequired: string[], inputObject: Record<string, unknown>) {
  const combinedDates = dateFields.reduce((acc, [name, values]) => {
    if (conditionsFieldsRequired.includes(name)) {
      const day = inputObject[values.day]
      const month = inputObject[values.month]
      const year = inputObject[values.year]
      if (day && month && year) {
        acc[name] = `${day}/${month}/${year}`
      }
    }
    return acc
  }, {})

  return merge(inputObject, combinedDates)
}
