import config from '../config'
import { isEmpty, batchRequests } from '../utils/functionalHelpers'
import { buildRestClient, constantTokenSource } from './restClientBuilder'

const timeoutSpec = {
  response: config.probationSearchApi.timeout.response,
  deadline: config.probationSearchApi.timeout.deadline,
}

const { apiUrl } = config.probationSearchApi

const agentOptions = {
  maxSockets: config.probationSearchApi.agent.maxSockets,
  maxFreeSockets: config.probationSearchApi.agent.maxFreeSockets,
  freeSocketTimeout: config.probationSearchApi.agent.freeSocketTimeout,
}

export = (token) => {
  const tokenSource = constantTokenSource(token)

  const oauthRestClient = buildRestClient(tokenSource, apiUrl, 'Probation Search API', {
    agent: agentOptions,
    timeout: timeoutSpec,
  })

  return {
    async getPersonProbationDetails(offenderNumbers: string[], batchSize = 1000) {
      if (isEmpty(offenderNumbers)) {
        return []
      }

      const offenderProbationDetails = await batchRequests(offenderNumbers, batchSize, (batch) => {
        const request = batch
        return oauthRestClient.postResource(`/nomsNumbers`, request)
      })

      return offenderProbationDetails
    },
  }
}
