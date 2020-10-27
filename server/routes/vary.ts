import { asyncMiddleware } from '../utils/middleware'
import createStandardRoutes from './routeWorkers/standard'
import { firstItem, getFieldName, getIn, isEmpty, lastItem, pickBy, selectPathsFrom } from '../utils/functionalHelpers'
import formConfig from './config/vary'
import { LicenceService } from '../services/licenceService'
import { PrisonerService } from '../../types/licences'
import { Licence } from '../data/licenceTypes'
import { pickCurfewAddress } from '../services/utils/pdfFormatter'

const expectedFieldsForForm = {
  address: ['addressLine1', 'addressLine2', 'addressTown', 'postCode', 'telephone'],
  reportingAddress: [
    'reportingContact',
    'reportingAddressLine1',
    'reportingAddressLine2',
    'reportingAddressTown',
    'reportingPostCode',
    'reportingTelephone',
  ],
}

/**
 * The data for the varyAddress form can come from one of four locations within the licence object.
 * The pickCurfewAddress function from the pdfFormatter module returns the address that will be printed on a PDF licence.
 */
function extractFormData(formName: string, licence: Licence, licencePosition: string[]) {
  if (formName === 'varyAddress') {
    return pickCurfewAddress(selectPathsFrom(licence))
  }
  return getIn(licence, licencePosition)
}

function mapFromLicenceDataToFormData(licence: Licence, formName: string, licencePosition: string[]) {
  const formData = extractFormData(formName, licence, licencePosition)
  return renameKeysForForm(formData, formName) || {}
}

// eslint-disable-next-line import/prefer-default-export
export const varyRouter = ({
  licenceService,
  prisonerService,
}: {
  licenceService: LicenceService
  prisonerService: PrisonerService
}) => (router, audited) => {
  const standard = createStandardRoutes({ formConfig, licenceService, sectionName: 'vary' })

  router.get(
    '/licenceDetails/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params
      // page should only be viewed if no licence
      if (res.locals?.licenceStatus?.tasks?.curfewAddress !== 'UNSTARTED') {
        return res.redirect(`/hdc/taskList/${bookingId}`)
      }

      const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, res.locals.token)
      const errorObject = firstItem(req.flash('errors')) || {}
      const userInput = firstItem(req.flash('userInput')) || {}

      return res.render('vary/licenceDetails', {
        prisonerInfo,
        bookingId,
        errorObject,
        userInput,
      })
    })
  )

  router.post(
    '/licenceDetails/:bookingId',
    audited,
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.body

      const expectedFields = formConfig.licenceDetails.fields.map(getFieldName)
      const inputForExpectedFields = pickBy((val, key) => expectedFields.includes(key), req.body)
      const errors = licenceService.validateForm({
        formResponse: inputForExpectedFields,
        pageConfig: formConfig.licenceDetails,
      })

      if (!isEmpty(errors)) {
        req.flash('errors', errors)
        req.flash('userInput', inputForExpectedFields)
        return res.redirect(`/hdc/vary/licenceDetails/${bookingId}`)
      }

      await licenceService.createLicenceFromFlatInput(
        req.body,
        bookingId,
        res.locals.licence.licence,
        formConfig.licenceDetails,
        true
      )
      const nextPath = req.body.additionalConditions === 'Yes' ? 'licenceConditions/additionalConditions' : 'taskList'
      return res.redirect(`/hdc/${nextPath}/${bookingId}`)
    })
  )

  const getVaryForm = (formName, licencePosition) => (req, res) => {
    const { bookingId } = req.params
    const errorObject = firstItem(req.flash('errors')) || {}
    const userInput =
      firstItem(req.flash('userInput')) ||
      mapFromLicenceDataToFormData(res.locals?.licence?.licence, formName, licencePosition)

    res.render(`vary/${formName}`, {
      errorObject,
      userInput,
      bookingId,
    })
  }

  router.get('/address/:bookingId', getVaryForm('varyAddress', ['proposedAddress', 'curfewAddress']))

  router.get(
    '/reportingAddress/:bookingId',
    getVaryForm('varyReportingAddress', ['reporting', 'reportingInstructions'])
  )

  const postVaryForm = (formName) => async (req, res) => {
    const { bookingId } = req.body
    const expectedFields = expectedFieldsForForm[formName]
    const inputForExpectedFields = pickBy((val, key) => expectedFields.includes(key), req.body)
    const expectedFieldsConfig = formConfig.licenceDetails.fields.filter((field) =>
      expectedFields.includes(getFieldName(field))
    )

    const errors = licenceService.validateForm({
      formResponse: inputForExpectedFields,
      pageConfig: { fields: expectedFieldsConfig },
    })

    if (!isEmpty(errors)) {
      req.flash('errors', errors)
      req.flash('userInput', inputForExpectedFields)
      return res.redirect(`/hdc/vary/${formName}/${bookingId}`)
    }

    await licenceService.createLicenceFromFlatInput(
      req.body,
      bookingId,
      res.locals.licence.licence,
      formConfig.licenceDetails,
      true
    )
    return res.redirect(`/hdc/taskList/${bookingId}`)
  }

  router.post('/address/:bookingId', audited, asyncMiddleware(postVaryForm('address')))
  router.post('/reportingAddress/:bookingId', audited, asyncMiddleware(postVaryForm('reportingAddress')))

  router.get('/:formName/:bookingId', asyncMiddleware(standard.get))
  router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

  router.get('/:formName/:action/:bookingId', asyncMiddleware(standard.get))
  router.post('/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post))

  return router
}

function renameKeysForForm(licenceObject, formName) {
  // some vary form field names are not the same as their licence field name
  if (isEmpty(licenceObject)) {
    return licenceObject
  }

  if (formName !== 'varyReportingAddress') {
    return licenceObject
  }

  return expectedFieldsForForm.reportingAddress.reduce((userInput, uiKey) => {
    const formFieldConfig = formConfig.licenceDetails.fields.find((field) => getFieldName(field) === uiKey)
    const licenceFieldName = lastItem(formFieldConfig[uiKey].licencePosition)

    return {
      ...userInput,
      [uiKey]: licenceObject[licenceFieldName],
    }
  }, {})
}
