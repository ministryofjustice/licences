const moment = require('moment')
const superagent = require('superagent')
const logger = require('../../log')
const config = require('../config')
const { merge, pipe, getIn } = require('../utils/functionalHelpers')
const { NoTokenError } = require('../utils/errors')

const timeoutSpec = {
  response: config.nomis.timeout.response,
  deadline: config.nomis.timeout.deadline,
}

const { apiUrl, authUrl } = config.nomis
const invalidDate = 'Invalid date'

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

    getAliases(bookingId) {
      const path = `${apiUrl}/bookings/${bookingId}/aliases`
      return nomisGet({ path })
    },

    getIdentifiers(bookingId) {
      const path = `${apiUrl}/bookings/${bookingId}/identifiers`
      return nomisGet({ path })
    },

    getPersonIdentifiers(personId) {
      const path = `${apiUrl}/persons/${personId}/identifiers`
      return nomisGet({ path })
    },

    getMainOffence(bookingId) {
      const path = `${apiUrl}/bookings/${bookingId}/mainOffence`
      return nomisGet({ path })
    },

    getComRelation(bookingId) {
      const path = `${apiUrl}/bookings/${bookingId}/relationships`
      const query = { relationshipType: 'RO' }
      return nomisGet({ path, query })
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

    async getOffenderSentencesByNomisId(nomisIds) {
      const path = `${apiUrl}/offender-sentences`
      const query = { offenderNo: nomisIds }
      const headers = { 'Page-Limit': 10000 }

      const prisoners = await nomisGet({ path, query, headers })
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

    getROPrisoners(deliusUserName) {
      const path = `${apiUrl}/offender-relationships/externalRef/${deliusUserName}/RO`
      return nomisGet({ path })
    },

    getEstablishment(agencyLocationId) {
      const path = `${apiUrl}/agencies/prison/${agencyLocationId}`
      return nomisGet({ path })
    },

    getUserInfo(userName) {
      const path = `${authUrl}/api/user/${userName}`
      return nomisGet({ path })
    },

    getLoggedInUserInfo() {
      const path = `${authUrl}/api/user/me`
      return nomisGet({ path })
    },

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

    async putChecksPassed(bookingId) {
      const path = `${apiUrl}/offender-sentences/booking/${bookingId}/home-detention-curfews/latest/checks-passed`
      const body = { passed: 'true', date: moment().format('YYYY-MM-DD') }

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
  return async ({ path, query = '', headers = {}, responseType = '' } = {}) => {
    if (!token) {
      throw new NoTokenError()
    }

    try {
      const result = await superagent
        .get(path)
        .query(query)
        .set('Authorization', `Bearer ${token}`)
        .set(headers)
        .responseType(responseType)
        .timeout(timeoutSpec)

      return result.body
    } catch (error) {
      logger.warn('Error calling nomis', path, error.stack)
      throw error
    }
  }
}

function nomisPushBuilder(verb, token) {
  const updateMethod = {
    put,
    post,
  }

  return async ({ path, body = '', headers = {}, responseType = '' } = {}) => {
    if (!token) {
      throw new NoTokenError()
    }

    try {
      const result = await updateMethod[verb](token, path, body, headers, responseType)
      return result.body
    } catch (error) {
      logger.error('Error calling nomis', path, error.stack)
      logger.error(getIn(error, ['response', 'text']))
      throw error
    }
  }
}

async function post(token, path, body, headers, responseType) {
  return superagent
    .post(path)
    .send(body)
    .set('Authorization', `Bearer ${token}`)
    .set(headers)
    .responseType(responseType)
    .timeout(timeoutSpec)
}

async function put(token, path, body, headers, responseType) {
  return superagent
    .put(path)
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
