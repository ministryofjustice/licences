/**
 * @typedef {import("./roService").RoService} RoService
 * @typedef {import("../../types/licences").PrisonerService} PrisonerService
 * @typedef {import('../../types/licences').Destination} Destination
 */
const logger = require('../../log')
const { formatObjectForView } = require('./utils/formatForView')
const { getIn, unwrapResultOrThrow } = require('../utils/functionalHelpers')

module.exports = { createPrisonerService }

/**
 * @param {RoService} roService
 * @return {PrisonerService}
 */
function createPrisonerService(nomisClientBuilder, roService, signInService) {
  function selectEntriesWithTypes(identifiers, types) {
    return identifiers.reduce((selected, element) => {
      if (types.includes(element.type)) {
        return { ...selected, [element.type]: element.value }
      }
      return selected
    }, {})
  }

  return {
    async getPrisonerDetails(bookingId, token) {
      try {
        logger.info(`getPrisonerDetail: ${bookingId}`)
        const systemToken = await signInService.getClientCredentialsTokens()

        const nomisClient = nomisClientBuilder(token)
        const nomisSystemClient = nomisClientBuilder(systemToken)

        const prisoners = await nomisClient.getOffenderSentencesByBookingId(bookingId)
        const prisoner = prisoners.length > 0 && prisoners[0]
        if (!prisoner) {
          return {}
        }

        const [aliases, offences, com] = await Promise.all([
          nomisClient.getAliases(bookingId),
          nomisClient.getMainOffence(bookingId),
          roService.findResponsibleOfficer(bookingId, token),
        ])

        const { CRO, PNC } = selectEntriesWithTypes(await nomisClient.getIdentifiers(bookingId), ['PNC', 'CRO'])

        const image = prisoner.facialImageId
          ? await nomisSystemClient.getImageInfo(prisoner.facialImageId)
          : { imageId: false }

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
    },

    async getEstablishmentForPrisoner(bookingId, token) {
      try {
        logger.info(`getEstablishmentForPrisoner: ${bookingId}`)

        const nomisClient = nomisClientBuilder(token)

        const prisoners = await nomisClient.getOffenderSentencesByBookingId(bookingId)
        const prisoner = prisoners[0]
        if (!prisoner) {
          return null
        }

        const { offenderNo } = prisoner

        const getReleaseEstablishment = async () => {
          const movements = await nomisClient.getRecentMovements(offenderNo)
          const release = movements.find((movement) => movement.movementType === 'REL')
          return getIn(release, ['fromAgency'])
        }

        const postRelease = prisoner.agencyLocationId ? prisoner.agencyLocationId.toUpperCase() === 'OUT' : false
        const locationId = postRelease ? await getReleaseEstablishment() : prisoner.agencyLocationId

        return this.getEstablishment(locationId, token)
      } catch (error) {
        logger.error('Error getting prisoner establishment', error.stack)
        throw error
      }
    },

    async getEstablishment(agencyLocationId, token) {
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
    },

    getPrisonerImage(imageId, token) {
      logger.info(`getPrisonerImage: ${imageId}`)

      const nomisClient = nomisClientBuilder(token)
      return nomisClient.getImageData(imageId)
    },

    async getPrisonerPersonalDetails(bookingId, token) {
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
    },

    async getOrganisationContactDetails(role, bookingId, token) {
      const destination = await this.getDestinationForRole(role, bookingId, token)
      return destination.submissionTarget
    },

    async getDestinationForRole(role, bookingId, token) {
      if (role.toUpperCase() === 'RO') {
        const responsibleOfficer = unwrapResultOrThrow(
          await roService.findResponsibleOfficer(bookingId, token),
          (error) => `${error.code}: ${error.message}`
        )

        return {
          destination: {
            type: 'probation',
            probationAreaCode: responsibleOfficer.probationAreaCode,
            lduCode: responsibleOfficer.lduCode,
          },
          submissionTarget: responsibleOfficer,
        }
      }

      if (['CA', 'DM'].includes(role.toUpperCase())) {
        const establishment = await this.getEstablishmentForPrisoner(bookingId, token)
        const { agencyId } = establishment || {}
        return {
          destination: {
            type: 'prison',
            agencyId,
          },
          submissionTarget: establishment,
        }
      }

      throw new Error(`Could not handle role: ${role} for booking: ${bookingId}`)
    },

    async getDestinations(senderRole, receiverRole, bookingId, token) {
      const sender = await this.getDestinationForRole(senderRole, bookingId, token)
      const receiver = await this.getDestinationForRole(receiverRole, bookingId, token)
      return {
        source: sender.destination,
        target: receiver.destination,
        submissionTarget: receiver.submissionTarget,
      }
    },
  }
}
