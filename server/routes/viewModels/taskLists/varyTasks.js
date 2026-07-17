const versionInfo = require('../../../utils/versionInfo')
const { isEmpty } = require('../../../utils/functionalHelpers')
const { tasklist, namedTask } = require('./tasklistBuilder')

const viewCurrentLicence = require('./tasks/viewCurrentLicence')
const createLicence = require('./tasks/createLicence')


const varyLicenceTask = namedTask('varyLicenceTask')
const varyLicenceInCVLStartTask = namedTask('varyLicenceInCVLStartTask')
const varyLicenceInCVLAlreadyMigratedTask = namedTask('varyLicenceInCVLAlreadyMigratedTask')


const changeTask = (title, href) => () => ({ title, action: { type: 'link', text: 'Change', href } })

const buildVariationTaskList = ({
                                  approvedVersion,
                                  licenceVersionExists,
                                  isNewVersion,
                                  licenceUnstarted,
                                  varyInCVLTasks,
                                  version,
                                  hasBeenMigrated,
                                }) => {
  if (varyInCVLTasks) {
    return tasklist({}, [
      [viewCurrentLicence(approvedVersion), licenceVersionExists && !isNewVersion && !hasBeenMigrated],
      [varyLicenceInCVLStartTask, !hasBeenMigrated],
      [varyLicenceInCVLAlreadyMigratedTask, hasBeenMigrated],
    ])
  }

  return tasklist({}, [
    [viewCurrentLicence(approvedVersion), licenceVersionExists && !isNewVersion],
    [varyLicenceTask, licenceUnstarted],
    [changeTask('Permission for variation and justification of conditions', '/hdc/vary/evidence/'), !licenceUnstarted],
    [changeTask('Curfew address', '/hdc/vary/address/'), !licenceUnstarted],
    [changeTask('Additional conditions', '/hdc/licenceConditions/standard/'), !licenceUnstarted],
    [changeTask('Curfew hours', '/hdc/curfew/curfewHours/'), !licenceUnstarted],
    [changeTask('Reporting instructions', '/hdc/vary/reportingAddress/'), !licenceUnstarted],
    [createLicence.vary(version), !licenceUnstarted && isNewVersion],
  ])
}

module.exports =
  ({ version, versionDetails, approvedVersion, approvedVersionDetails, licence, isEarlyAdopter, isHdcInCvlNationalRoleOutEnabled  }) =>
    ({ stage }) => {
      const licenceUnstarted = stage === 'UNSTARTED'
      const hasBeenMigrated = approvedVersionDetails && approvedVersionDetails.migration_state === 'COMPLETED'
      const hasFailedMigration = approvedVersionDetails && approvedVersionDetails.migration_state === 'FAILED'
      const licenceVersionExists = !isEmpty(approvedVersionDetails)
      const { isNewVersion } = versionInfo({ version, versionDetails, approvedVersionDetails, licence })

      const varyInCVLTasks = hasBeenMigrated || ((isEarlyAdopter || isHdcInCvlNationalRoleOutEnabled) && licenceVersionExists &&
        (!approvedVersionDetails || !hasFailedMigration))

      return buildVariationTaskList({
        approvedVersion,
        licenceVersionExists,
        isNewVersion,
        licenceUnstarted,
        varyInCVLTasks,
        version,
        hasBeenMigrated,
      })
    }
