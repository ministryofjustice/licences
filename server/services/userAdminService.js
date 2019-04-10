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

  return {
    verifyUserDetails,
    addRoUser,
    updateRoUser,
    getRoUsers: userClient.getRoUsers,
    getRoUser: userClient.getRoUser,
    getRoUserByDeliusId: userClient.getRoUserByDeliusId,
    deleteRoUser: userClient.deleteRoUser,
    findRoUsers: userClient.findRoUsers,
  }
}
