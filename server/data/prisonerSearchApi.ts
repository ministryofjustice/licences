import config from '../config'
import { isEmpty, splitEvery } from '../utils/functionalHelpers'
import type { Prisoner } from 'prisonerOffenderSearchApi'
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

const batchRequests = async (args, batchSize, call) => {
  const batches = splitEvery(batchSize, args)
  const requests = batches.map((batch, i) => call(batch).then((result) => [i, result]))
  const results = await Promise.all(requests)

  return results
    .sort(([i, _1], [j, _2]) => i - j)
    .map(([_, result]) => result)
    .reduce((acc, val) => acc.concat(val), [])
}

export = (token) => {
  const tokenSource = constantTokenSource(token)

  const oauthRestClient = buildRestClient(tokenSource, apiUrl, 'Prisoner Search API', {
    agent: agentOptions,
    timeout: timeoutSpec,
  })

  return {
    async getPrisoners(bookingIds: number[], batchSize = 1000): Promise<Prisoner[]> {
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
