const logger = require('../../log.js')
const { formatObjectForView } = require('./utils/formatForView')
const { getIn, isEmpty } = require('../utils/functionalHelpers')

module.exports = { createPrisonerService }

class RoRelationshipError extends Error {}

function createPrisonerService(nomisClientBuilder) {
  async function getPrisonerPersonalDetails(bookingId, token) {
    try {
      logger.info(`getPrisonerPersonalDetails: ${bookingId}`)

      const nomisClient = nomisClientBuilder(token)

      const prisoners = await nomisClient.getOffenderSentencesByBookingId(bookingId)

      const prisoner = prisoners[0]
      if (!prisoner) {
        return null
      }

      return formatObjectForView(prisoner)
    } catch (error) {
      logger.error('Error getting prisoner personal details', error.stack)
      return null
    }
  }

  async function getPrisonerDetails(bookingId, token) {
    try {
      logger.info(`getPrisonerDetail: ${bookingId}`)

      const nomisClient = nomisClientBuilder(token)

      const prisoners = await nomisClient.getOffenderSentencesByBookingId(bookingId)
      const prisoner = prisoners[0]
      if (!prisoner) {
        return
      }

      const [aliases, offences, com] = await Promise.all([
        nomisClient.getAliases(bookingId),
        nomisClient.getMainOffence(bookingId),
        findResponsibleOfficer(bookingId, token),
      ])

      const { CRO, PNC } = selectEntriesWithTypes(await nomisClient.getIdentifiers(bookingId), ['PNC', 'CRO'])

      const image = prisoner.facialImageId ? await nomisClient.getImageInfo(prisoner.facialImageId) : { imageId: false }

      return formatObjectForView({
        ...prisoner,
        CRO,
        PNC,
        offences,
        ...image,
        com: [com],
        aliases,
      })
    } catch (error) {
      logger.error('Error getting prisoner info', error.stack)
      throw error
    }
  }

  async function getResponsibleOfficer(bookingId, token) {
    logger.info(`getResponsibleOfficer: ${bookingId}`)
    const com = await findResponsibleOfficer(bookingId, token)
    return formatObjectForView({ com: [com] })
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

      return await selectRo(allRoDetails)
    } catch (error) {
      if (error instanceof RoRelationshipError) {
        logger.error(`findResponsibleOfficer for: ${bookingId}`, error.message)
        return { message: error.message }
      }

      logger.error(`findResponsibleOfficer for: ${bookingId}`, error.stack)
      throw error
    }
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

  function getPrisonerImage(imageId, token) {
    logger.info(`getPrisonerImage: ${imageId}`)

    const nomisClient = nomisClientBuilder(token)
    return nomisClient.getImageData(imageId)
  }

  async function getEstablishmentForPrisoner(bookingId, token) {
    try {
      logger.info(`getEstablishmentForPrisoner: ${bookingId}`)

      const nomisClient = nomisClientBuilder(token)

      const prisoners = await nomisClient.getOffenderSentencesByBookingId(bookingId)
      const prisoner = prisoners[0]
      if (!prisoner) {
        return
      }

      const { offenderNo } = prisoner

      const getReleaseEstablishment = async () => {
        const movements = await nomisClient.getRecentMovements(offenderNo)
        const release = movements.find(movement => movement.movementType === 'REL')
        return getIn(release, ['fromAgency'])
      }

      const locationId =
        prisoner.agencyLocationId === 'OUT' ? await getReleaseEstablishment() : prisoner.agencyLocationId

      return getEstablishment(locationId, token)
    } catch (error) {
      logger.error('Error getting prisoner establishment', error.stack)
      throw error
    }
  }

  async function getEstablishment(agencyLocationId, token) {
    try {
      logger.info(`getEstablishment: ${agencyLocationId}`)

      const nomisClient = nomisClientBuilder(token)
      const establishment = await nomisClient.getEstablishment(agencyLocationId)

      return formatObjectForView(establishment)
    } catch (error) {
      if (error.status === 404) {
        logger.warn(`Establishment not found for agencyLocationId: ${agencyLocationId}`)
        return null
      }

      logger.error('Error getting establishment', error.stack)
      throw error
    }
  }

  async function getOrganisationContactDetails(role, bookingId, token) {
    if (role.toUpperCase() === 'RO') {
      return getResponsibleOfficer(bookingId, token)
    }

    if (role.toUpperCase() === 'CA') {
      return getEstablishmentForPrisoner(bookingId, token)
    }

    return null
  }

  function selectEntriesWithTypes(identifiers, types) {
    return identifiers.reduce((selected, element) => {
      if (types.includes(element.type)) {
        return { ...selected, [element.type]: element.value }
      }
      return selected
    }, {})
  }

  return {
    getPrisonerDetails,
    getPrisonerImage,
    getEstablishmentForPrisoner,
    getEstablishment,
    getResponsibleOfficer,
    getPrisonerPersonalDetails,
    getOrganisationContactDetails,
  }
}
