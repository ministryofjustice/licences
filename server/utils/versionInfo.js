const { isEmpty, getIn } = require('./functionalHelpers')
const { templates } = require('../routes/config/pdf')

module.exports = ({ version, versionDetails, approvedVersionDetails }, templateName = null) => {
  const isNewTemplate = !isEmpty(approvedVersionDetails) && templateName !== approvedVersionDetails.template
  const isNewVersion =
    isEmpty(approvedVersionDetails) ||
    versionDetails.version > approvedVersionDetails.version ||
    versionDetails.vary_version > approvedVersionDetails.vary_version

  return {
    currentVersion: version,
    lastVersion: !isEmpty(approvedVersionDetails) ? approvedVersionDetails : null,
    isNewVersion,
    templateLabel: getTemplateLabel(templateName),
    lastTemplateLabel: !isEmpty(approvedVersionDetails) && getTemplateLabel(approvedVersionDetails.template),
    isNewTemplate,
  }
}

function getTemplateLabel(templateName) {
  const templateConfig = templates.find(template => template.id === templateName) || {}
  return getIn(templateConfig, ['label'])
}
