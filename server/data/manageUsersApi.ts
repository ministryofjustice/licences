import config from '../config'
import { buildRestClient, constantTokenSource } from './restClientBuilder'

type PrisonUserDetails = {
  name: string
  activeCaseLoadId: string
}

type Role = {
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

export = (token) => {
  const tokenSource = constantTokenSource(token)

  const manageUsersRestClient = buildRestClient(tokenSource, apiUrl, 'Manage users API', {
    agent: agentOptions,
    timeout: timeoutSpec,
  })

  return {
    async getLoggedInUserInfo(): Promise<PrisonUserDetails> {
      return manageUsersRestClient.getResource(`/users/me`)
    },

    async getUserRoles(): Promise<Role[]> {
      return manageUsersRestClient.getResource(`/users/me/roles`)
    },
  }
}
