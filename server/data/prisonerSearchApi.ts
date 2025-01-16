import config from '../config'
import { isEmpty, batchRequests } from '../utils/functionalHelpers'
import { buildRestClient, constantTokenSource } from './restClientBuilder'

const timeoutSpec = {
  response: config.prisonerSearchApi.timeout.response,
  deadline: config.prisonerSearchApi.timeout.deadline,
}

const { apiUrl } = config.prisonerSearchApi

const agentOptions = {
  maxSockets: config.prisonerSearchApi.agent.maxSockets,
  maxFreeSockets: config.prisonerSearchApi.agent.maxFreeSockets,
  freeSocketTimeout: config.prisonerSearchApi.agent.freeSocketTimeout,
}

export = (token) => {
  const tokenSource = constantTokenSource(token)

  const oauthRestClient = buildRestClient(tokenSource, apiUrl, 'Prisoner Search API', {
    agent: agentOptions,
    timeout: timeoutSpec,
  })

  return {
    async getPrisoners(bookingIds: number[], batchSize = 1000) {
      if (isEmpty(bookingIds)) {
        return []
      }

      const prisoners = await batchRequests(bookingIds, batchSize, (batch) => {
        const request = { bookingIds: batch }
        return oauthRestClient.postResource(`/prisoner-search/booking-ids`, request)
      })

      return prisoners
    },
  }
}
