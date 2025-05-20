/**
 * @typedef {import("../services/prisonerService").PrisonerService} PrisonerService
 */
const { asyncMiddleware } = require('../utils/middleware')

/**
 * @param {object} args
 * @param {PrisonerService} args.prisonerService
 */
module.exports =
  ({ prisonerService }) =>
  (router) => {
    router.get(
      '/:receiver/:type/:bookingId',
      asyncMiddleware(async (req, res) => {
        const { receiver, type, bookingId } = req.params

        const validTemplates = [
          'caToDm',
          'caToDmRefusal',
          'caToDmResubmit',
          'caToRo',
          'dmToCa',
          'dmToCaReturn',
          'roToCa',
          'roToCaAddressRejected',
          'roToCaOptedOut',
        ]
        if (!validTemplates.includes(type)) {
          res.status(400).send('Invalid template type')
          return
        }
        const submissionTarget = await prisonerService.getOrganisationContactDetails(
          receiver,
          bookingId,
          res.locals.token
        )

        res.render(`sent/${type}`, { submissionTarget })
      })
    )

    return router
  }
