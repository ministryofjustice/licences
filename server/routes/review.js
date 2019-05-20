const { getReviewSections } = require('./viewModels/reviewModels')
const { asyncMiddleware } = require('../utils/middleware')
const { getIn } = require('../utils/functionalHelpers')
const logger = require('../../log')

module.exports = ({ licenceService, conditionsService, prisonerService }) => router => {
  router.get(
    '/:sectionName/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { sectionName, bookingId } = req.params
      const { licenceStatus } = res.locals
      logger.debug(`GET /review/${sectionName}/${bookingId}`)

      const licence = getIn(res.locals.licence, ['licence']) || {}
      const stage = getIn(res.locals.licence, ['stage']) || {}
      const licenceVersion = getIn(res.locals.licence, ['version']) || {}

      const postApproval = ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(stage)
      const showErrors = shouldValidate(req.user.role, stage, postApproval)

      const errorObject = showErrors ? getErrors(licence, stage, licenceStatus) : {}

      const data = conditionsService.populateLicenceWithConditions(licence, errorObject)

      const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, res.locals.token)

      const sections = getReviewSections(licenceStatus)

      res.render(`review/${sectionName}`, {
        bookingId,
        data,
        sections,
        prisonerInfo,
        stage,
        licenceVersion,
        errorObject,
        showErrors,
        postApproval,
      })
    })
  )

  function getErrors(licence, stage, { decisions, tasks }) {
    return licenceService.validateFormGroup({ licence, stage, decisions, tasks })
  }

  return router
}

function shouldValidate(role, stage, postApproval) {
  return postApproval ? role === 'CA' : stagesForRole[role].includes(stage)
}

const stagesForRole = {
  CA: ['ELIGIBILITY', 'PROCESSING_CA', 'FINAL_CHECKS'],
  RO: ['PROCESSING_RO'],
  DM: ['APPROVAL'],
}
