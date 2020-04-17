const R = require('ramda')
const moment = require('moment')
const romanise = require('romannumerals')
const { isEmpty, mergeWithRight, selectPathsFrom } = require('../../../utils/functionalHelpers')
const pdfData = require('../../config/pdfData')
const config = require('../../../config')

const DEFAULT_PLACEHOLDER = 'N/A'

module.exports = { formatPdfData, DEFAULT_PLACEHOLDER, pickCurfewAddress, getConditionText }

function formatPdfData(
  templateName,
  { licence, prisonerInfo, establishment },
  image,
  approvedVersionDetails,
  placeholder = DEFAULT_PLACEHOLDER
) {
  const licencePathSelector = selectPathsFrom(licence)
  const conditions = getConditionsForConfig(licencePathSelector, templateName, 'CONDITIONS')
  const pssconditions = getConditionsForConfig(licencePathSelector, templateName, 'PSSCONDITIONS')
  const photo = image ? image.toString('base64') : null
  const taggingCompany = { telephone: config.pdf.licences.taggingCompanyTelephone }
  const curfewAddress = pickCurfewAddress(licencePathSelector)

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

function pickCurfewAddress(licencePathSelector) {
  const approvedPremisesRequired =
    licencePathSelector(['curfew', 'approvedPremises', 'required']) ||
    licencePathSelector(['bassReferral', 'bassAreaCheck', 'approvedPremisesRequiredYesNo'])

  if (approvedPremisesRequired === 'Yes') {
    return (
      licencePathSelector(['curfew', 'approvedPremisesAddress']) ||
      licencePathSelector(['bassReferral', 'approvedPremisesAddress'])
    )
  }

  const bassRequested = licencePathSelector(['bassReferral', 'bassRequest', 'bassRequested'])
  const bassAccepted = licencePathSelector(['bassReferral', 'bassOffer', 'bassAccepted'])

  if (bassRequested === 'Yes' && bassAccepted === 'Yes') {
    return licencePathSelector(['bassReferral', 'bassOffer'])
  }

  return licencePathSelector(['proposedAddress', 'curfewAddress'])
}

function getConditionsForConfig(licencePathSelector, templateName, configName) {
  const conditionsConfig = pdfData[templateName][configName]
  return isEmpty(conditionsConfig) ? {} : getAdditionalConditionsText(licencePathSelector, conditionsConfig)
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
