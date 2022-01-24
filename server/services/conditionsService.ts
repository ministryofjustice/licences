import { formatConditionsInput, getConditionText, formatConditionsText } from './utils/conditionsFormatter'
import { isEmpty } from '../utils/functionalHelpers'
import {
  getAdditionalConditionsConfig,
  getAbuseAndBehaviours,
  standardConditions,
  CURRENT_CONDITION_VERSION,
} from './config/conditionsConfig'
import { AdditionalConditions, Licence } from '../data/licenceTypes'
import { LicenceRecord } from './licenceService'
import { ConditionMetadata, ConditionVersion } from '../data/licenceClientTypes'
import { LicenceWithConditionsBuilder } from './licenceWithConditionsBuilder'

export class ConditionsServiceFactory {
  getVersion(licence: LicenceRecord): ConditionVersion {
    return licence.versionDetails?.additional_conditions_version || CURRENT_CONDITION_VERSION
  }

  forVersion(version: ConditionVersion) {
    return new ConditionsService(version)
  }

  forLicence(licence: LicenceRecord) {
    const version = licence.versionDetails?.additional_conditions_version || CURRENT_CONDITION_VERSION
    return this.forVersion(version)
  }

  getNewVersion(licence: LicenceRecord): ConditionVersion {
    const version = licence.versionDetails?.additional_conditions_version
    return version == null ? CURRENT_CONDITION_VERSION : null
  }
}

export class ConditionsService {
  private readonly builder: LicenceWithConditionsBuilder

  constructor(readonly version: ConditionVersion) {
    this.builder = new LicenceWithConditionsBuilder(version)
  }

  // condition routes / review routes / pdf generation
  populateLicenceWithConditions(licence: Licence, errors = {}, approvedOnly = false) {
    return this.builder.populateLicenceWithConditions(licence, errors, approvedOnly)
  }

  // form generation
  getFullTextForApprovedConditions(licence: Licence) {
    const standardConditionsText = standardConditions.map((it) => it.text.replace(/\.+$/, ''))

    // could be undefined, 'No' or 'Yes'
    const standardOnly = licence?.licenceConditions?.standard?.additionalConditionsRequired !== 'Yes'

    if (standardOnly) {
      return { standardConditions: standardConditionsText, additionalConditions: [] }
    }

    const conditions = this.builder.populateLicenceWithApprovedConditions(licence).licenceConditions

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

  getStandardConditions() {
    return standardConditions
  }

  getAbuseAndBehaviours(conditions): string[] {
    const result = getAbuseAndBehaviours(this.version, conditions)
    return typeof result === 'string' ? [result] : result
  }

  getAdditionalConditions(licence: Licence = null) {
    const licenceAdditionalConditions = licence?.licenceConditions?.additional
    const additionalConditions = getAdditionalConditionsConfig(this.version)
    if (licenceAdditionalConditions) {
      return additionalConditions
        .map(populateFromSavedLicence(licenceAdditionalConditions))
        .reduce(splitIntoGroupedObject, {})
    }

    return additionalConditions.reduce(splitIntoGroupedObject, {})
  }

  formatConditionInputs(requestBody) {
    const selectedConditionsConfig = getAdditionalConditionsConfig(this.version).filter((condition) =>
      requestBody.additionalConditions.includes(condition.id)
    )

    return formatConditionsInput(requestBody, selectedConditionsConfig)
  }

  createConditionsObjectForLicence(additional, bespoke) {
    if (isEmpty(additional)) {
      return { additional: {}, bespoke }
    }

    const conditionIds = additional.additionalConditions
    const selectedConditionsConfig = getAdditionalConditionsConfig(this.version).filter((condition) =>
      conditionIds.includes(condition.id)
    )
    const additionalConditionsObject = this.createAdditionalConditionsObject(selectedConditionsConfig, additional)

    return { additional: { ...additionalConditionsObject }, bespoke }
  }

  private createAdditionalConditionsObject(selectedConditions, formInputs) {
    return selectedConditions.reduce((conditions, condition) => {
      const conditionAttributes = condition.field_position
      const userInputs = conditionAttributes ? this.inputsFor(conditionAttributes, formInputs) : {}

      return {
        ...conditions,
        [condition.id]: {
          ...userInputs,
        },
      }
    }, {})
  }

  getNonStandardConditions(licence) {
    let { licenceConditions = [] } = this.builder.populateLicenceWithConditions(licence)
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

  private inputsFor = (fieldPositions, formInputs) => {
    const conditionAttributes = Object.keys(fieldPositions)

    return conditionAttributes.reduce((conditionDataObject, formItem) => {
      return {
        ...conditionDataObject,
        [formItem]: formInputs[formItem],
      }
    }, {})
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

  return (condition: ConditionMetadata) => {
    const submission = getSubmissionForCondition(condition, inputtedConditions)
    const selected = populatedConditionIds.includes(String(condition.id))

    return { ...condition, selected, user_submission: submission }
  }
}

function getSubmissionForCondition(condition: ConditionMetadata, inputtedConditions: AdditionalConditions) {
  const { id } = condition
  const inputtedCondition = inputtedConditions[id]
  if (isEmpty(inputtedCondition)) {
    return {}
  }

  if (condition.displayForEdit) {
    return condition.displayForEdit(inputtedCondition)
  }

  return inputtedCondition
}
