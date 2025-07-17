import moment from 'moment'
const path = require('path')
import logger from '../../log'
import { asyncMiddleware, LicenceLocals } from '../utils/middleware'
import config from '../config'
import { curfewAddressCheckFormFileName } from './utils/pdfUtils'
import { isEmpty, getIn } from '../utils/functionalHelpers'
import FormService from '../services/formService'
import { Response } from 'express'
import { ConditionsServiceFactory } from '../services/conditionsService'

const {
  port,
  gotenberg: { hdcUrl },
  pdf: {
    forms: {
      formTemplates,
      formsDateFormat,
      eligibilityAndSuitabilityFormTemplates,
      addressChecksFormTemplates,
      applicationOutcomeFormTemplates,
      licenceVariationFormTemplates,
      pdfOptions,
    },
  },
  pdfFormatForms,
} = config

export default (formService: FormService, conditionsServiceFactory: ConditionsServiceFactory) => (router) => {
  router.get(
    '/curfewAddress/:bookingId',
    asyncMiddleware(async (req, res: Response<any, LicenceLocals>) => {
      const { bookingId } = req.params
      const { prisoner, licence: licenceRecord, licenceStatus } = res.locals

      const { licence } = licenceRecord
      const isBass = getIn(licenceStatus, ['decisions', 'bassReferralNeeded']) === true
      const isAp = getIn(licenceStatus, ['decisions', 'approvedPremisesRequired']) === true

      const conditions = conditionsServiceFactory.forLicence(licenceRecord).getFullTextForApprovedConditions(licence)

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
        getIn(licence, ['curfew', 'approvedPremisesAddress']) ||
        getIn(licence, ['bassReferral', 'approvedPremisesAddress']) ||
        {}
      return res.renderPDF(
        'forms/curfewAddress',
        { ...pageData, conditions, approvedPremisesAddress, hdcUrl, port, completionDate },
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

      if (pdfFormatForms.includes(templateName)) {
        logger.info(`Returning pdf document for the '${templateName}' form`)
        return res.sendFile(path.join(__dirname, `../views/forms/downloads/${templateName}.pdf`))
      }

      logger.info(`Render PDF for form '${templateName}'`)

      const isBass = getIn(licenceStatus, ['decisions', 'bassReferralNeeded']) === true
      const isAp = getIn(licenceStatus, ['decisions', 'approvedPremisesRequired']) === true

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
      return res.render('forms/all', {
        bookingId,
        eligibilityAndSuitabilityForms: Object.entries(eligibilityAndSuitabilityFormTemplates),
        addressChecksForms: Object.entries(addressChecksFormTemplates),
        applicationOutcomeForms: Object.entries(applicationOutcomeFormTemplates),
        licenceVariationForms: Object.entries(licenceVariationFormTemplates),
      })
    })
  )

  return router
}
