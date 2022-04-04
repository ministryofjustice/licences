const R = require('ramda')
const moment = require('moment')
const romanise = require('romannumerals')
const { isEmpty, mergeWithRight, selectPathsFrom, isYes } = require('../../../utils/functionalHelpers')
const pdfData = require('../../config/pdfData')
const config = require('../../../config')
const { bassApprovedPremisesRequired, curfewApprovedPremisesRequired } = require('../../licence/curfewAddressState')

const DEFAULT_PLACEHOLDER = 'N/A'

module.exports = { formatPdfData, DEFAULT_PLACEHOLDER, pickCurfewAddress, pickCurfewAddressPath, getConditionText }

function formatPdfData(
  templateName,
  { licence, prisonerInfo, establishment, pssConditions },
  image,
  approvedVersionDetails,
  placeholder = DEFAULT_PLACEHOLDER
) {
  const licencePathSelector = selectPathsFrom(licence)
  const conditions = getConditionsForConfig(licencePathSelector, templateName, pssConditions, 'CONDITIONS')
  const pssconditions = getConditionsForConfig(licencePathSelector, templateName, pssConditions, 'PSSCONDITIONS')
  const photo = image ? image.toString('base64') : null
  const taggingCompany = { telephone: config.pdf.licences.taggingCompanyTelephone }
  const curfewAddress = pickCurfewAddress(licence)

  const allData = {
    licence,
    prisonerInfo,
    curfewAddress,
    establishment,
    conditions,
    pssconditions,
    photo,
    taggingCompany,
    approvedVersionDetails,
  }
  return valueOrPlaceholder(selectPathsFrom(allData), placeholder, templateName)
}

function valueOrPlaceholder(dataSelector, placeholder, templateName) {
  const dateNow = moment().format('DD/MM/YYYY')
  const pdfDataEntries = Object.entries(pdfData[templateName])
  return pdfDataEntries.reduce(
    (summary, [key, spec]) => {
      const value = spec.paths.map(dataSelector).filter(R.identity).join(spec.separator)

      const newObject = value
        ? {
            values: { [key]: value },
          }
        : {
            values: { [key]: spec.noPlaceholder ? '' : placeholder },
            missing: {
              [spec.group]: {
                [spec.required]: {
                  [key]: spec.displayName,
                },
              },
            },
          }

      return mergeWithRight(summary, newObject)
    },
    {
      values: { CREATION_DATE: dateNow },
      missing: {},
    }
  )
}

function pickCurfewAddress(licence) {
  return selectPathsFrom(licence)(pickCurfewAddressPath(licence))
}

function pickCurfewAddressPath(licence) {
  if (curfewApprovedPremisesRequired(licence) && !bassApprovedPremisesRequired(licence)) {
    return ['curfew', 'approvedPremisesAddress']
  }
  if (bassApprovedPremisesRequired(licence)) {
    return ['bassReferral', 'approvedPremisesAddress']
  }

  const bassRequested = isYes(licence, ['bassReferral', 'bassRequest', 'bassRequested'])
  const bassAccepted = isYes(licence, ['bassReferral', 'bassOffer', 'bassAccepted'])

  if (bassRequested && bassAccepted) {
    return ['bassReferral', 'bassOffer']
  }

  return ['proposedAddress', 'curfewAddress']
}

function getConditionsForConfig(licencePathSelector, templateName, pssConditions, configName) {
  const conditionsConfig = pdfData[templateName][configName]
  if (isEmpty(conditionsConfig)) {
    return {}
  }
  const pssConfig = { ...conditionsConfig, filtered: pssConditions }
  return getAdditionalConditionsText(licencePathSelector, pssConfig)
}

function getAdditionalConditionsText(licencePathSelector, conditionsConfig) {
  const standardOnly = licencePathSelector(['licenceConditions', 'standard', 'additionalConditionsRequired']) === 'No'
  const conditions = licencePathSelector(['licenceConditions'])
  // if additionalConditionsRequired === Yes but no conditions selected then licenceConditions not replaced with array
  // TODO fix conditionsService to not overwrite licenceConditions section of licence
  if (standardOnly || isEmpty(conditions) || !Array.isArray(conditions)) {
    return null
  }

  const start = conditionsConfig.startIndex
  const itemDivider = conditionsConfig.divider
  const filter = conditionsConfig.filter ? conditionsConfig.filter(conditionsConfig.filtered) : R.identity

  return conditions
    .filter(filter)
    .map(
      (condition, index) =>
        `${listCounter(start, index)}${getConditionText(condition.content, conditionsConfig.terminator)}`
    )
    .join(itemDivider)
}

function listCounter(start, index) {
  return romanise
    .toRoman(start + index)
    .concat('. ')
    .toLowerCase()
}

const joinIfArray = (value) => (Array.isArray(value) ? value.map((val) => val.trim()).join(', ') : value)

function getConditionText(content, terminator) {
  return content
    .map(({ text, variable }) => text || joinIfArray(variable))
    .join('')
    .replace(/\.+$/, '') // remove trailing period
    .concat(terminator)
    .replace(/<\/li><\/ul>;/g, ';</li></ul>')
}
