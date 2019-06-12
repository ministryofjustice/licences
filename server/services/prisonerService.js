const logger = require('../../log.js')
const { formatObjectForView } = require('./utils/formatForView')
const { getIn } = require('../utils/functionalHelpers')

module.exports = { createPrisonerService }

function createPrisonerService(nomisClientBuilder, roService) {
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
        roService.findResponsibleOfficer(bookingId, token),
      ])

      const { CRO, PNC } = selectEntriesWithTypes(await nomisClient.getIdentifiers(bookingId), ['PNC', 'CRO'])

      const image = prisoner.facialImageId ? await nomisClient.getImageInfo(prisoner.facialImageId) : { imageId: false }

      return formatObjectForView({
        ...prisoner,
        CRO,
        PNC,
        offences,
        ...image,
        com,
        aliases,
      })
    } catch (error) {
      logger.error('Error getting prisoner info', error.stack)
      throw error
    }
  }

  async function getResponsibleOfficer(bookingId, token) {
    return roService.findResponsibleOfficer(bookingId, token)
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
