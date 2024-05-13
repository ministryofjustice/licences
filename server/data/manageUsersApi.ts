import config from '../config'
import { buildRestClient, constantTokenSource } from './restClientBuilder'

export type PrisonUserDetails = {
  name: string
  activeCaseLoadId: string
}

export type Role = {
  roleCode: string
}

const timeoutSpec = {
  response: config.manageUsersApi.timeout.response,
  deadline: config.manageUsersApi.timeout.deadline,
}

const { apiUrl } = config.manageUsersApi

const agentOptions = {
  maxSockets: config.manageUsersApi.agent.maxSockets,
  maxFreeSockets: config.manageUsersApi.agent.maxFreeSockets,
  freeSocketTimeout: config.manageUsersApi.agent.freeSocketTimeout,
}

export default (token) => {
  const tokenSource = constantTokenSource(token)

  const oauthRestClient = buildRestClient(tokenSource, apiUrl, 'Manage users API', {
    agent: agentOptions,
    timeout: timeoutSpec,
  })

  return {
    getLoggedInUserInfo(): Promise<PrisonUserDetails> {
      return oauthRestClient.getResource(`/users/me`)
    },

    getUserRoles(): Promise<Role[]> {
      return oauthRestClient.getResource(`/users/me/roles`)
    },
  }
}
