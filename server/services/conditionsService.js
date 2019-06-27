const moment = require('moment')
const { formatConditionsInput } = require('./utils/conditionsFormatter')
const { getIn, isEmpty, interleave } = require('../utils/functionalHelpers')
const { getAdditionalConditionsConfig, standardConditions, multiFields } = require('./config/conditionsConfig')

module.exports = function createConditionsService({ use2019Conditions }) {
  const additionalConditions = getAdditionalConditionsConfig(use2019Conditions)

  function getFullTextForApprovedConditions(licence) {
    const standardConditionsText = standardConditions.map(it => it.text.replace(/\.+$/, ''))
    const standardOnly = getIn(licence, ['licenceConditions', 'standard', 'additionalConditionsRequired']) === 'No'

    if (standardOnly) {
      return { standardConditions: standardConditionsText, additionalConditions: [] }
    }

    const conditions = populateLicenceWithApprovedConditions(licence).licenceConditions

    const additionalConditionsText = isEmpty(conditions)
      ? []
      : conditions.filter(it => it.group !== 'Bespoke' || it.approved === 'Yes').map(it => getConditionText(it.content))

    return {
      standardConditions: standardConditionsText,
      additionalConditions: additionalConditionsText,
    }
  }

  function getConditionText(content) {
    return content
      .map(({ text, variable }) => text || variable)
      .join('')
      .replace(/\.+$/, '')
  }

  function getStandardConditions() {
    return standardConditions
  }

  function getAdditionalConditions(licence = null) {
    const licenceAdditionalConditions = getIn(licence, ['licenceConditions', 'additional'])
    if (licenceAdditionalConditions) {
      return additionalConditions
        .map(populateFromSavedLicence(licenceAdditionalConditions))
        .reduce(splitIntoGroupedObject, {})
    }

    return additionalConditions.reduce(splitIntoGroupedObject, {})
  }

  function formatConditionInputs(requestBody) {
    const selectedConditionsConfig = additionalConditions.filter(condition =>
      requestBody.additionalConditions.includes(condition.id)
    )

    return formatConditionsInput(requestBody, selectedConditionsConfig)
  }

  function populateLicenceWithApprovedConditions(licence) {
    return populateLicenceWithConditions(licence, null, true)
  }

  function populateLicenceWithConditions(licence, errors = {}, approvedOnly = false) {
    if (getIn(licence, ['licenceConditions', 'standard', 'additionalConditionsRequired']) === 'No') {
      return licence
    }

    const licenceAdditionalConditions = getIn(licence, ['licenceConditions', 'additional'])
    const bespokeConditions = getIn(licence, ['licenceConditions', 'bespoke']) || []
    const conditionsOnLicence = !isEmpty(licenceAdditionalConditions) || bespokeConditions.length > 0
    if (!conditionsOnLicence) {
      return licence
    }

    const conditionIdsSelected = Object.keys(licenceAdditionalConditions)
    const selectedConditionsConfig = additionalConditions.filter(condition =>
      conditionIdsSelected.includes(condition.id)
    )

    return populateAdditionalConditionsAsObject(licence, selectedConditionsConfig, errors, approvedOnly)
  }

  function createConditionsObjectForLicence(additional, bespoke) {
    if (isEmpty(additional)) {
      return { additional: {}, bespoke }
    }

    const conditionIds = additional.additionalConditions
    const selectedConditionsConfig = additionalConditions.filter(condition => conditionIds.includes(condition.id))
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

  function populateAdditionalConditionsAsObject(
    rawLicence,
    selectedConditionsConfig,
    inputErrors = {},
    approvedOnly = false
  ) {
    const { additional, bespoke } = rawLicence.licenceConditions

    const getObjectForAdditional = createAdditionalMethod(rawLicence, selectedConditionsConfig, inputErrors)

    const populatedAdditional = Object.keys(additional)
      .sort(orderForView(additionalConditions.map(condition => condition.id)))
      .map(getObjectForAdditional)

    const populatedBespoke = bespoke ? bespoke.map(getObjectForBespoke) : []
    const selectedBespoke = approvedOnly
      ? populatedBespoke.filter(condition => condition.approved === 'Yes')
      : populatedBespoke

    return { ...rawLicence, licenceConditions: [...populatedAdditional, ...selectedBespoke] }
  }

  function createAdditionalMethod(rawLicence, selectedConditions, inputErrors) {
    return condition => {
      const selectedCondition = selectedConditions.find(selected => String(selected.id) === String(condition))
      const userInput = getIn(rawLicence, ['licenceConditions', 'additional', condition])
      const userErrors = getIn(inputErrors, [condition])
      const content = getContentForCondition(selectedCondition, userInput, userErrors)

      return {
        content,
        group: selectedCondition.group_name,
        subgroup: selectedCondition.subgroup_name,
        id: selectedCondition.id,
        inputRequired: !!selectedCondition.user_input,
      }
    }
  }

  function getContentForCondition(selectedCondition, userInput, userErrors) {
    const userInputName = selectedCondition.user_input

    return userInputName
      ? injectUserInputAsObject(selectedCondition, userInput, userErrors)
      : [{ text: selectedCondition.text }]
  }

  function getObjectForBespoke(condition, index) {
    return {
      content: [{ text: condition.text }],
      group: 'Bespoke',
      subgroup: null,
      id: `bespoke-${index}`,
      approved: condition.approved,
    }
  }

  function injectUserInputAsObject(condition, userInput, userErrors) {
    const conditionName = condition.user_input
    const conditionText = condition.text
    const fieldPositionObject = condition.field_position
    const { userContent, errors } = condition.manipulateInput
      ? condition.manipulateInput(userInput, userErrors)
      : { userContent: userInput, errors: userErrors }

    if (multiFields[conditionName]) {
      return injectMultiFieldsAsObject(userContent, conditionText, errors, multiFields[conditionName])
    }

    return injectUserInputStandardAsObject(userContent, conditionText, fieldPositionObject, errors)
  }

  function injectUserInputStandardAsObject(userInput, conditionText, fieldPositionObject, userErrors) {
    const fieldNames = Object.keys(fieldPositionObject)
    const splitConditionText = conditionText.split(betweenBrackets).filter(text => text)
    const reducer = injectVariablesIntoViewObject(fieldNames, fieldPositionObject, userInput, userErrors)
    return splitConditionText.reduce(reducer, [])
  }

  function injectVariablesIntoViewObject(fieldNames, fieldPositionObject, userInput, userErrors) {
    return (conditionArray, textSegment, index) => {
      const fieldNameForPlaceholder = fieldNames.find(field => String(fieldPositionObject[field]) === String(index))
      if (!fieldNameForPlaceholder) {
        return [...conditionArray, { text: textSegment }]
      }

      const inputError = getIn(userErrors, [fieldNameForPlaceholder])
      if (inputError) {
        return [...conditionArray, { text: textSegment }, { error: `[${inputError}]` }]
      }

      const inputtedData = getIn(userInput, [fieldNameForPlaceholder])
      return [...conditionArray, { text: textSegment }, { variable: inputtedData }]
    }
  }

  function injectMultiFieldsAsObject(userInput, conditionText, userErrors, config) {
    const variableString = (variable, error) => (error ? `[${error}]` : variable)

    const strings = config.fields.map(fieldName => {
      return variableString(getIn(userInput, [fieldName]), getIn(userErrors, [fieldName]))
    })

    const fieldErrors = config.fields.map(fieldName => getIn(userErrors, [fieldName])).filter(e => e)

    const string = interleave(strings, config.joining)

    const variableKey = fieldErrors.length > 0 ? 'error' : 'variable'

    const splitConditionText = conditionText.split(betweenBrackets).filter(text => text)
    return [{ text: splitConditionText[0] }, { [variableKey]: string }, { text: splitConditionText[1] }]
  }

  const betweenBrackets = /\[[^\]]*]/g

  const inputsFor = (fieldPositions, formInputs) => {
    const conditionAttributes = Object.keys(fieldPositions)

    return conditionAttributes.reduce((conditionDataObject, formItem) => {
      return {
        ...conditionDataObject,
        [formItem]: formInputs[formItem],
      }
    }, {})
  }

  const orderForView = requiredOrder => (a, b) => requiredOrder.indexOf(a) - requiredOrder.indexOf(b)

  return {
    getStandardConditions,
    getAdditionalConditions,
    formatConditionInputs,
    populateLicenceWithConditions,
    populateLicenceWithApprovedConditions,
    createConditionsObjectForLicence,
    populateAdditionalConditionsAsObject,
    getFullTextForApprovedConditions,
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

function populateFromSavedLicence(inputtedConditions) {
  const populatedConditionIds = Object.keys(inputtedConditions)

  return condition => {
    const submission = getSubmissionForCondition(condition.id, inputtedConditions)
    const selected = populatedConditionIds.includes(String(condition.id))

    return { ...condition, selected, user_submission: submission }
  }
}

function getSubmissionForCondition(conditionId, inputtedConditions) {
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

  return inputtedConditions[conditionId]
}
