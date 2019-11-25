const R = require('ramda')
const { isEmpty } = require('../utils/functionalHelpers')
const logger = require('../../log.js')

const logIfMissing = (val, message) => {
  if (isEmpty(val)) {
    logger.error(message)
  }
}

module.exports = function createRoContactDetailsService(userAdminService) {
  async function getContactDetails(deliusId) {
    const ro = await userAdminService.getRoUserByDeliusId(deliusId)

    if (ro) {
      const email = R.prop('email', ro)
      const orgEmail = R.prop('orgEmail', ro)
      const organisation = R.prop('organisation', ro)

      logIfMissing(orgEmail, `Missing orgEmail for RO: ${deliusId}`)
      logIfMissing(email, `Missing email for RO: ${deliusId}`)
      logIfMissing(organisation, `Missing organisation for RO: ${deliusId}`)

      return {
        email,
        orgEmail,
        organisation,
      }
    }

    return null
  }

  return {
    getContactDetails,
  }
}
