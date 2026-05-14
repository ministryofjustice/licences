import config from '../config'
import { isEmpty, batchRequests } from '../utils/functionalHelpers'
import { buildRestClient, constantTokenSource } from './restClientBuilder'

const timeoutSpec = {
  response: config.apis.probationSearchApi.timeout.response,
  deadline: config.apis.probationSearchApi.timeout.deadline,
}

const { url } = config.apis.probationSearchApi

const agentOptions = {
  maxSockets: config.apis.probationSearchApi.agent.maxSockets,
  maxFreeSockets: config.apis.probationSearchApi.agent.maxFreeSockets,
  freeSocketTimeout: config.apis.probationSearchApi.agent.freeSocketTimeout,
}

export = (token) => {
  const tokenSource = constantTokenSource(token)

  const oauthRestClient = buildRestClient(tokenSource, url, 'Probation Search API', {
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
