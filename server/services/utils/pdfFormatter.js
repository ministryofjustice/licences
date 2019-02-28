const moment = require('moment')
const romanise = require('romannumerals')
const { getIn, isEmpty, mergeWithRight } = require('../../utils/functionalHelpers')
const pdfData = require('../config/pdfData')
const config = require('../../config')

const DEFAULT_PLACEHOLDER = 'N/A'

module.exports = { formatPdfData, DEFAULT_PLACEHOLDER }

function formatPdfData(
  templateName,
  { licence, prisonerInfo, establishment },
  image,
  approvedVersionDetails,
  placeholder = DEFAULT_PLACEHOLDER
) {
  const conditions = getConditionsForConfig(licence, templateName, 'CONDITIONS')
  const pss = getConditionsForConfig(licence, templateName, 'PSS')
  const photo = image ? image.toString('base64') : null
  const taggingCompany = { telephone: config.pdf.taggingCompanyTelephone }
  const curfewAddress = pickCurfewAddress(licence)

  const allData = {
    licence,
    prisonerInfo,
    curfewAddress,
    establishment,
    conditions,
    pss,
    photo,
    taggingCompany,
    approvedVersionDetails,
  }

  return valueOrPlaceholder(allData, placeholder, templateName)
}

function valueOrPlaceholder(allData, placeholder, templateName) {
  const dateNow = moment().format('DD/MM/YYYY')

  return Object.entries(pdfData[templateName]).reduce(readValuesReducer(allData, placeholder), {
    values: { CREATION_DATE: dateNow },
    missing: {},
  })
}

const readValuesReducer = (allData, placeholder) => (summary, [key, spec]) => {
  const value = readEntry(allData, spec)

  if (value) {
    return mergeWithRight(summary, {
      values: { [key]: value },
    })
  }

  return mergeWithRight(summary, {
    values: { [key]: spec.noPlaceholder ? '' : placeholder },
    missing: {
      [spec.group]: {
        [spec.required]: {
          [key]: spec.displayName,
        },
      },
    },
  })
}

function readEntry(data, spec) {
  return spec.paths
    .map(path => getIn(data, path))
    .filter(x => x)
    .join(spec.separator)
}

function pickCurfewAddress(licence) {
  const bassRequested = getIn(licence, ['bassReferral', 'bassRequest', 'bassRequested'])
  const bassAccepted = getIn(licence, ['bassReferral', 'bassOffer', 'bassAccepted'])

  if (bassRequested === 'Yes' && bassAccepted === 'Yes') {
    return getIn(licence, ['bassReferral', 'bassOffer'])
  }

  return getIn(licence, ['proposedAddress', 'curfewAddress'])
}

function getConditionsForConfig(licence, templateName, configName) {
  const conditionsConfig = pdfData[templateName][configName]
  return isEmpty(conditionsConfig) ? {} : getAdditionalConditionsText(licence, conditionsConfig)
}

function getAdditionalConditionsText(licence, conditionsConfig) {
  const standardOnly = getIn(licence, ['licenceConditions', 'standard', 'additionalConditionsRequired'])
  const conditions = getIn(licence, ['licenceConditions'])

  if (standardOnly === 'No' || isEmpty(conditions)) {
    return
  }

  const start = conditionsConfig.startIndex
  const itemDivider = conditionsConfig.divider
  const filter = conditionsConfig.filter ? conditionsConfig.filter(conditionsConfig.filtered) : condition => condition

  return conditions
    .filter(condition => filter(condition))
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

function getConditionText(content, terminator) {
  return content
    .map(({ text, variable }) => text || variable)
    .join('')
    .replace(/\.+$/, '') // remove trailing period
    .concat(terminator)
}
