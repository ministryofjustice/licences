const setCase = require('case')
const logger = require('../../log.js')
const { getIn, isEmpty } = require('../utils/functionalHelpers')

module.exports = function createDeliusRoService(deliusClient, nomisClientBuilder) {
  async function getROPrisoners(staffCode, token) {
    const nomisClient = nomisClientBuilder(token)
    const requiredPrisoners = await deliusClient.getROPrisoners(staffCode)
    if (!isEmpty(requiredPrisoners)) {
      const requiredIDs = requiredPrisoners.map(prisoner => prisoner.nomsNumber)
      return nomisClient.getOffenderSentencesByNomisId(requiredIDs)
    }

    return []
  }

  async function findResponsibleOfficer(bookingId, token) {
    const nomisClient = nomisClientBuilder(token)
    const { offenderNo } = await nomisClient.getBooking(bookingId)
    return findResponsibleOfficerByOffenderNo(offenderNo)
  }

  async function findResponsibleOfficerByOffenderNo(offenderNo) {
    logger.info(`findResponsibleOfficer: ${offenderNo}`)

    try {
      const com = await deliusClient.getResponsibleOfficer(offenderNo)

      return formatCom(com)
    } catch (error) {
      if (error.status === 404) {
        logger.error(`RO relationship not found for booking id: ${offenderNo}`)
        return { message: 'No RO relationship' }
      }

      logger.error(`findResponsibleOfficer for: ${offenderNo}`, error.stack)
      throw error
    }
  }

  return { getROPrisoners, formatCom, findResponsibleOfficer, findResponsibleOfficerByOffenderNo }
}

function formatCom(com) {
  const name = setCase.capital(
    [getIn(com, [0, 'forenames']), getIn(com, [0, 'surname'])]
      .join(' ')
      .trim()
      .toLowerCase()
  )
  return {
    name: name || null,
    deliusId: getIn(com, [0, 'staffCode']) || null,
    message: getIn(com, ['message']) || null,
  }
}
