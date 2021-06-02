const versionInfo = require('../../../utils/versionInfo')
const { isEmpty } = require('../../../utils/functionalHelpers')
const { tasklist, namedTask } = require('./tasklistBuilder')

const viewCurrentLicence = require('./tasks/viewCurrentLicence')
const createLicence = require('./tasks/createLicence')

const varyLicenceTask = namedTask('varyLicenceTask')
const changeTask = (title, href) => () => ({ title, action: { type: 'link', text: 'Change', href } })

module.exports =
  ({ version, versionDetails, approvedVersion, approvedVersionDetails, licence }) =>
  ({ stage }) => {
    const licenceUnstarted = stage === 'UNSTARTED'
    const licenceVersionExists = !isEmpty(approvedVersionDetails)
    const { isNewVersion } = versionInfo({ version, versionDetails, approvedVersionDetails, licence })

    return tasklist({}, [
      [viewCurrentLicence(approvedVersion), licenceVersionExists && !isNewVersion],
      [varyLicenceTask, licenceUnstarted],
      [
        changeTask('Permission for variation and justification of conditions', '/hdc/vary/evidence/'),
        !licenceUnstarted,
      ],
      [changeTask('Curfew address', '/hdc/vary/address/'), !licenceUnstarted],
      [changeTask('Additional conditions', '/hdc/licenceConditions/standard/'), !licenceUnstarted],
      [changeTask('Curfew hours', '/hdc/curfew/curfewHours/'), !licenceUnstarted],
      [changeTask('Reporting instructions', '/hdc/vary/reportingAddress/'), !licenceUnstarted],
      [createLicence.vary(version), !licenceUnstarted && isNewVersion],
    ])
  }
