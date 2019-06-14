const setCase = require('case')
const logger = require('../../log.js')
const { getIn, isEmpty } = require('../utils/functionalHelpers')

class RoRelationshipError extends Error {}

module.exports = function createNomisRoService(nomisClientBuilder) {
  async function getROPrisoners(staffCode, token) {
    const nomisClient = nomisClientBuilder(token)
    const requiredPrisoners = await nomisClient.getROPrisoners(staffCode)
    if (!isEmpty(requiredPrisoners)) {
      const requiredIDs = requiredPrisoners.map(prisoner => prisoner.bookingId)
      return nomisClient.getOffenderSentencesByBookingId(requiredIDs)
    }

    return []
  }

  async function findResponsibleOfficer(bookingId, token) {
    logger.info(`findResponsibleOfficer: ${bookingId}`)

    try {
      const nomisClient = nomisClientBuilder(token)
      const roPersons = await getRoPersons(nomisClient, bookingId)

      const allRoDetails = await Promise.all(
        roPersons.map(roPerson => {
          return getRoDetails(nomisClient, roPerson)
        })
      )

      if (allRoDetails.length > 1) {
        logger.warn(`Multiple RO relationships for bookingId: ${bookingId}`, allRoDetails)
      }

      const com = await selectRo(allRoDetails)
      return formatCom(com)
    } catch (error) {
      if (error instanceof RoRelationshipError) {
        logger.error(`findResponsibleOfficer for: ${bookingId}`, error.message)
        return { message: error.message }
      }

      logger.error(`findResponsibleOfficer for: ${bookingId}`, error.stack)
      throw error
    }
  }

  return { getROPrisoners, findResponsibleOfficer, formatCom }
}

async function getRoPersons(nomisClient, bookingId) {
  const relations = await getRoRelations(nomisClient, bookingId)
  if (!relations[0]) {
    throw new RoRelationshipError('No RO relationship')
  }

  const personIds = relations.filter(r => !isEmpty(r.personId))

  if (isEmpty(personIds)) {
    throw new RoRelationshipError('No RO person identifier')
  }

  return personIds
}

async function getRoRelations(nomisClient, bookingId) {
  try {
    return await nomisClient.getRoRelations(bookingId)
  } catch (error) {
    if (error.status === 404) {
      logger.error(`RO relationship not found for booking id: ${bookingId}`)
      throw new RoRelationshipError('No RO relationship')
    }

    logger.error('Error getting RO relationship', error.stack)
    throw error
  }
}

async function getRoDetails(nomisClient, roPerson) {
  const { personId } = roPerson
  const personIdentifiers = await getPersonIdentifiers(nomisClient, personId)

  if (!personIdentifiers || personIdentifiers.length < 1) {
    logger.warn(`No person identifiers for RO person: ${roPerson}`)
    return roPerson
  }

  const id = personIdentifiers.find(record => record.identifierType === 'EXTERNAL_REL')

  if (!id) {
    logger.warn(`No EXTERNAL_REL person identifier for RO person: ${roPerson}`)
    return roPerson
  }

  if (!id.identifierValue) {
    logger.warn(`No EXTERNAL_REL person identifier value for RO person: ${roPerson}`)
    return roPerson
  }

  return { ...roPerson, deliusId: id.identifierValue }
}

async function getPersonIdentifiers(nomisClient, personId) {
  try {
    return await nomisClient.getPersonIdentifiers(personId)
  } catch (error) {
    if (error.status === 404) {
      logger.warn(`Person identifiers not found for person id: ${personId}`)
      throw new RoRelationshipError('No RO external relationship')
    }

    logger.error('Error getting person identifiers', error.stack)
    throw error
  }
}

async function selectRo(allRoDetails) {
  const roWithDeliusIds = allRoDetails.filter(r => !isEmpty(r.deliusId))

  if (isEmpty(roWithDeliusIds)) {
    throw new RoRelationshipError('No RO with a Delius staff code')
  }

  return roWithDeliusIds.sort((a, b) => b.personId - a.personId)[0]
}

function formatCom(com) {
  const name = setCase.capital(
    [getIn(com, ['firstName']), getIn(com, ['lastName'])]
      .join(' ')
      .trim()
      .toLowerCase()
  )
  return {
    name: name || null,
    deliusId: getIn(com, ['deliusId']) || null,
    message: getIn(com, ['message']) || null,
  }
}
