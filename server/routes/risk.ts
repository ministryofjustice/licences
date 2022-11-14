import { LicenceService } from '../services/licenceService'
import type { Response } from 'express'
import type { LicenceLocals } from '../utils/middleware'
import { asyncMiddleware } from '../utils/middleware'
import createStandardRoutes from './routeWorkers/standard'
import formConfig from './config/risk'
import { getIn, firstItem } from '../utils/functionalHelpers'

const sectionName = 'risk'

export default ({ licenceService }: { licenceService: LicenceService }) =>
  (router, audited) => {
    const standard = createStandardRoutes({ formConfig, licenceService, sectionName })

    router.get('/:formName/:bookingId', asyncMiddleware(getStandard))

    function getStandard(req, res: Response<any, LicenceLocals>) {
      const { formName, bookingId, action } = req.params
      const { licenceSection, nextPath, pageDataMap } = formConfig[formName]
      const dataPath = pageDataMap || ['licence', sectionName, licenceSection]
      const riskVersion = licenceService.getRiskVersion(res.locals.licence.licence)

      const rawData = getIn(res.locals.licence, dataPath) || {}
      const data =
        firstItem(req.flash('userInput')) || licenceService.addSplitDateFields(rawData, formConfig[formName].fields)
      const errorObject = firstItem(req.flash('errors')) || {}

      const viewData = { bookingId, data, nextPath, errorObject, action, sectionName, formName, version: riskVersion }

      res.render(`risk/riskManagement`, viewData)
    }

    router.post('/:formName/:bookingId', audited, asyncMiddleware(postStandard))

    async function postStandard(req, res: Response<any, LicenceLocals>) {
      const { bookingId, action } = req.params
      const isChange = action === 'change'

      await licenceService.update({
        bookingId,
        originalLicence: res.locals.licence,
        config: formConfig.riskManagement,
        userInput: req.body,
        licenceSection: 'risk',
        formName: 'riskManagement',
        postRelease: res.locals.postRelease,
      })

      return res.redirect(isChange ? `/hdc/review/risk/${bookingId}` : `/hdc/taskList/${bookingId}`)
    }

    router.get('/:formName/:action/:bookingId', asyncMiddleware(standard.get))
    router.post('/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post))

    return router
  }
