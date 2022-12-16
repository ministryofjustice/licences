import { LicenceService } from '../services/licenceService'
import type { Response } from 'express'
import type { LicenceLocals } from '../utils/middleware'
import { asyncMiddleware } from '../utils/middleware'
import formConfig from './config/risk'
import { firstItem } from '../utils/functionalHelpers'

export default ({ licenceService }: { licenceService: LicenceService }) =>
  (router, audited) => {
    router.get('/riskManagement/:bookingId', asyncMiddleware(getStandard))
    router.get('/riskManagement/:action/:bookingId', asyncMiddleware(getStandard))

    function getStandard(req, res: Response<any, LicenceLocals>) {
      const { bookingId, action } = req.params
      const riskVersion = licenceService.getRiskVersion(res.locals.licence.licence)

      const data = firstItem(req.flash('userInput')) || res.locals.licence?.licence?.risk?.riskManagement || {}

      const viewData = {
        bookingId,
        data,
        action,
        version: riskVersion,
      }

      if (riskVersion === '1') {
        res.render(`risk/riskManagementV1`, viewData)
      } else {
        res.render(`risk/riskManagementV2`, viewData)
      }
    }

    router.post('/riskManagement/:bookingId', audited, asyncMiddleware(postStandard))
    router.post('/riskManagement/:action/:bookingId', audited, asyncMiddleware(postStandard))

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

    return router
  }
