import { LicenceService } from '../services/licenceService'
import type { Response } from 'express'
import type { LicenceLocals } from '../utils/middleware'
import type { ConditionsServiceFactory } from '../services/conditionsService'

import { asyncMiddleware } from '../utils/middleware'
import createStandardRoutes from './routeWorkers/standard'
import logger from '../../log'
import * as formConfig from './config/licenceConditions'

export default ({
    licenceService,
    conditionsServiceFactory,
  }: {
    licenceService: LicenceService
    conditionsServiceFactory: ConditionsServiceFactory
  }) =>
  (router, audited) => {
    const standard = createStandardRoutes({ formConfig, licenceService, sectionName: 'licenceConditions' })

    router.get('/standard/:bookingId', getStandard)
    router.get('/standard/:action/:bookingId', getStandard)

    function getStandard(req, res: Response<any, LicenceLocals>) {
      logger.debug('GET /standard/:bookingId')

      const { action, bookingId } = req.params
      const conditionsService = conditionsServiceFactory.forLicence(res.locals.licence)
      const standardConditions = conditionsService.getStandardConditions()
      const { additionalConditionsRequired } = res.locals.licence?.licence?.licenceConditions?.standard || {}
      const { additionalConditions, pssConditions, bespokeConditions, unapprovedBespokeConditions } =
        conditionsService.getNonStandardConditions(res.locals.licence.licence)

      res.render('licenceConditions/standard', {
        action,
        bookingId,
        standardConditions,
        additionalConditionsRequired,
        additionalConditions,
        pssConditions,
        bespokeConditions,
        unapprovedBespokeConditions,
      })
    }

    router.post('/standard/:bookingId', audited, asyncMiddleware(postStandard))
    router.post('/standard/:action/:bookingId', audited, asyncMiddleware(postStandard))

    async function postStandard(req, res: Response<any, LicenceLocals>) {
      logger.debug('POST /standard/')
      const { bookingId, action } = req.params
      const isChange = action === 'change'

      await licenceService.update({
        bookingId,
        originalLicence: res.locals.licence,
        config: formConfig.standard,
        userInput: req.body,
        licenceSection: 'licenceConditions',
        formName: 'standard',
        postRelease: res.locals.postRelease,
      })

      if (req.body.additionalConditionsRequired === 'Yes') {
        return res.redirect(
          isChange
            ? `/hdc/licenceConditions/additionalConditions/change/${bookingId}`
            : `/hdc/licenceConditions/additionalConditions/${bookingId}`
        )
      }

      return res.redirect(isChange ? `/hdc/review/licenceDetails/${bookingId}` : `/hdc/taskList/${bookingId}`)
    }

    router.get('/additionalConditions/:bookingId', getAdditional)
    router.get('/additionalConditions/:action/:bookingId', getAdditional)

    function getAdditional(req, res: Response<any, LicenceLocals>) {
      logger.debug('GET /additionalConditions')

      const { action, bookingId } = req.params
      const record = res.locals.licence
      const bespokeConditions = record.licence?.licenceConditions?.bespoke || []
      const conditionsService = conditionsServiceFactory.forLicence(record)
      const conditions = conditionsService.getAdditionalConditions(record.licence)

      res.render('licenceConditions/additionalConditions', {
        action,
        bookingId,
        conditions,
        bespokeConditions,
      })
    }

    router.post('/additionalConditions/:bookingId', audited, asyncMiddleware(postAdditional))
    router.post('/additionalConditions/:action/:bookingId', audited, asyncMiddleware(postAdditional))

    async function postAdditional(req, res: Response<any, LicenceLocals>) {
      logger.debug('POST /additionalConditions')
      const { bookingId, additionalConditions, bespokeDecision, bespokeConditions } = req.body
      const { action } = req.params
      const destination = action ? `${action}/${bookingId}` : bookingId
      const bespoke = (bespokeDecision === 'Yes' && bespokeConditions.filter((condition) => condition.text)) || []

      const conditionsService = conditionsServiceFactory.forLicence(res.locals.licence)

      const additional = additionalConditions ? conditionsService.formatConditionInputs(req.body) : {}
      const newConditionsObject = conditionsService.createConditionsObjectForLicence(additional, bespoke)

      await licenceService.updateLicenceConditions(
        bookingId,
        res.locals.licence,
        newConditionsObject,
        res.locals.postRelease
      )

      const newVersion = conditionsServiceFactory.getNewVersion(res.locals.licence)

      if (newVersion) {
        await licenceService.setConditionsVersion(Number(bookingId), newVersion)
      }

      res.redirect(`/hdc/licenceConditions/conditionsSummary/${destination}`)
    }

    router.get('/conditionsSummary/:bookingId', getConditionsSummary)
    router.get('/conditionsSummary/:action/:bookingId', getConditionsSummary)

    function getConditionsSummary(req, res: Response<any, LicenceLocals>) {
      const { bookingId, action } = req.params
      logger.debug('GET licenceConditions/conditionsSummary/:bookingId')

      const nextPath = formConfig.conditionsSummary.nextPath[action] || formConfig.conditionsSummary.nextPath.path
      const licence = res.locals?.licence?.licence || {}
      const additionalConditions = licence?.licenceConditions?.additional || {}
      const version = conditionsServiceFactory.getVersion(res.locals.licence)
      const errorObject = licenceService.validateForm({
        formResponse: additionalConditions,
        pageConfig: formConfig.additional.get(version),
        formType: 'additional',
      })
      const data = conditionsServiceFactory
        .forLicence(res.locals.licence)
        .populateLicenceWithConditions(licence, errorObject)

      const errorList = req.flash('errors')
      const errors = (errorList && errorList[0]) || {}
      res.render(`licenceConditions/conditionsSummary`, { bookingId, data, nextPath, action, errors })
    }

    router.post('/additionalConditions/:bookingId/delete/:conditionId', audited, asyncMiddleware(postDelete))
    router.post('/additionalConditions/:action/:bookingId/delete/:conditionId', audited, asyncMiddleware(postDelete))

    async function postDelete(req, res: Response<any, LicenceLocals>) {
      logger.debug('POST /additionalConditions/delete')
      const { bookingId, conditionId } = req.body
      const { action } = req.params

      if (conditionId) {
        await licenceService.deleteLicenceCondition(bookingId, res.locals.licence, conditionId)
      }

      const destination = action ? `${action}/` : ''

      res.redirect(`/hdc/licenceConditions/conditionsSummary/${destination}${bookingId}`)
    }

    router.get('/:formName/:bookingId', asyncMiddleware(standard.get))
    router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))
    router.post('/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post))

    return router
  }
