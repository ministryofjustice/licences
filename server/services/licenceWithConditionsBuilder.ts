import { getIn, isEmpty, interleave } from '../utils/functionalHelpers'
import { getAdditionalConditionsConfig, applyModifications, multiFields } from './config/conditionsConfig'
import { AdditionalConditions, Licence } from '../data/licenceTypes'
import { ConditionVersion } from '../data/licenceClientTypes'

export class LicenceWithConditionsBuilder {
  constructor(private readonly conditionVersion: ConditionVersion) {}

  populateLicenceWithApprovedConditions(licence: Licence) {
    return this.populateLicenceWithConditions(licence, null, true)
  }

  populateLicenceWithConditions(licence: Licence, errors = {}, approvedOnly = false) {
    // could be undefined, 'No' or 'Yes'
    if (licence?.licenceConditions?.standard?.additionalConditionsRequired !== 'Yes') {
      return licence
    }

    const licenceAdditionalConditions = licence?.licenceConditions?.additional
    const bespokeConditions = licence?.licenceConditions?.bespoke || []
    const conditionsOnLicence = !isEmpty(licenceAdditionalConditions) || bespokeConditions.length > 0

    if (!conditionsOnLicence) {
      return licence
    }

    const conditionIdsSelected = Object.keys(licenceAdditionalConditions)
    const selectedConditionsConfig = getAdditionalConditionsConfig(this.conditionVersion).filter((condition) =>
      conditionIdsSelected.includes(condition.id)
    )

    this.applyModifications(licence?.licenceConditions?.additional)

    return this.populateAdditionalConditionsAsObject(licence, selectedConditionsConfig, errors, approvedOnly)
  }

  // Only exported for testing
  applyModifications(conditions: AdditionalConditions) {
    return applyModifications(this.conditionVersion, conditions)
  }

  // Only exported for testing
  populateAdditionalConditionsAsObject(
    rawLicence: Licence,
    selectedConditionsConfig,
    inputErrors = {},
    approvedOnly = false
  ) {
    const { additional, bespoke } = rawLicence.licenceConditions

    const additionalConditionsJustification =
      rawLicence?.licenceConditions?.conditionsSummary?.additionalConditionsJustification
    const getObjectForAdditional = this.createAdditionalMethod(rawLicence, selectedConditionsConfig, inputErrors)

    const populatedAdditional = Object.keys(additional)
      .sort(orderForView(getAdditionalConditionsConfig(this.conditionVersion).map((condition) => condition.id)))
      .map(getObjectForAdditional)

    const populatedBespoke = bespoke ? bespoke.map(this.getObjectForBespoke) : []
    const selectedBespoke = approvedOnly
      ? populatedBespoke.filter((condition) => condition.approved === 'Yes')
      : populatedBespoke

    return {
      ...rawLicence,
      licenceConditions: [...populatedAdditional, ...selectedBespoke],
      additionalConditionsJustification,
    }
  }

  private createAdditionalMethod(rawLicence: Licence, selectedConditions, inputErrors) {
    return (condition) => {
      const selectedCondition = selectedConditions.find((selected) => String(selected.id) === String(condition))
      const userInput = rawLicence?.licenceConditions?.additional?.[condition]
      const userErrors = inputErrors?.[condition]
      const content = this.getContentForCondition(selectedCondition, userInput, userErrors)

      return {
        content,
        group: selectedCondition.group_name,
        subgroup: selectedCondition.subgroup_name,
        id: selectedCondition.id,
        inputRequired: !!selectedCondition.user_input,
        approved: undefined,
      }
    }
  }

  private getContentForCondition(selectedCondition, userInput, userErrors) {
    const userInputName = selectedCondition.user_input

    return userInputName
      ? this.injectUserInputAsObject(selectedCondition, userInput, userErrors)
      : [{ text: selectedCondition.text }]
  }

  private getObjectForBespoke(condition, index) {
    return {
      content: [{ text: condition.text }],
      group: 'Bespoke',
      subgroup: null,
      id: `bespoke-${index}`,
      approved: condition.approved,
    }
  }

  private injectUserInputAsObject(condition, userInput, userErrors) {
    const conditionName = condition.user_input
    const conditionText = condition.text
    const fieldPositionObject = condition.field_position
    const { userContent, errors } = condition.manipulateInput
      ? condition.manipulateInput(userInput, userErrors)
      : { userContent: userInput, errors: userErrors }

    if (multiFields[conditionName]) {
      return this.injectMultiFieldsAsObject(userContent, conditionText, errors, multiFields[conditionName])
    }

    return this.injectUserInputStandardAsObject(userContent, conditionText, fieldPositionObject, errors)
  }

  private injectUserInputStandardAsObject(userInput, conditionText, fieldPositionObject, userErrors) {
    const fieldNames = Object.keys(fieldPositionObject)
    const splitConditionText = conditionText.split(betweenBrackets).filter((text) => text)
    const reducer = this.injectVariablesIntoViewObject(fieldNames, fieldPositionObject, userInput, userErrors)
    return splitConditionText.reduce(reducer, [])
  }

  private injectVariablesIntoViewObject(fieldNames, fieldPositionObject, userInput, userErrors) {
    return (conditionArray, textSegment, index) => {
      const fieldNameForPlaceholder = fieldNames.find((field) => String(fieldPositionObject[field]) === String(index))
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

  private injectMultiFieldsAsObject(userInput, conditionText, userErrors, config) {
    const variableString = (variable, error) => (error ? `[${error}]` : variable)

    const strings = config.fields.map((fieldName) => {
      return variableString(getIn(userInput, [fieldName]), getIn(userErrors, [fieldName]))
    })

    const fieldErrors = config.fields.map((fieldName) => getIn(userErrors, [fieldName])).filter((e) => e)

    const string = interleave(strings, config.joining)

    const variableKey = fieldErrors.length > 0 ? 'error' : 'variable'

    const splitConditionText = conditionText.split(betweenBrackets).filter((text) => text)
    return [{ text: splitConditionText[0] }, { [variableKey]: string }, { text: splitConditionText[1] }]
  }
}

const betweenBrackets = /\[[^\]]*]/g

const orderForView = (requiredOrder) => (a, b) => requiredOrder.indexOf(a) - requiredOrder.indexOf(b)
