import config from '../config'
import { isEmpty, batchRequests } from '../utils/functionalHelpers'
import { buildRestClient, constantTokenSource } from './restClientBuilder'

const timeoutSpec = {
  response: config.apis.prisonerSearchApi.timeout.response,
  deadline: config.apis.prisonerSearchApi.timeout.deadline,
}

const { url } = config.apis.prisonerSearchApi

const agentOptions = {
  maxSockets: config.apis.prisonerSearchApi.agent.maxSockets,
  maxFreeSockets: config.apis.prisonerSearchApi.agent.maxFreeSockets,
  freeSocketTimeout: config.apis.prisonerSearchApi.agent.freeSocketTimeout,
}

export = (token) => {
  const tokenSource = constantTokenSource(token)

  const oauthRestClient = buildRestClient(tokenSource, url, 'Prisoner Search API', {
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
