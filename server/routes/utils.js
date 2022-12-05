const express = require('express')
const logger = require('../../log')

const { asyncMiddleware } = require('../utils/middleware')
const { licenceClient } = require('../data/licenceClient')
const activeLduClient = require('../data/activeLduClient')

const auditClient = require('../data/audit')
const warningClient = require('../data/warningClient')

module.exports = () => {
  const router = express.Router()

  router.get(
    '/reset',
    asyncMiddleware(async (req, res) => {
      logger.info('Deleting licence records')
      await licenceClient.deleteAll()
      logger.info('Deleting audit records')
      await auditClient.deleteAll()
      logger.info('Deleting warning records')
      warningClient.deleteAll()
      return res.redirect('/')
    })
  )

  router.get(
    '/reset-test',
    asyncMiddleware(async (req, res) => {
      logger.info('Deleting test licence records')

      try {
        await licenceClient.deleteAllTest()
        return res.status(200).send({})
      } catch (error) {
        logger.error('Error during delete test licences', error.stack)
        return res.status(500).send({})
      }
    })
  )

  router.post(
    '/create/:bookingId',
    asyncMiddleware(async (req, res) => {
      logger.info('Creating test licence record')

      const { bookingId } = req.params
      const { licence, stage, standardConditionsVersion } = req.body

      if (!bookingId || !licence || !stage) {
        logger.warn('Missing input for create test licence')
        return res.status(404).send({})
      }

      try {
        await licenceClient.createLicence(bookingId, licence, stage, 1, 0, standardConditionsVersion)
        logger.info('Created licence')
        return res.status(201).send({})
      } catch (error) {
        logger.error('Error during create licence', error.stack)
        return res.status(500).send({})
      }
    })
  )

  router.post(
    '/enable-ldu/:probationAreaCode/:lduCode',
    asyncMiddleware(async (req, res) => {
      logger.info('Enabling LDU')

      const { probationAreaCode, lduCode } = req.params

      try {
        await activeLduClient.updateActiveLdu(probationAreaCode, [lduCode])
        logger.info(`Enabled LDU: ${probationAreaCode}/${lduCode}`)
        return res.status(201).send({})
      } catch (error) {
        logger.error('Error during enabling LDU', error.stack)
        return res.status(500).send({})
      }
    })
  )

  return router
}
