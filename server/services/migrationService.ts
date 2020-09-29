import { DeliusClient } from '../data/deliusClient'
import UserAdminService from './userAdminService'
import logger from '../../log'
import config from '../config'

export const enum Flag {
  // Delius staff record not linked to a user
  UNLINKED_ACCOUNT = 'UNLINKED_ACCOUNT',
  // Email address mismatch in delius and auth
  EMAIL_MISMATCH = 'EMAIL_MISMATCH',
  // The user does not have the same usernames in both delius and auth
  USERNAME_MISMATCH = 'USERNAME_MISMATCH',
  DISABLED_IN_DELIUS = 'DISABLED_IN_DELIUS',
  DISABLED_IN_AUTH = 'DISABLED_IN_AUTH',
  // Contain more roles than just RO/global search.
  MULTIPLE_NOMIS_ROLES = 'MULTIPLE_NOMIS_ROLES',
  REQUIRES_RO_ROLE = 'REQUIRES_RO_ROLE',
  MISSING_AUTH_USER = 'MISSING_AUTH_USER',
  MISSING_DELIUS_USER = 'MISSING_DELIUS_USER',
  AUTH_CANNOT_LOAD = 'AUTH_CANNOT_LOAD',
  REQUIRES_VARY_ROLE = 'REQUIRES_VARY_ROLE',
}

export default class MigrationService {
  constructor(
    private readonly deliusClient: DeliusClient,
    private readonly userAdminService: UserAdminService,
    private readonly nomisClientBuilder
  ) {}

  async getAll(token: string, page) {
    const users = await this.userAdminService.getRoUsers(page)
    const result = []

    // eslint-disable-next-line no-restricted-syntax
    for (const user of users) {
      // we don't want to batter the source systems so running in a single thread
      // eslint-disable-next-line no-await-in-loop
      result.push(await this.enrich(token, user))
    }
    return result
  }

  async getStaffDetails(token: string, nomisUsername: string) {
    const licenceUser = await this.userAdminService.getRoUser(nomisUsername)
    return this.enrich(token, licenceUser)
  }

  async enrich(token: string, licenceUser: any) {
    const { nomisId: nomisUsername, staffIdentifier } = licenceUser
    const deliusStaffDetails = await this.deliusClient.getStaffDetailsByStaffIdentifier(staffIdentifier)
    const isLinked = Boolean(deliusStaffDetails && deliusStaffDetails.username)

    const deliusUser = isLinked && (await this.getUserFromDelius(deliusStaffDetails.username))

    let authUser
    let failedToLoadAuth = false

    try {
      authUser = await this.getStaffDetailsFromAuth(token, nomisUsername)
    } catch (error) {
      failedToLoadAuth = true
    }

    const flags = this.getFlags(deliusUser, authUser, licenceUser, deliusStaffDetails, failedToLoadAuth)
    return { licenceUser, deliusUser: deliusStaffDetails, authUser, flags }
  }

  private getFlags(deliusUser, authUser, licenceUser, deliusStaffDetails, failedToLoadAuth: boolean) {
    const deliusRoles = deliusUser ? deliusUser.roles : []
    const hasRoRole = deliusRoles.map((r) => r.name).includes(config.delius.responsibleOfficerRoleId)

    const hasVaryRole = authUser?.roles.includes('LICENCE_VARY')

    const isLinked = deliusStaffDetails && deliusStaffDetails.username

    const differentEmail = isLinked && licenceUser.email.toLowerCase() !== deliusStaffDetails?.email?.toLowerCase()
    const differentUsernames = isLinked && authUser && authUser.username !== deliusStaffDetails.username

    return [
      ...(!deliusStaffDetails ? [Flag.MISSING_DELIUS_USER] : []),
      ...(deliusStaffDetails && !deliusStaffDetails.username ? [Flag.UNLINKED_ACCOUNT] : []),
      ...(deliusUser && !hasRoRole ? [Flag.REQUIRES_RO_ROLE] : []),
      ...(deliusUser && !deliusUser.enabled ? [Flag.DISABLED_IN_DELIUS] : []),
      ...(authUser && !authUser.enabled ? [Flag.DISABLED_IN_AUTH] : []),
      ...(!authUser && !failedToLoadAuth ? [Flag.MISSING_AUTH_USER] : []),
      ...(hasVaryRole ? [Flag.REQUIRES_VARY_ROLE] : []),
      ...(differentEmail ? [Flag.EMAIL_MISMATCH] : []),
      ...(differentUsernames ? [Flag.USERNAME_MISMATCH] : []),
      ...(failedToLoadAuth ? [Flag.AUTH_CANNOT_LOAD] : []),
    ]
  }

  public async addRoRole(nomisUsername) {
    const roUser = await this.userAdminService.getRoUser(nomisUsername)
    const deliusRo = await this.getStaffByIdentifier(roUser.staffIdentifier)
    await this.deliusClient.addResponsibleOfficerRole(deliusRo.username)
  }

  public async addDeliusRole(deliusUsername: string, role: string) {
    await this.deliusClient.addRole(deliusUsername, role)
  }

  public async getDeliusRoles(deliusUsername): Promise<string[]> {
    const user = await this.getUserFromDelius(deliusUsername)
    if (!user) {
      return null
    }
    const deliusRoles = user.roles || []
    return deliusRoles
      .map((r) => r.name)
      .filter((r) => [config.delius.responsibleOfficerRoleId, config.delius.responsibleOfficerVaryRoleId].includes(r))
  }

  public async disableAuthAccount(token, nomisUsername) {
    const nomisClient = this.nomisClientBuilder(token)
    await nomisClient.disableAuthUser(nomisUsername)
  }

  public async enableAuthAccount(token, nomisUsername) {
    const nomisClient = this.nomisClientBuilder(token)
    await nomisClient.enableAuthUser(nomisUsername)
  }

  private async getStaffByIdentifier(staffIdentifier) {
    try {
      return await this.deliusClient.getStaffDetailsByStaffIdentifier(staffIdentifier)
    } catch (error) {
      logger.warn(`Problem retrieving staff member from delius for identifier: ${staffIdentifier}`, error.stack)
      return null
    }
  }

  private async getUserFromDelius(username) {
    try {
      const result = await this.deliusClient.getUser(username)
      return result
    } catch (error) {
      logger.warn(`Problem retrieving user from delius for username: ${username}`, error.stack)
      return null
    }
  }

  private async getStaffDetailsFromAuth(token, username) {
    const nomisClient = this.nomisClientBuilder(token)
    const user = await nomisClient.getAuthUser(username)
    if (!user) {
      return null
    }
    const roles = await nomisClient.getAuthUserRoles(username)
    return { ...user, roles: (roles || []).map((r) => r.roleCode) }
  }
}
