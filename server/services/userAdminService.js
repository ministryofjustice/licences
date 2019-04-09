const logger = require('../../log')
const { isEmpty } = require('../utils/functionalHelpers')

module.exports = function createUserService(nomisClientBuilder, userClient) {
  async function updateRoUser(
    token,
    originalNomisId,
    {
      nomisId,
      originalDeliusId,
      deliusId,
      first,
      last,
      organisation,
      jobRole,
      email,
      orgEmail,
      telephone,
      onboarded,
      verify,
    }
  ) {
    const idChecks = []

    if (nomisId !== originalNomisId) {
      idChecks.push(checkExistingNomis(nomisId))

      if (verify === 'Yes') {
        idChecks.push(checkInvalidNomis(token, nomisId))
      }
    }

    if (deliusId !== originalDeliusId) {
      idChecks.push(checkExistingDelius(deliusId))
    }

    await Promise.all(idChecks)

    return userClient.updateRoUser(
      originalNomisId,
      nomisId,
      deliusId,
      first,
      last,
      organisation,
      jobRole,
      email,
      orgEmail,
      telephone,
      onboarded
    )
  }

  async function verifyUserDetails(token, nomisUserName) {
    const nomisClient = nomisClientBuilder(token)
    return nomisClient.getUserInfo(nomisUserName)
  }

  async function addRoUser(
    token,
    { nomisId, deliusId, first, last, organisation, jobRole, email, orgEmail, telephone, onboarded, verify }
  ) {
    const idChecks = [checkExistingNomis(nomisId), checkExistingDelius(deliusId)]

    if (verify === 'Yes') {
      idChecks.push(checkInvalidNomis(token, nomisId))
    }

    await Promise.all(idChecks)

    return userClient.addRoUser(
      nomisId,
      deliusId,
      first,
      last,
      organisation,
      jobRole,
      email,
      orgEmail,
      telephone,
      onboarded
    )
  }

  async function checkExistingNomis(nomisId) {
    const existing = await userClient.getRoUser(nomisId)

    if (existing) {
      throw Error('Nomis ID already exists in RO mappings')
    }
  }

  async function checkExistingDelius(deliusId) {
    const existing = await userClient.getRoUserByDeliusId(deliusId)

    if (existing) {
      throw Error('Delius staff ID already exists in RO mappings')
    }
  }

  async function checkInvalidNomis(token, nomisId) {
    try {
      const nomisClient = nomisClientBuilder(token)
      await nomisClient.getUserInfo(nomisId)
    } catch (error) {
      if (error.status === 404) {
        throw Error('Nomis ID not found in Nomis')
      }

      throw error
    }
  }

  async function getIncompleteRoUsers(token) {
    const incomplete = await userClient.getIncompleteRoUsers()
    if (isEmpty(incomplete)) {
      return []
    }

    const bookingIds = incomplete.map(u => u.bookingId)
    const offenders = await getOffenderNomis(token, bookingIds)

    return addMappingDetails(incomplete, offenders)
  }

  async function getOffenderNomis(token, bookingIds) {
    try {
      const nomisClient = nomisClientBuilder(token)
      const offenders = await nomisClient.getOffenderSentencesByBookingId(bookingIds, false)

      if (isEmpty(offenders)) {
        return null
      }

      return new Map(offenders.map(o => [o.bookingId.toString(), o.offenderNo]))
    } catch (error) {
      logger.warn('Error getting offender nomis numbers for incomplete ROs', error.stack)
      return []
    }
  }

  function addMappingDetails(incomplete, offenderIds) {
    return incomplete.map(u => ({
      ...u,
      offenderNomis: offenderIds ? offenderIds.get(u.bookingId.toString()) : undefined,
      mapping: getMappingDetails(u),
    }))
  }

  function getMappingDetails(incompleteUser) {
    const [first, ...last] = incompleteUser.sentName ? incompleteUser.sentName.split(' ') : []
    return {
      deliusId: incompleteUser.sentStaffCode,
      first,
      last: !isEmpty(last) ? last.join(' ') : undefined,
    }
  }

  return {
    verifyUserDetails,
    addRoUser,
    updateRoUser,
    getRoUsers: userClient.getRoUsers,
    getIncompleteRoUsers,
    getRoUser: userClient.getRoUser,
    getRoUserByDeliusId: userClient.getRoUserByDeliusId,
    deleteRoUser: userClient.deleteRoUser,
    findRoUsers: userClient.findRoUsers,
  }
}
