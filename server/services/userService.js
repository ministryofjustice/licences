/* eslint-disable no-param-reassign */
const allowedRoles = require('../authentication/roles')
const logger = require('../../log')

module.exports = nomisClientBuilder => {
  async function getUserProfile(token, refreshToken, username) {
    const nomisClient = nomisClientBuilder(token)

    const [profile, roles] = await Promise.all([nomisClient.getLoggedInUserInfo(), getAllRoles(token)])

    logger.info(`User profile success - username: ${username}`)

    const activeCaseLoads = profile.activeCaseLoadId ? await nomisClient.getUserCaseLoads() : []
    const activeCaseLoad = activeCaseLoads.find(caseLoad => caseLoad.caseLoadId === profile.activeCaseLoadId)

    return {
      ...profile,
      username,
      role: roles[0],
      activeCaseLoad,
    }
  }

  async function getAllRoles(token) {
    const nomisClient = nomisClientBuilder(token)
    const allRoles = await nomisClient.getUserRoles()

    return allRoles
      .filter(role => {
        const roleCode = role.roleCode.substring(role.roleCode.lastIndexOf('_') + 1)
        return allowedRoles.includes(roleCode)
      })
      .map(role => role.roleCode.substring(role.roleCode.lastIndexOf('_') + 1))
  }

  async function setRole(newRole, user) {
    if (!allowedRoles.includes(newRole)) {
      return user
    }

    user.role = newRole
    return user
  }

  function getAllCaseLoads(token) {
    const nomisClient = nomisClientBuilder(token)
    return nomisClient.getUserCaseLoads()
  }

  async function setActiveCaseLoad(id, user, token) {
    // set active caseload
    const nomisClient = nomisClientBuilder(token)
    await nomisClient.putActiveCaseLoad(id)

    // find active caseload
    const [userDetails, caseLoads] = await Promise.all([
      nomisClient.getLoggedInUserInfo(),
      nomisClient.getUserCaseLoads(),
    ])

    user.activeCaseLoad = caseLoads.find(caseLoad => caseLoad.caseLoadId === userDetails.activeCaseLoadId)
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
