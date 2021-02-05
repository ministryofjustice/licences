import moment from 'moment'
import config from '../config'
import { isEmpty, merge, pipe, splitEvery } from '../utils/functionalHelpers'
import { Profile, Role } from '../../types/elite2api'
import { buildRestClient, constantTokenSource } from './restClientBuilder'

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

const batchRequests = async (args, batchSize, call) => {
  const batches = splitEvery(batchSize, args)
  const requests = batches.map((batch, i) => call(batch).then((result) => [i, result]))
  const results = await Promise.all(requests)

  return results
    .sort(([i, _1], [j, _2]) => i - j)
    .map(([_, result]) => result)
    .reduce((acc, val) => acc.concat(val), [])
}

function findFirstValid(datesList) {
  return datesList.find((date) => date && date !== invalidDate) || null
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

export = (token) => {
  const tokenSource = constantTokenSource(token)

  const nomisRestClient = buildRestClient(tokenSource, apiUrl, 'Prison API', {
    agent: agentOptions,
    timeout: timeoutSpec,
  })
  const oauthRestClient = buildRestClient(tokenSource, authUrl, 'OAuth API', {
    agent: agentOptions,
    timeout: timeoutSpec,
  })

  const addReleaseDatesToPrisoner = pipe(
    addReleaseDate,
    addEffectiveConditionalReleaseDate,
    addEffectiveAutomaticReleaseDate
  )

  return {
    getBooking(bookingId) {
      return nomisRestClient.getResource(`/api/bookings/${bookingId}`)
    },

    getBookingByOffenderNumber(offenderNo) {
      return nomisRestClient.getResource(`/api/bookings/offenderNo/${offenderNo}`)
    },

    getAliases(bookingId) {
      return nomisRestClient.getResource(`/api/bookings/${bookingId}/aliases`)
    },

    getIdentifiers(bookingId) {
      return nomisRestClient.getResource(`/api/bookings/${bookingId}/identifiers`)
    },

    getMainOffence(bookingId) {
      return nomisRestClient.getResource(`/api/bookings/${bookingId}/mainOffence`)
    },

    getImageInfo(imageId) {
      return nomisRestClient.getResource(`/api/images/${imageId}`)
    },

    async getHdcEligiblePrisoners() {
      const headers = { 'Page-Limit': 10000 }

      const prisoners = await nomisRestClient.getResource(
        `/api/offender-sentences/home-detention-curfew-candidates`,
        headers
      )
      return prisoners.map(addReleaseDatesToPrisoner)
    },

    async getOffenderSentencesByNomisId(nomisIds, batchSize = 50) {
      if (isEmpty(nomisIds)) {
        return []
      }

      const prisoners = await batchRequests(nomisIds, batchSize, (batch) => {
        const query = { offenderNo: batch }
        return nomisRestClient.getResource(`/api/offender-sentences`, { 'Page-Limit': batchSize }, query)
      })

      return prisoners.map(addReleaseDatesToPrisoner)
    },

    async getOffenderSentencesByBookingId(bookingIds, addReleaseDates = true) {
      const headers = { 'Page-Limit': 10000 }
      const body = [].concat(bookingIds)

      const prisoners = await nomisRestClient.postResource(`/api/offender-sentences/bookings`, body, headers)

      if (!addReleaseDates) {
        return prisoners
      }

      return prisoners.map(addReleaseDatesToPrisoner)
    },

    async getImageData(id) {
      const image = await nomisRestClient.getResource(`/api/images/${id}/data`)
      if (image) {
        return image
      }
      throw Error('Not Found')
    },

    getEstablishment(agencyLocationId) {
      return nomisRestClient.getResource(`/api/agencies/prison/${agencyLocationId}`)
    },

    getUserInfo(userName) {
      return oauthRestClient.getResource(`/api/user/${userName}`)
    },

    getAuthUser(username) {
      return oauthRestClient.getResource(`/api/authuser/${username}`)
    },

    getAuthUserRoles(username) {
      return oauthRestClient.getResource(`/api/authuser/${username}/roles`)
    },

    disableAuthUser(username) {
      return oauthRestClient.putResource(`/api/authuser/${username}/disable`, {})
    },

    enableAuthUser(username) {
      return oauthRestClient.putResource(`/api/authuser/${username}/enable`, {})
    },

    getLoggedInUserInfo(): Promise<Profile> {
      return oauthRestClient.getResource(`/api/user/me`)
    },

    getUserRoles(): Promise<Role[]> {
      return oauthRestClient.getResource(`/api/user/me/roles`)
    },

    getUserCaseLoads() {
      return nomisRestClient.getResource(`/api/users/me/caseLoads`)
    },

    putActiveCaseLoad(caseLoadId) {
      return nomisRestClient.putResource(`/api/users/me/activeCaseLoad`, { caseLoadId })
    },

    async putApprovalStatus(bookingId, { approvalStatus, refusedReason }) {
      return nomisRestClient.putResource(
        `/api/offender-sentences/booking/${bookingId}/home-detention-curfews/latest/approval-status`,
        { approvalStatus, refusedReason, date: moment().format('YYYY-MM-DD') }
      )
    },

    async putChecksPassed({ bookingId, passed }) {
      if (typeof passed !== 'boolean') {
        throw new Error(`Missing required input parameter 'passed'`)
      }

      const path = `/api/offender-sentences/booking/${bookingId}/home-detention-curfews/latest/checks-passed`
      const body = { passed, date: moment().format('YYYY-MM-DD') }

      return nomisRestClient.putResource(path, body)
    },

    getRecentMovements(offenderNo) {
      const path = `/api/movements/offenders`
      const headers = { 'Page-Limit': 10000 }
      return nomisRestClient.postResource(path, [offenderNo], headers)
    },
  }
}
