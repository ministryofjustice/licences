import moment from 'moment'
import logger from '../../log'
import { asyncMiddleware, LicenceLocals } from '../utils/middleware'
import config from '../config'
import { curfewAddressCheckFormFileName } from './utils/pdfUtils'
import { isEmpty, getIn } from '../utils/functionalHelpers'
import { Response, Router } from 'express'
import FormService from '../services/formService'

const {
  port,
  gotenberg: { hdcUrl },
  pdf: {
    forms: { formTemplates, formsDateFormat, pdfOptions },
  },
} = config

export default (formService: FormService) => (router: Router) => {
  router.get(
    '/curfewAddress/:bookingId',
    asyncMiddleware(async (req, res: Response<any, LicenceLocals>) => {
      const { bookingId } = req.params
      const {
        prisoner,
        licence: { licence },
        licenceStatus,
      } = res.locals

      const isBass = licenceStatus?.decisions?.bassReferralNeeded === true
      const isAp = licenceStatus?.decisions?.approvedPremisesRequired === true

      const pageData = await formService.getCurfewAddressCheckData({
        agencyLocationId: prisoner.agencyLocationId,
        licence,
        isBass,
        isAp,
        bookingId,
        token: res.locals.token,
      })

      const completionDate = moment().format(formsDateFormat)
      const filename = curfewAddressCheckFormFileName(prisoner)
      const approvedPremisesAddress =
        licence?.curfew?.approvedPremisesAddress || licence?.bassReferral?.approvedPremisesAddress || {}
      return res.renderPDF(
        'forms/curfewAddress',
        { ...pageData, approvedPremisesAddress, hdcUrl, port, completionDate },
        { filename, pdfOptions }
      )
    })
  )

  router.get(
    '/:templateName/:bookingId',
    asyncMiddleware(async (req, res: Response<any, LicenceLocals>) => {
      const { templateName, bookingId } = req.params
      const {
        licence: { licence },
        licenceStatus,
        prisoner,
      } = res.locals

      if (isEmpty(formTemplates[templateName])) {
        throw new Error(`unknown form template: ${templateName}`)
      }

      logger.info(`Render PDF for form '${templateName}'`)

      const isBass = licenceStatus?.decisions?.bassReferralNeeded === true
      const isAp = licenceStatus?.decisions?.approvedPremisesRequired === true

      try {
        const [pageData, curfewData] = await Promise.all([
          formService.getTemplateData(templateName, licence, prisoner),
          formService.getCurfewAddressCheckData({
            agencyLocationId: prisoner.agencyLocationId,
            licence,
            isBass,
            isAp,
            bookingId,
            token: res.locals.token,
          }),
        ])

        const filename = `${prisoner.offenderNo}.pdf`
        const pdf = res.renderPDF(
          `forms/${templateName}`,
          { ...pageData, ...curfewData, hdcUrl },
          { filename, pdfOptions }
        )

        logger.info(`Returning rendered PDF for form '${templateName}'`)
        return pdf
      } catch (e) {
        logger.warn(`Caught an exception while rendering form ${templateName}: ${e}`)
        throw e
      }
    })
  )

  router.get(
    '/:bookingId',
    asyncMiddleware(async (req, res: Response<any, LicenceLocals>) => {
      const { bookingId } = req.params
      return res.render('forms/all', { bookingId, forms: Object.entries(formTemplates) })
    })
  )

  return router
}
