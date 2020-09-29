/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const logger = require('../log')
const db = require('../server/data/dataAccess/db')
const { unwrapResult } = require('../server/utils/functionalHelpers')

const nomisClientBuilder = require('../server/data/nomisClientBuilder')
const createSignInService = require('../server/authentication/signInService')
const { DeliusClient } = require('../server/data/deliusClient')
const { RoService } = require('../server/services/roService')

const signInService = createSignInService()
const deliusClient = new DeliusClient(signInService)
const roService = new RoService(deliusClient, nomisClientBuilder)

const getBookingIds = async () => {
  const query = {
    text: `select booking_id
    from licences
    where stage != 'ELIGIBILITY'`,
  }

  const { rows } = await db.query(query)
  return rows.map((row) => row.booking_id)
}

module.exports = async () => {
  const bookingIds = await getBookingIds()
  const token = await signInService.getAnonymousClientCredentialsTokens()
  const ldus = new Set()
  const missingRos = new Set()

  let count = 0
  for (const bookingId of bookingIds) {
    const [ro, roError] = unwrapResult(await roService.findResponsibleOfficer(bookingId, token.token))
    if (roError) {
      logger.error(`Error retrieving RO for booking: '${bookingId}', reason: ${roError.message}`)
      missingRos.add({ bookingId, reason: roError.message })
    } else {
      count += 1
      ldus.add(ro.lduCode)
    }
  }
  logger.info(`m Retrieved ldus: ${Array.from(ldus)} from ${count}/${bookingIds.length} bookings`, {
    ldus: Array.from(ldus),
    missingRos: Array.from(missingRos),
  })
}
