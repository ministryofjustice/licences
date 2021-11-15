import moment from 'moment'
import { formatConditionsInput, getConditionText, formatConditionsText } from './utils/conditionsFormatter'
import { isEmpty } from '../utils/functionalHelpers'
import * as builder from './licenceWithConditionsBuilder'
import { getAdditionalConditionsConfig, standardConditions, CURRENT_CONDITION_VERSION } from './config/conditionsConfig'
import { AdditionalConditions, Licence } from '../data/licenceTypes'

export default function createConditionsService() {
  function getFullTextForApprovedConditions(licence: Licence) {
    const standardConditionsText = standardConditions.map((it) => it.text.replace(/\.+$/, ''))

    // could be undefined, 'No' or 'Yes'
    const standardOnly = licence?.licenceConditions?.standard?.additionalConditionsRequired !== 'Yes'

    if (standardOnly) {
      return { standardConditions: standardConditionsText, additionalConditions: [] }
    }

    const conditions = builder.populateLicenceWithApprovedConditions(licence).licenceConditions

    // conditions can be either the original licenceConditions object or an array of objects if
    // populateLicenceWithApprovedConditions did its thing.
    // This is really ugly, but seems like the lowest risk way to fix a bug (DCS-321).
    if (!Array.isArray(conditions)) {
      return { standardConditions: standardConditionsText, additionalConditions: [] }
    }

    const additionalConditionsText = isEmpty(conditions)
      ? []
      : conditions
          .filter((it) => it.group !== 'Bespoke' || it.approved === 'Yes')
          .map((it) => getConditionText(it.content))

    return {
      standardConditions: standardConditionsText,
      additionalConditions: additionalConditionsText,
    }
  }

  function getStandardConditions() {
    return standardConditions
  }

  function getAdditionalConditions(licence: Licence = null) {
    const licenceAdditionalConditions = licence?.licenceConditions?.additional
    const additionalConditions = getAdditionalConditionsConfig(CURRENT_CONDITION_VERSION)
    if (licenceAdditionalConditions) {
      return additionalConditions
        .map(populateFromSavedLicence(licenceAdditionalConditions))
        .reduce(splitIntoGroupedObject, {})
    }

    return additionalConditions.reduce(splitIntoGroupedObject, {})
  }

  function formatConditionInputs(requestBody) {
    const selectedConditionsConfig = getAdditionalConditionsConfig(CURRENT_CONDITION_VERSION).filter((condition) =>
      requestBody.additionalConditions.includes(condition.id)
    )

    return formatConditionsInput(requestBody, selectedConditionsConfig)
  }

  function createConditionsObjectForLicence(additional, bespoke) {
    if (isEmpty(additional)) {
      return { additional: {}, bespoke }
    }

    const conditionIds = additional.additionalConditions
    const selectedConditionsConfig = getAdditionalConditionsConfig(CURRENT_CONDITION_VERSION).filter((condition) =>
      conditionIds.includes(condition.id)
    )
    const additionalConditionsObject = createAdditionalConditionsObject(selectedConditionsConfig, additional)

    return { additional: { ...additionalConditionsObject }, bespoke }
  }

  function createAdditionalConditionsObject(selectedConditions, formInputs) {
    return selectedConditions.reduce((conditions, condition) => {
      const conditionAttributes = condition.field_position
      const userInputs = conditionAttributes ? inputsFor(conditionAttributes, formInputs) : {}

      return {
        ...conditions,
        [condition.id]: {
          ...userInputs,
        },
      }
    }, {})
  }

  function getNonStandardConditions(licence) {
    let { licenceConditions = [] } = builder.populateLicenceWithConditions(licence)
    if (!Array.isArray(licenceConditions)) {
      licenceConditions = []
    }

    const allAdditionalConditions = licenceConditions.filter(
      (condition) => condition.group !== 'Bespoke' && condition.group !== 'Post-sentence supervision only'
    )
    const pssConditions = licenceConditions.filter((condition) => condition.group === 'Post-sentence supervision only')
    const bespokeConditions = licenceConditions.filter(
      (condition) => condition.group === 'Bespoke' && condition.approved === 'Yes'
    )

    const unapprovedBespokeConditions = licenceConditions.filter(
      (condition) => condition.group === 'Bespoke' && (condition.approved === 'No' || !condition.approved)
    )

    return {
      additionalConditions: allAdditionalConditions.map(formatConditionsText),
      bespokeConditions: bespokeConditions.map(formatConditionsText),
      pssConditions: pssConditions.map(formatConditionsText),
      unapprovedBespokeConditions: unapprovedBespokeConditions.map(formatConditionsText),
    }
  }

  const inputsFor = (fieldPositions, formInputs) => {
    const conditionAttributes = Object.keys(fieldPositions)

    return conditionAttributes.reduce((conditionDataObject, formItem) => {
      return {
        ...conditionDataObject,
        [formItem]: formInputs[formItem],
      }
    }, {})
  }

  return {
    // condition routes / review routes / pdf generation
    populateLicenceWithConditions: builder.populateLicenceWithConditions,

    // form generation
    getFullTextForApprovedConditions,

    // condition routes
    createConditionsObjectForLicence,
    getNonStandardConditions,
    formatConditionInputs,
    getStandardConditions,
    getAdditionalConditions,
  }
}

function splitIntoGroupedObject(conditionObject, condition) {
  const groupName = condition.group_name || 'base'
  const subgroupName = condition.subgroup_name || 'base'

  const group = conditionObject[groupName] || {}
  const subgroup = group[subgroupName] || []

  const newSubgroup = [...subgroup, condition]
  const newGroup = { ...group, [subgroupName]: newSubgroup }

  return { ...conditionObject, [groupName]: newGroup }
}

function populateFromSavedLicence(inputtedConditions: AdditionalConditions) {
  const populatedConditionIds = Object.keys(inputtedConditions)

  return (condition) => {
    const submission = getSubmissionForCondition(condition.id, inputtedConditions)
    const selected = populatedConditionIds.includes(String(condition.id))

    return { ...condition, selected, user_submission: submission }
  }
}

function getSubmissionForCondition(conditionId, inputtedConditions: AdditionalConditions) {
  if (isEmpty(inputtedConditions[conditionId])) {
    return {}
  }

  if (conditionId === 'ATTENDDEPENDENCY') {
    const appointmentDate = moment(inputtedConditions[conditionId].appointmentDate, 'DD/MM/YYYY')
    return {
      ...inputtedConditions[conditionId],
      appointmentDay: appointmentDate.format('DD'),
      appointmentMonth: appointmentDate.format('MM'),
      appointmentYear: appointmentDate.format('YYYY'),
    }
  }

  if (conditionId === 'ATTENDDEPENDENCYINDRUGSSECTION') {
    const appointmentDateInDrugsSection = moment(
      inputtedConditions[conditionId].appointmentDateInDrugsSection,
      'DD/MM/YYYY'
    )
    return {
      ...inputtedConditions[conditionId],
      appointmentDayInDrugsSection: appointmentDateInDrugsSection.format('DD'),
      appointmentMonthInDrugsSection: appointmentDateInDrugsSection.format('MM'),
      appointmentYearInDrugsSection: appointmentDateInDrugsSection.format('YYYY'),
    }
  }

  return inputtedConditions[conditionId]
}
