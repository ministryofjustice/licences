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
  response: config.apis.manageUsersApi.timeout.response,
  deadline: config.apis.manageUsersApi.timeout.deadline,
}

const { url } = config.apis.manageUsersApi

const agentOptions = {
  maxSockets: config.apis.manageUsersApi.agent.maxSockets,
  maxFreeSockets: config.apis.manageUsersApi.agent.maxFreeSockets,
  freeSocketTimeout: config.apis.manageUsersApi.agent.freeSocketTimeout,
}

export = (token) => {
  const tokenSource = constantTokenSource(token)

  const manageUsersRestClient = buildRestClient(tokenSource, url, 'Manage users API', {
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
