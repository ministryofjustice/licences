const logger = require('../../log')
const { isEmpty, merge } = require('../utils/functionalHelpers')

module.exports = function createUserService(nomisClientBuilder, userClient, signInService, prisonerService) {
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

  async function getIncompleteRoUsers(userName) {
    const systemTokens = await signInService.getClientCredentialsTokens(userName)

    const bookingIds = await userClient.getCasesRequiringRo()
    if (isEmpty(bookingIds)) {
      return []
    }

    const all = await findRequiredRos(systemTokens.token, bookingIds)
    if (isEmpty(all)) {
      return []
    }

    const required = uniqueByAssignedId(all)
    const incomplete = await findIncomplete(required)
    if (isEmpty(incomplete)) {
      return []
    }

    return addOffenderNomis(systemTokens.token, incomplete)
  }

  async function findRequiredRos(token, bookingIds) {
    const required = await Promise.all(
      bookingIds.map(async bookingId => {
        try {
          const { com } = await prisonerService.getCom(bookingId, token)
          if (com) {
            return { assignedId: com.deliusId, assignedName: com.name, bookingId }
          }
        } catch (error) {
          logger.warn(`Error in getCom for incomplete users, booking id ${bookingId}`, error.stack)
        }
      })
    )

    return required.filter(e => e)
  }

  function uniqueByAssignedId(assignments) {
    return Object.values(
      assignments.reduce((unique, assignment) => {
        if (assignment.assignedId && !unique[assignment.assignedId]) {
          return merge(unique, { [assignment.assignedId]: assignment })
        }
        return unique
      }, {})
    )
  }

  async function findIncomplete(assignments) {
    const incomplete = await Promise.all(
      assignments.map(async assignment => {
        try {
          const staff = await userClient.getRoUserByDeliusId(assignment.assignedId)
          if (staff && !staff.onboarded) {
            return merge(merge(assignment, staff), { mapped: true })
          }
          if (!staff) {
            return merge(assignment, { mapped: false })
          }
        } catch (error) {
          logger.warn(
            `Error in getRoUserByDeliusId for incomplete users, assigned Id ${assignment.assignedId}`,
            error.stack
          )
        }
      })
    )

    return incomplete.filter(e => e)
  }

  async function addOffenderNomis(token, assignments) {
    const nomisClient = nomisClientBuilder(token)

    return Promise.all(
      assignments.map(async assignment => {
        try {
          const booking = await nomisClient.getBooking(assignment.bookingId)
          return merge(assignment, { offenderNo: booking.offenderNo })
        } catch (error) {
          logger.warn(`Error in getBooking for incomplete users, bookingId: ${assignment.bookingId}`, error.stack)
        }
      })
    )
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
