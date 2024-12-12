import path from 'path'
import { PrisonerService, CaService } from '../../types/licences'
import { asyncMiddleware } from '../utils/middleware'
import getLicenceStatus from '../services/licence/licenceStatus'
import { getStatusLabel } from '../services/licence/licenceStatusLabels'

import { isEmpty } from '../utils/functionalHelpers'
import getTaskListModel from './viewModels/taskListModels'
import logger from '../../log'
import { LicenceStage } from '../data/licenceTypes'
import { LicenceService } from '../services/licenceService'

const { APPROVAL, DECIDED, ELIGIBILITY, MODIFIED, MODIFIED_APPROVAL, PROCESSING_CA, PROCESSING_RO } = LicenceStage

const READ_WRITE = 'RW'
const READ_ONLY = 'R'
const NONE = 'NONE'

const determineAccessLevel = (licence, postRelease, role) => {
  const stage = licence && licence.stage

  if (postRelease) {
    return role === 'RO' ? READ_WRITE : NONE
  }

  switch (role) {
    case 'READONLY': {
      return stage ? READ_ONLY : NONE
    }

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

export = (
    prisonerService: PrisonerService,
    licenceService: LicenceService,
    audit,
    caService: CaService,
    signInService
  ) =>
  (router) => {
    router.get(
      '/:bookingId',
      asyncMiddleware(async (req, res) => {
        const { bookingId } = req.params
        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, res.locals.token)
        if (isEmpty(prisonerInfo)) {
          logger.info('Prisoner not found for task list', bookingId)
          return res.redirect('/caseList')
        }

        const postRelease = prisonerInfo.agencyLocationId
          ? prisonerInfo.agencyLocationId.toUpperCase() === 'OUT'
          : false
        const licence = await licenceService.getLicence(bookingId)

        const access = determineAccessLevel(licence, postRelease, req.user.role)

        if (access === NONE) {
          return res.redirect('/caseList/active')
        }

        if (access === READ_ONLY) {
          return res.redirect(`/hdc/review/licence/${bookingId}`)
        }

        const licenceStatus = getLicenceStatus(licence)
        const { statusLabel } = getStatusLabel(licenceStatus, req.user.role)

        const model = {
          licenceStatus,
          licenceVersion: licence ? licence.version : 0,
          approvedVersionDetails: licence ? licence.approvedVersionDetails : 0,
          statusLabel,
          prisonerInfo,
          bookingId,
          postApproval: licenceStatus.postApproval,
        }

        const errorCode = await caService.getReasonForNotContinuing(bookingId, res.locals.token)


        // if (
        //   req.user.role === 'CA' &&
        //   licenceStatus.stage === 'ELIGIBILITY' &&
        //   licenceStatus.tasks.eligibility === 'DONE'
        // ) {
        //   const errorCode = await caService.getReasonForNotContinuing(bookingId, res.locals.token)

        //   const taskListModel = getTaskListModel(req.user.role, postRelease, licenceStatus, errorCode, licence || {})

        //   //think we cabn just move error code out and not have the conditionals if we can get the processing bit working below
        //   //just send the error code through
          
        //   return res.render('taskList/taskListBuilder', {
        //     ...model,
        //     taskListModel,
        //     errors: [],
        //   })
        // }

        // if (
        //   req.user.role === 'CA' &&
        //   licenceStatus.stage === 'PROCESSING_CA' &&
        //   licenceStatus.tasks.eligibility === 'DONE' &&
        //   licenceStatus.decisions.curfewAddressProposed &&
        //   licenceStatus.tasks.curfewAddress === 'DONE'
        // ) {
        //   const { decisions, tasks } = licenceStatus
        //   const errorCode = await caService.getReasonForNotContinuing(bookingId, res.locals.token)

        //   if (errorCode) {
        //     return res.render('taskList/taskListBuilder', {
        //       ...model,
        //       taskListModel: getTasksForBlockedCaProcessingStage({ decisions, tasks, errorCode }),
        //       errors: [],
        //     })
        //   }
        // }

        const taskListModel = getTaskListModel(req.user.role, postRelease, licenceStatus, errorCode, licence || {})

        return res.render('taskList/taskListBuilder', {
          ...model,
          taskListModel,
          errors: [],
        })
      })
    )

    router.post(
      '/eligibilityStart',
      asyncMiddleware(async (req, res) => {
        const { bookingId, prisonNumber } = req.body

        const existingLicence = await licenceService.getLicence(bookingId)

        if (!existingLicence) {
          await licenceService.createLicence({ bookingId, prisonNumber })
          audit.record('LICENCE_RECORD_STARTED', req.user.username, { bookingId })
        }

        res.redirect(`/hdc/eligibility/excluded/${bookingId}`)
      })
    )

    router.post(
      '/varyStart',
      asyncMiddleware(async (req, res) => {
        const { bookingId, prisonNumber } = req.body
        await licenceService.createLicence({
          bookingId,
          prisonNumber,
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
        const systemToken = await signInService.getClientCredentialsTokens()
        const prisonerImage = await prisonerService.getPrisonerImage(req.params.imageId, systemToken)

        if (!prisonerImage) {
          const placeHolder = path.join(process.cwd(), '/assets/images/no-photo.png')
          res.status(302)
          return res.sendFile(placeHolder)
        }
        res.contentType('image/jpeg')
        return res.send(prisonerImage)
      })
    )

    return router
  }
