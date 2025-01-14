import config from '../config'
import { isEmpty, splitEvery } from '../utils/functionalHelpers'
import type { OffenderDetail } from 'probationSearchApi'
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

  const oauthRestClient = buildRestClient(tokenSource, apiUrl, 'Probation Search API', {
    agent: agentOptions,
    timeout: timeoutSpec,
  })

  return {
    async getPersonProbationDetails(offenderNumbers: string[], batchSize = 1000): Promise<OffenderDetail[]> {
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
