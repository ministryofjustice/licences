/**
 * @typedef {import("../services/prisonerService").PrisonerService} PrisonerService
 */
const { asyncMiddleware } = require('../utils/middleware')
const { getIn } = require('../utils/functionalHelpers')

/**
 * @param {object} args
 * @param {PrisonerService} args.prisonerService
 */
module.exports = ({ prisonerService }) => router => {
  router.get(
    '/:receiver/:type/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { receiver, type, bookingId } = req.params
      const submissionTarget = await prisonerService.getOrganisationContactDetails(
        receiver,
        bookingId,
        res.locals.token
      )
      const dmAlreadyDecided = getIn(res.locals.licence, ['licence', 'approval', 'release', 'decision'])
      let reReferToDm = false

      if (type === 'caToDm' && dmAlreadyDecided) {
        reReferToDm = true
      }

      res.render(`sent/${type}`, { submissionTarget, reReferToDm })
    })
  )

  return router
}
