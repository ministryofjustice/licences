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
const { getTasksForBlocked } = require('./viewModels/taskLists/caTasks')
const {
  licenceStages: { APPROVAL, DECIDED, ELIGIBILITY, MODIFIED, MODIFIED_APPROVAL, PROCESSING_CA, PROCESSING_RO },
} = require('../services/config/licenceStages')

const READ_WRITE = 'RW'
const READ_ONLY = 'R'
const NONE = 'NONE'

const determineAccessLevel = (licence, postRelease, role) => {
  const stage = licence && licence.stage

  if (postRelease) {
    return role === 'RO' ? READ_WRITE : NONE
  }

  switch (role) {
    case 'DM':
      switch (stage) {
        case APPROVAL:
          return READ_WRITE

        case DECIDED:
        case MODIFIED:
        case MODIFIED_APPROVAL:
          return READ_ONLY

        default:
          return NONE
      }

    case 'CA':
      if (isEmpty(licence)) return READ_WRITE

      switch (stage) {
        case ELIGIBILITY:
        case PROCESSING_CA:
        case DECIDED:
        case MODIFIED:
        case MODIFIED_APPROVAL:
          return READ_WRITE

        default:
          return READ_ONLY
      }

    case 'RO':
      if (isEmpty(licence)) return READ_WRITE

      switch (stage) {
        case PROCESSING_RO:
          return READ_WRITE

        case ELIGIBILITY:
        case PROCESSING_CA:
        case APPROVAL:
        case DECIDED:
        case MODIFIED:
        case MODIFIED_APPROVAL:
          return READ_ONLY

        default:
          return NONE
      }

    default:
      return NONE
  }
}

/**
 * @param {object} args
 * @param {PrisonerService} args.prisonerService
 * @param {any} args.licenceService
 * @param {any} args.audit
 * @param {CaService} args.caService
 */
module.exports = ({ prisonerService, licenceService, audit, caService }) => (router) => {
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

      const access = determineAccessLevel(licence, postRelease, req.user.role)

      if (access === NONE) {
        res.redirect('/caseList/active')
        return
      }

      if (access === READ_ONLY) {
        res.redirect(`/hdc/review/licence/${bookingId}`)
        return
      }

      const licenceStatus = getLicenceStatus(licence)
      const allowedTransition = getAllowedTransition(licenceStatus, req.user.role)
      const { statusLabel } = getStatusLabel(licenceStatus, req.user.role)

      const model = {
        licenceStatus,
        licenceVersion: licence ? licence.version : 0,
        approvedVersionDetails: licence ? licence.approvedVersionDetails : 0,
        allowedTransition,
        statusLabel,
        prisonerInfo,
        bookingId,
        postApproval: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(licenceStatus.stage),
      }

      if (
        req.user.role === 'CA' &&
        licenceStatus.stage === 'ELIGIBILITY' &&
        licenceStatus.tasks.eligibility === 'DONE'
      ) {
        const errorCode = await caService.getReasonForNotContinuing(bookingId, res.locals.token)

        if (errorCode) {
          return res.render('taskList/taskListBuilder', {
            ...model,
            taskListModel: getTasksForBlocked(errorCode),
            errors: [],
          })
        }
      }

      const taskListModel = getTaskListModel(
        req.user.role,
        postRelease,
        licenceStatus,
        licence || {},
        allowedTransition
      )

      res.render('taskList/taskListBuilder', {
        ...model,
        taskListModel,
        errors: [],
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
