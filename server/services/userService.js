/* eslint-disable no-param-reassign */
const allowedRoles = require('../authentication/roles')
const logger = require('../../log')
const { getIn } = require('../utils/functionalHelpers')

module.exports = (nomisClientBuilder) => {
  async function getUserProfile(token, refreshToken, username) {
    const nomisClient = nomisClientBuilder(token)

    const [profile, roles] = await Promise.all([nomisClient.getLoggedInUserInfo(), getAllRoles(token)])

    logger.info(`User profile success - username: ${username}`)

    const activeCaseLoads = await nomisClient.getUserCaseLoads()
    const activeCaseLoad = activeCaseLoads.find((cl) => cl.currentlyActive)
    const activeCaseLoadId = getIn(activeCaseLoad, ['caseLoadId'])

    return {
      ...profile,
      username,
      role: roles[0],
      activeCaseLoad,
      activeCaseLoadId,
    }
  }

  /**
   * Fetch the user's roles from somewhere else, where the user is identified by a JWT token.
   * (Why fetch the roles? Aren't they already present in 'token'? Perhaps this app doesn't bother to validate the token
   * and so the token can't be trusted... )
   * Extract the role codes, extract the suffix from the code (the part after the last '_' character)
   * then remove any values that aren't in 'allowedRoles'.
   *
   * @param token A JWT token that we are pretending doesn't already contain the roles we're about to fetch.
   * @returns {Promise<string[]>} A sub-set of allowedRoles that have been granted to the holder of the supplied token.
   */
  async function getAllRoles(token) {
    const nomisClient = nomisClientBuilder(token)
    const allRoles = await nomisClient.getUserRoles()

    return allRoles
      .map((role) => role.roleCode.substring(role.roleCode.lastIndexOf('_') + 1))
      .filter((roleCode) => allowedRoles.includes(roleCode))
  }

  async function setRole(newRole, user) {
    if (!allowedRoles.includes(newRole)) {
      return user
    }

    user.role = newRole
    return user
  }

  function getAllCaseLoads(user, token) {
    // only call elite2 if we have a nomis user
    if (user.authSource !== 'nomis') return []

    const nomisClient = nomisClientBuilder(token)
    return nomisClient.getUserCaseLoads()
  }

  async function setActiveCaseLoad(id, user, token) {
    // set active caseload
    const nomisClient = nomisClientBuilder(token)
    await nomisClient.putActiveCaseLoad(id)

    // find active caseload
    const caseLoads = await nomisClient.getUserCaseLoads()

    user.activeCaseLoad = caseLoads.find((cl) => cl.currentlyActive)
    user.activeCaseLoadId = getIn(user.activeCaseLoad, ['caseLoadId'])
    return user
  }

  return {
    getUserProfile,
    getAllRoles,
    setRole,
    getAllCaseLoads,
    setActiveCaseLoad,
  }
}
