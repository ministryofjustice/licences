import type { ProbationTeamsClient } from '../data/probationTeamsClient'
import { userClient as UserClient } from '../data/userClient'

export = class UserAdminService {
  constructor(
    readonly nomisClientBuilder,
    readonly userClient: typeof UserClient,
    readonly probationTeamsClient: ProbationTeamsClient
  ) {}

  async updateRoUser(token: string, originalNomisId: string, { staffIdentifier }: { staffIdentifier: number }) {
    await this.checkExistingDelius(staffIdentifier)
    return this.userClient.updateRoUser(originalNomisId, staffIdentifier)
  }

  async verifyUserDetails(token, nomisUserName) {
    const nomisClient = this.nomisClientBuilder(token)
    return nomisClient.getUserInfo(nomisUserName)
  }

  private checkExistingDelius = async (staffIdentifier: number) => {
    const existing = await this.userClient.getRoUserByStaffIdentifier(staffIdentifier)

    if (existing) {
      throw Error('Delius staff Identifier already exists in RO mappings')
    }
  }

  private checkInvalidNomis = async (token, nomisId) => {
    try {
      const nomisClient = this.nomisClientBuilder(token)
      await nomisClient.getUserInfo(nomisId)
    } catch (error) {
      if (error.status === 404) {
        throw Error('Nomis ID not found in Nomis')
      }

      throw error
    }
  }

  async getFunctionalMailbox(probationAreaCode, lduCode, teamCode) {
    if (!lduCode || !probationAreaCode || !teamCode) return undefined
    return this.probationTeamsClient.getFunctionalMailbox({ probationAreaCode, lduCode, teamCode })
  }

  getRoUsers(page?) {
    return this.userClient.getRoUsers(page)
  }

  getRoUser(nomisId) {
    return this.userClient.getRoUser(nomisId)
  }

  getRoUserByStaffIdentifier(staffIdentifier: number) {
    return this.userClient.getRoUserByStaffIdentifier(staffIdentifier)
  }

  deleteRoUser(nomisId) {
    return this.userClient.deleteRoUser(nomisId)
  }

  findRoUsers(searchTerm) {
    return this.userClient.findRoUsers(searchTerm)
  }

  getRoUserByDeliusUsername(username) {
    return this.userClient.getRoUserByDeliusUsername(username)
  }
}
