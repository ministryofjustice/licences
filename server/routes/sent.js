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
        const submissionTarget = await prisonerService.getOrganisationContactDetails(
          receiver,
          bookingId,
          res.locals.token
        )
        if (
          ![
            'caToDm',
            'caToDmRefusal',
            'caToDmResubmit',
            'caToRo',
            'dmToCa',
            'dmToCaReturn',
            'roToCa',
            'roToCaAddressRejected',
            'roToCaOptedOut',
          ].includes(type)
        ) {
          throw new Error(`Invalid template type`)
        }

        res.render(`sent/${type}`, { submissionTarget })
      })
    )

    return router
  }
