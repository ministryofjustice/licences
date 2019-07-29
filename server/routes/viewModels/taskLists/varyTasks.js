const versionInfo = require('../../../utils/versionInfo')
const { isEmpty } = require('../../../utils/functionalHelpers')

module.exports = ({ version, versionDetails, approvedVersion, approvedVersionDetails }) => ({ stage }) => {
  const licenceUnstarted = stage === 'UNSTARTED'
  const licenceVersionExists = !isEmpty(approvedVersionDetails)
  const { isNewVersion } = versionInfo({ version, versionDetails, approvedVersionDetails })

  return [
    {
      title: 'View current licence',
      label: `Licence version ${approvedVersion}`,
      action: {
        type: 'btn',
        text: 'View',
        href: `/hdc/pdf/create/${approvedVersionDetails.template}/`,
        newTab: true,
      },
      visible: licenceVersionExists && !isNewVersion,
    },
    {
      task: 'varyLicenceTask',
      visible: licenceUnstarted,
    },
    {
      title: 'Permission for variation',
      action: { type: 'link', text: 'Change', href: '/hdc/vary/evidence/' },
      visible: !licenceUnstarted,
    },
    {
      title: 'Curfew address',
      action: { type: 'link', text: 'Change', href: '/hdc/vary/address/' },
      visible: !licenceUnstarted,
    },
    {
      title: 'Additional conditions',
      action: { type: 'link', text: 'Change', href: '/hdc/licenceConditions/standard/' },
      visible: !licenceUnstarted,
    },
    {
      title: 'Curfew hours',
      action: { type: 'link', text: 'Change', href: '/hdc/curfew/curfewHours/' },
      visible: !licenceUnstarted,
    },
    {
      title: 'Reporting instructions',
      action: { type: 'link', text: 'Change', href: '/hdc/vary/reportingAddress/' },
      visible: !licenceUnstarted,
    },
    {
      title: 'Create licence',
      label: `Ready to create version ${version}`,
      action: { type: 'btn', text: 'Continue', href: '/hdc/pdf/selectLicenceType/' },
      visible: !licenceUnstarted && isNewVersion,
    },
  ].filter(task => task.visible)
}
