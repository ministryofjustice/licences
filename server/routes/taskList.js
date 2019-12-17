/**
 * @typedef {import("../services/prisonerService").PrisonerService} PrisonerService
 * @typedef {import("../services/caService").CaService} CaService
 */
const path = require('path')
const { asyncMiddleware } = require('../utils/middleware')
const { getLicenceStatus } = require('../utils/licenceStatus')
const { getStatusLabel } = require('../utils/licenceStatusLabels')
const { getAllowedTransition } = require('../utils/licenceStatusTransitions')
const { isEmpty } = require('../utils/functionalHelpers')
const getTaskListModel = require('./viewModels/taskListModels')
const logger = require('../../log')
const caTasks = require('../routes/viewModels/taskLists/caTasks')
const taskListErrors = require('./config/taskListErrors')

/**
 * @param {object} args
 * @param {PrisonerService} args.prisonerService
 * @param {any} args.licenceService
 * @param {any} args.audit
 * @param {CaService} args.caService
 */

module.exports = ({ prisonerService, licenceService, audit, caService }) => router => {
  router.get(
    '/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params
      const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, res.locals.token)
      if (isEmpty(prisonerInfo)) {
        logger.info('Prisoner not found for task list', bookingId)
        return res.redirect('/caseList')
      }

      const postRelease = prisonerInfo.agencyLocationId ? prisonerInfo.agencyLocationId.toUpperCase() === 'OUT' : false
      const licence = await licenceService.getLicence(bookingId)

      const licenceStatus = getLicenceStatus(licence)
      const allowedTransition = getAllowedTransition(licenceStatus, req.user.role)
      const { statusLabel } = getStatusLabel(licenceStatus, req.user.role)
      let taskListModel
      const errorCodes = await caService.getReasonForNotContinuing(bookingId, res.locals.token)
      const errorObject = errorCodes ? getAllErrorMessages(errorCodes) : null

      if (licenceStatus.stage === 'ELIGIBILITY' && req.user.role === 'CA' && errorObject) {
        taskListModel = caTasks.getCaTasksEligibilityLduInactive(licenceStatus)
      } else {
        taskListModel = getTaskListModel(req.user.role, postRelease, licenceStatus, licence || {}, allowedTransition)
      }

      res.render('taskList/taskListBuilder', {
        licenceStatus,
        licenceVersion: licence ? licence.version : 0,
        approvedVersionDetails: licence ? licence.approvedVersionDetails : 0,
        allowedTransition,
        statusLabel,
        prisonerInfo,
        bookingId,
        taskListModel,
        postApproval: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(licenceStatus.stage),
        errorObject,
      })
    })
  )

  router.post(
    '/eligibilityStart',
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.body

      const existingLicence = await licenceService.getLicence(bookingId)

      if (!existingLicence) {
        await licenceService.createLicence({ bookingId })
        audit.record('LICENCE_RECORD_STARTED', req.user.username, { bookingId })
      }

      res.redirect(`/hdc/eligibility/excluded/${bookingId}`)
    })
  )

  router.post(
    '/varyStart',
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.body
      await licenceService.createLicence({
        bookingId,
        data: { variedFromLicenceNotInSystem: true },
        stage: 'VARY',
      })
      audit.record('VARY_NOMIS_LICENCE_CREATED', req.user.username, { bookingId })

      res.redirect(`/hdc/vary/evidence/${bookingId}`)
    })
  )

  router.get(
    '/image/:imageId',
    asyncMiddleware(async (req, res) => {
      const prisonerImage = await prisonerService.getPrisonerImage(req.params.imageId, res.locals.token)

      if (!prisonerImage) {
        const placeHolder = path.join(__dirname, '../../assets/images/no-photo.png')
        res.status(302)
        return res.sendFile(placeHolder)
      }
      res.contentType('image/jpeg')
      res.send(prisonerImage)
    })
  )

  return router
}

const getAllErrorMessages = errorCodes => {
  const errorMsgs = Object.keys(errorCodes)
  return {
    errMsg1: taskListErrors[errorMsgs[0]],
    errMsg2: taskListErrors[errorMsgs[1]],
  }
}
