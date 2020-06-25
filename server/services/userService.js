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
   * @returns {Promise<string[]>} A sub-set of allowedRoles that have been granted to the holder of the supplied token.
   */
  async function getAllRoles(token) {
    const nomisClient = nomisClientBuilder(token)
    const allRoles = await nomisClient.getUserRoles()

    const roles = allRoles
      .map((role) => role.roleCode.substring(role.roleCode.lastIndexOf('_') + 1))
      .filter((roleCode) => allowedRoles.includes(roleCode))

    // CA and DM roles subsume PRISON role
    if (roles.includes('CA') || roles.includes('DM') || roles.includes('RO')) {
      return roles.filter((role) => role !== 'PRISON')
    }
    return roles
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
