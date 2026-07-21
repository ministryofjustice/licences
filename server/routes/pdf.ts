import { Response } from 'express'
import logger from '../../log'
import { asyncMiddleware, LicenceLocals } from '../utils/middleware'
import { templates, templatesToChoose, templatesForNewOffence } from './config/pdf'
import versionInfo from '../utils/versionInfo'
import { firstItem, isEmpty } from '../utils/functionalHelpers'
import config from '../config'
import PdfService from '../services/pdfService'
import { PrisonerService } from '../services/prisonerService'
import { standardConditions as standardConditionsV4 } from '../services/config/conditions/standardConditions/v4/standardConditions'

const {
  apis: {
    gotenberg: { hdcUrl }
  },
  pdf: {
    licences: { pdfOptions }
  }
} = config

const standardConditionsV2ForTemplate = [
  {
    text: 'Be of good behaviour and not behave in a way which undermines the purpose of the licence period;'
  },
  {
    text: 'Not commit any offence;'
  },
  {
    text: 'Keep in touch with the supervising officer in accordance with instructions given by the supervising officer;'
  },
  {
    text: 'Receive visits from the supervising officer in accordance with instructions given by the supervising officer;'
  },
  {
    text: 'Reside permanently at an address approved by the supervising officer and obtain the prior permission of the supervising officer for any stay of one or more nights at a different address;'
  },
  {
    text: 'Not undertake work, or a particular type of work, unless it is approved by the supervising officer and notify the supervising officer in advance of any proposal to undertake work or a particular type of work;'
  },
  {
    text: 'Not travel outside the United Kingdom, the Channel Islands or the Isle of Man, except with the prior permission of the supervising officer or for the purposes of immigration deportation or removal;'
  },
  {
    text: 'Tell your supervising officer if you use a name which is different to the name or names which appear on your licence'
  },
  {
    text: 'Tell your supervising officer if you change or add any contact details, including phone number or email'
  }
]

