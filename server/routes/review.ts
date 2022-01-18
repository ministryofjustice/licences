import { getReviewSections } from './viewModels/reviewModels'
import { asyncMiddleware, LicenceLocals } from '../utils/middleware'
import logger from '../../log'
import { isPostApproval } from '../services/config/licenceStage'

import type { PrisonerService } from '../../types/licences'
import type { LicenceService } from '../services/licenceService'
import type { Response } from 'express'
import type { ConditionsServiceFactory } from '../services/conditionsService'
import { Licence, LicenceStage } from '../data/licenceTypes'
import { ConditionVersion } from '../data/licenceClientTypes'
import { LicenceStatus } from '../services/licence/licenceStatusTypes'

function shouldValidate(role, stage, postApproval) {
  return postApproval
    ? role === 'CA'
    : {
        READONLY: [],
        CA: ['ELIGIBILITY', 'PROCESSING_CA', 'FINAL_CHECKS'],
        RO: ['PROCESSING_RO'],
        DM: ['APPROVAL'],
      }[role].includes(stage)
}

export = ({
  licenceService,
  conditionsServiceFactory,
  prisonerService,
}: {
  licenceService: LicenceService
  conditionsServiceFactory: ConditionsServiceFactory
  prisonerService: PrisonerService
}) => {
  function validate(
    licenceStatus: LicenceStatus,
    showErrors,
    licence: Licence,
    stage: LicenceStage,
    conditionVersion: ConditionVersion
  ) {
    const { decisions, tasks } = licenceStatus
    return showErrors ? licenceService.validateFormGroup({ licence, stage, decisions, tasks, conditionVersion }) : {}
  }

  return (router) => {
    router.get(
      '/:sectionName/:bookingId',
      asyncMiddleware(async (req, res: Response<any, LicenceLocals>) => {
        const { sectionName, bookingId } = req.params
        const { licenceStatus } = res.locals
        logger.debug(`GET /review/${sectionName}/${bookingId}`)

        const licence = res.locals?.licence?.licence || {}
        const stage = res.locals?.licence?.stage
        const licenceVersion = res?.locals?.licence?.version || {}
        const conditionsVersion = conditionsServiceFactory.getVersion(res.locals?.licence)

        const postApproval = isPostApproval(stage)
        const showErrors = shouldValidate(req.user.role, stage, postApproval)
        const errorObject = validate(licenceStatus, showErrors, licence, stage, conditionsVersion)

        const data = conditionsServiceFactory
          .forLicence(res.locals.licence)
          .populateLicenceWithConditions(licence, errorObject)

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

    return router
  }
}
