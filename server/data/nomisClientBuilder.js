/**
 * @typedef {import("../../types/elite2api").Role} Role
 * @typedef {import("../../types/elite2api").Profile} Profile
 *
 */

/** @type {any} */
const Agent = require('agentkeepalive')
const { HttpsAgent } = require('agentkeepalive')
const moment = require('moment')
const superagent = require('superagent')
const logger = require('../../log')
const config = require('../config')
const { merge, pipe, getIn, splitEvery, isEmpty } = require('../utils/functionalHelpers')
const { unauthorisedError } = require('../utils/errors')

const timeoutSpec = {
  response: config.nomis.timeout.response,
  deadline: config.nomis.timeout.deadline,
}

const { apiUrl, authUrl } = config.nomis
const invalidDate = 'Invalid date'

const agentOptions = {
  maxSockets: config.nomis.agent.maxSockets,
  maxFreeSockets: config.nomis.agent.maxFreeSockets,
  freeSocketTimeout: config.nomis.agent.freeSocketTimeout,
}

const keepaliveAgent = apiUrl.startsWith('https') ? new HttpsAgent(agentOptions) : new Agent(agentOptions)

const batchRequests = async (args, batchSize, call) => {
  const batches = splitEvery(batchSize, args)
  const requests = batches.map((batch, i) => call(batch).then(result => [i, result]))
  const results = await Promise.all(requests)

  return results
    .sort(([i, _1], [j, _2]) => i - j)
    .map(([_, result]) => result)
    .reduce((acc, val) => acc.concat(val), [])
}

module.exports = token => {
  const nomisGet = nomisGetBuilder(token)
  const nomisPost = nomisPushBuilder('post', token)
  const nomisPut = nomisPushBuilder('put', token)

  const addReleaseDatesToPrisoner = pipe(
    addReleaseDate,
    addEffectiveConditionalReleaseDate,
    addEffectiveAutomaticReleaseDate
  )

  return {
    getBooking(bookingId) {
      const path = `${apiUrl}/bookings/${bookingId}`
      return nomisGet({ path })
    },

    getBookingByOffenderNumber(offenderNo) {
      const path = `${apiUrl}/bookings/offenderNo/${offenderNo}`
      return nomisGet({ path })
    },

    getAliases(bookingId) {
      const path = `${apiUrl}/bookings/${bookingId}/aliases`
      return nomisGet({ path })
    },

    getIdentifiers(bookingId) {
      const path = `${apiUrl}/bookings/${bookingId}/identifiers`
      return nomisGet({ path })
    },

    getMainOffence(bookingId) {
      const path = `${apiUrl}/bookings/${bookingId}/mainOffence`
      return nomisGet({ path })
    },

    getImageInfo(imageId) {
      const path = `${apiUrl}/images/${imageId}`
      return nomisGet({ path })
    },

    async getHdcEligiblePrisoners() {
      const path = `${apiUrl}/offender-sentences/home-detention-curfew-candidates`
      const headers = { 'Page-Limit': 10000 }

      const prisoners = await nomisGet({ path, headers })
      return prisoners.map(addReleaseDatesToPrisoner)
    },

    async getOffenderSentencesByNomisId(nomisIds, batchSize = 50) {
      const path = `${apiUrl}/offender-sentences`
      if (isEmpty(nomisIds)) {
        return []
      }

      const prisoners = await batchRequests(nomisIds, batchSize, batch => {
        const query = { offenderNo: batch }
        return nomisGet({ path, query, headers: { 'Page-Limit': batchSize } })
      })

      return prisoners.map(addReleaseDatesToPrisoner)
    },

    async getOffenderSentencesByBookingId(bookingIds, addReleaseDates = true) {
      const path = `${apiUrl}/offender-sentences/bookings`
      const headers = { 'Page-Limit': 10000 }
      const body = [].concat(bookingIds)

      const prisoners = await nomisPost({ path, body, headers })

      if (!addReleaseDates) {
        return prisoners
      }

      return prisoners.map(addReleaseDatesToPrisoner)
    },

    getImageData(id) {
      const path = `${apiUrl}/images/${id}/data`
      return nomisGet({ path, responseType: 'blob' })
    },

    getEstablishment(agencyLocationId) {
      const path = `${apiUrl}/agencies/prison/${agencyLocationId}`
      return nomisGet({ path })
    },

    getUserInfo(userName) {
      const path = `${authUrl}/api/user/${userName}`
      return nomisGet({ path })
    },

    /**
     * @returns {Promise<Profile>}
     */
    getLoggedInUserInfo() {
      const path = `${authUrl}/api/user/me`
      return nomisGet({ path })
    },

    /**
     * @returns {Promise<[Role]>}
     */
    getUserRoles() {
      const path = `${authUrl}/api/user/me/roles`
      return nomisGet({ path })
    },

    getUserCaseLoads() {
      const path = `${apiUrl}/users/me/caseLoads`
      return nomisGet({ path })
    },

    async putActiveCaseLoad(caseLoadId) {
      const path = `${apiUrl}/users/me/activeCaseLoad`
      const body = { caseLoadId }

      return nomisPut({ path, body })
    },

    async putApprovalStatus(bookingId, { approvalStatus, refusedReason }) {
      const path = `${apiUrl}/offender-sentences/booking/${bookingId}/home-detention-curfews/latest/approval-status`
      const body = { approvalStatus, refusedReason, date: moment().format('YYYY-MM-DD') }

      return nomisPut({ path, body })
    },

    async putChecksPassed({ bookingId, passed }) {
      if (typeof passed !== 'boolean') {
        throw new Error(`Missing required input parameter 'passed'`)
      }

      const path = `${apiUrl}/offender-sentences/booking/${bookingId}/home-detention-curfews/latest/checks-passed`
      const body = { passed, date: moment().format('YYYY-MM-DD') }

      return nomisPut({ path, body })
    },

    getRecentMovements(offenderNo) {
      const path = `${apiUrl}/movements/offenders`
      const headers = { 'Page-Limit': 10000 }
      return nomisPost({ path, body: [offenderNo], headers })
    },
  }
}