export default (pdfService: PdfService, prisonerService: PrisonerService) => (router, audited) => {
  router.get(
    '/selectLicenceType/:bookingId',
    asyncMiddleware(async (req, res: Response<any, LicenceLocals>) => {
      const { bookingId } = req.params
      const prisoner = await prisonerService.getPrisonerPersonalDetails(bookingId, res.locals.token)
      const errors = firstItem(req.flash('errors')) || {}
      const template = res.locals.licence.licence?.document?.template

      return res.render('pdf/selectLicenceType', {
        bookingId,
        templates: templatesToChoose,
        prisoner,
        errors,
        licenceTemplateId: template?.decision,
        offenceCommittedBeforeFeb2015: template?.offenceCommittedBeforeFeb2015
      })
    })
  )

  router.post(
    '/selectLicenceType/:bookingId',
    audited,
    asyncMiddleware(async (req, res: Response<any, LicenceLocals>) => {
      const { bookingId } = req.params
      const { offenceBeforeCutoff, licenceTypeRadio } = req.body
      const { licence, postRelease } = res.locals

      if (isEmpty(offenceBeforeCutoff)) {
        req.flash('errors', { offenceBefore: 'Select yes or no' })
        return res.redirect(`/hdc/pdf/selectLicenceType/${bookingId}`)
      }

      if (
        (offenceBeforeCutoff === 'No' && !templatesForNewOffence.includes(licenceTypeRadio)) ||
        (offenceBeforeCutoff === 'Yes' && !templatesToChoose.map((t) => t.id).includes(licenceTypeRadio))
      ) {
        req.flash('errors', { licenceTypeRadioList: 'Select a licence type' })
        return res.redirect(`/hdc/pdf/selectLicenceType/${bookingId}`)
      }

      await pdfService.updateLicenceType(licence, bookingId, offenceBeforeCutoff, licenceTypeRadio, postRelease)

      return res.redirect(`/hdc/pdf/taskList/${bookingId}`)
    })
  )

  router.get(
    '/taskList/:bookingId',
    asyncMiddleware(async (req, res: Response<any, LicenceLocals>) => {
      const { bookingId } = req.params
      const { licence, token } = res.locals

      const templateName = licence.licence?.document?.template?.decision
      const templateLabel = getTemplateLabel(templateName)

      if (!templateLabel) {
        throw new Error(`Invalid licence template name: ${templateName}`)
      }

      const [prisoner, { missing }] = await Promise.all([
        prisonerService.getPrisonerPersonalDetails(bookingId, token),
        pdfService.getPdfLicenceData(bookingId, licence, token)
      ])

      const postRelease = prisoner.agencyLocationId ? prisoner.agencyLocationId.toUpperCase() === 'OUT' : false

      const incompleteGroupsFilter = postRelease
        ? (group) => missing[group].mandatory || missing[group].mandatoryPostRelease
        : (group) => missing[group].mandatory || missing[group].mandatoryPreRelease

      const incompleteGroups = Object.keys(missing).filter(incompleteGroupsFilter)

      const incompletePreferredGroups = Object.keys(missing).filter((group) => missing[group].preferred)

      const canPrint = !incompleteGroups || isEmpty(incompleteGroups)

      return res.render('pdf/createLicenceTaskList', {
        bookingId,
        missing,
        templateName,
        prisoner,
        incompleteGroups,
        incompletePreferredGroups,
        canPrint,
        postRelease,
        versionInfo: versionInfo(licence)
      })
    })
  )

  router.get(
    '/missing/:section/:bookingId',
    asyncMiddleware(async (req, res: Response<any, LicenceLocals>) => {
      const { bookingId, section } = req.params
      const { licence } = res.locals
      logger.debug(`GET pdf/missing/${section}/${bookingId}`)

      const templateName = licence.licence?.document?.template?.decision

      const [prisoner, { missing }] = await Promise.all([
        prisonerService.getPrisonerPersonalDetails(bookingId, res.locals.token),
        pdfService.getPdfLicenceData(bookingId, licence, res.locals.token)
      ])

      const data = {}

      return res.render(`pdf/missing/${section}`, {
        bookingId,
        missing,
        templateName,
        prisoner,
        data
      })
    })
  )

  router.get(
    '/create/:bookingId',
    audited,
    asyncMiddleware(async (req, res: Response<any, LicenceLocals>) => {
      const standardConditionsToUse = config.progressionModelPolicyStartDate.isActive()
        ? standardConditionsV4
        : standardConditionsV2ForTemplate
      const { bookingId } = req.params
      const { licence, postRelease, token } = res.locals
      logger.debug(`GET pdf/create/${bookingId}`)

      const templateName = licence.licence?.document?.template?.decision

      const updatedDecoratedLicence = await pdfService.checkAndTakeSnapshot(licence, bookingId)
      const pdfData = await pdfService.getPdfLicenceData(bookingId, updatedDecoratedLicence, token)

      const filename = `${pdfData.values.OFF_NOMS}.pdf`
      const headerHtml = getHeader(pdfData)
      const footerHtml = getFooter(pdfData, templateName)
      const qualifiedTemplateName = `${postRelease ? 'vary_' : ''}${templateName}`

      return res.renderPDF(
        `licences/${qualifiedTemplateName}`,
        { hdcUrl, standardConditionsToUse, ...pdfData.values },
        { filename, pdfOptions: { headerHtml, footerHtml, ...pdfOptions } }
      )
    })
  )

  return router
}

const licencePdfHeaderFooterStyle =
  'font-family: Arial; font-size: 10px; font-weight: bold; width: 100%; height: 15px; text-align: center; padding: 10px;'

function getHeader(pdfData) {
  return `
    <span style="${licencePdfHeaderFooterStyle}">
      <table style="width: 100%; padding-left: 30px;">
        <tr>
          <td style="text-align: center;">Name: ${pdfData.values.OFF_NAME}</td>
          <td style="text-align: center;">Prison no: ${pdfData.values.OFF_NOMS}</td>
          <td style="text-align: center;">Date of Birth: ${pdfData.values.OFF_DOB}</td>
        </tr>
      </table>
    </span>`
}

function getFooter(pdfData, templateName) {
  const templateLabel = getTemplateVersionLabel(templateName)
  return `
      <span style="${licencePdfHeaderFooterStyle}">
        Version: ${pdfData.values.VERSION_NUMBER}, ${pdfData.values.VERSION_DATE}
        <br/>
        Page <span class="pageNumber"></span> of <span class="totalPages"></span> - ${templateLabel}
      </span>`
}

function getTemplateLabel(templateName) {
  const templateConfig = templates.find((template) => template.id === templateName)
  return templateConfig?.label
}

function getTemplateVersionLabel(templateName) {
  const { label, version } = templates.find((template) => template.id === templateName)
  return [label, version].join(' v')
}