function nomisGetBuilder(token) {
  return async ({ path, query = {}, headers = {}, responseType = '' }) => {
    if (!token) {
      throw unauthorisedError()
    }

    try {
      logger.debug(`GET ${path}`)
      const result = await superagent
        .get(path)
        .agent(keepaliveAgent)
        .query(query)
        .set('Authorization', `Bearer ${token}`)
        .set(headers)
        .retry(2, err => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .responseType(responseType)
        .timeout(timeoutSpec)

      logger.debug(`GET ${path} -> ${result.status}`)
      return result.body
    } catch (error) {
      logger.warn(
        `Error calling nomis, path: '${path}', verb: 'GET', query: '${JSON.stringify(query)}', response: '${getIn(
          error,
          ['response', 'text']
        )}'`,
        error.stack
      )
      throw error
    }
  }
}

function nomisPushBuilder(verb, token) {
  const updateMethod = {
    put,
    post,
  }

  return async ({ path, body, headers = {}, responseType = '' }) => {
    if (!token) {
      throw unauthorisedError()
    }

    try {
      logger.debug(`${verb} ${path}`)
      const result = await updateMethod[verb](token, path, body || '', headers, responseType)
      logger.debug(`${verb} ${path} -> ${result.status}`)
      return result.body
    } catch (error) {
      logger.warn(
        `Error calling nomis, path: '${path}', verb: '${verb}', response: '${getIn(error, ['response', 'text'])}'`,
        error.stack
      )
      throw error
    }
  }
}

async function post(token, path, body, headers, responseType) {
  return superagent
    .post(path)
    .agent(keepaliveAgent)
    .send(body)
    .set('Authorization', `Bearer ${token}`)
    .set(headers)
    .responseType(responseType)
    .timeout(timeoutSpec)
}

async function put(token, path, body, headers, responseType) {
  return superagent
    .put(path)
    .agent(keepaliveAgent)
    .send(body)
    .set('Authorization', `Bearer ${token}`)
    .set(headers)
    .responseType(responseType)
    .timeout(timeoutSpec)
}

function findFirstValid(datesList) {
  return datesList.find(date => date && date !== invalidDate) || null
}

function addEffectiveConditionalReleaseDate(prisoner) {
  const { conditionalReleaseDate, conditionalReleaseOverrideDate } = prisoner.sentenceDetail

  const crd = findFirstValid([conditionalReleaseOverrideDate, conditionalReleaseDate])

  return {
    ...prisoner,
    sentenceDetail: merge(prisoner.sentenceDetail, { effectiveConditionalReleaseDate: crd }),
  }
}

function addEffectiveAutomaticReleaseDate(prisoner) {
  const { automaticReleaseDate, automaticReleaseOverrideDate } = prisoner.sentenceDetail

  const ard = findFirstValid([automaticReleaseOverrideDate, automaticReleaseDate])

  return {
    ...prisoner,
    sentenceDetail: merge(prisoner.sentenceDetail, { effectiveAutomaticReleaseDate: ard }),
  }
}

function addReleaseDate(prisoner) {
  const {
    automaticReleaseDate,
    automaticReleaseOverrideDate,
    conditionalReleaseDate,
    conditionalReleaseOverrideDate,
  } = prisoner.sentenceDetail

  const releaseDate = findFirstValid([
    conditionalReleaseOverrideDate,
    conditionalReleaseDate,
    automaticReleaseOverrideDate,
    automaticReleaseDate,
  ])

  return {
    ...prisoner,
    sentenceDetail: merge(prisoner.sentenceDetail, { releaseDate }),
  }
}
