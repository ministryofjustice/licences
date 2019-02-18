const { asyncMiddleware } = require('../utils/middleware')
const createStandardRoutes = require('./routeWorkers/standard')
const { pickBy, getFieldName, isEmpty, firstItem, getIn, lastItem } = require('../utils/functionalHelpers')
const formConfig = require('./config/vary')

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

module.exports = ({ licenceService, prisonerService }) => (router, audited) => {
    const standard = createStandardRoutes({ formConfig, licenceService, sectionName: 'vary' })

    router.get(
        '/licenceDetails/:bookingId',
        asyncMiddleware(async (req, res) => {
            const { bookingId } = req.params
            // page should only be viewed if no licence
            if (res.locals.licenceStatus.tasks.curfewAddress !== 'UNSTARTED') {
                return res.redirect(`/hdc/taskList/${bookingId}`)
            }

            const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, res.locals.token)
            const errorObject = firstItem(req.flash('errors')) || {}
            const userInput = firstItem(req.flash('userInput')) || {}

            res.render('vary/licenceDetails', {
                prisonerInfo,
                bookingId,
                errorObject,
                userInput,
            })
        })
    )

    router.post(
        '/licenceDetails/:bookingId',
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
            const nextPath =
                req.body.additionalConditions === 'Yes' ? 'licenceConditions/additionalConditions' : 'taskList'
            res.redirect(`/hdc/${nextPath}/${bookingId}`)
        })
    )

    const getVaryForm = (formName, licencePosition) => (req, res) => {
        const { bookingId } = req.params
        const errorObject = firstItem(req.flash('errors')) || {}
        const userInput =
            firstItem(req.flash('userInput')) ||
            renameKeysForForm(getIn(res.locals.licence, ['licence', ...licencePosition]), formName) ||
            {}

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

    const postVaryForm = formName => async (req, res) => {
        const { bookingId } = req.body
        const expectedFields = expectedFieldsForForm[formName]
        const inputForExpectedFields = pickBy((val, key) => expectedFields.includes(key), req.body)
        const expectedFieldsConfig = formConfig.licenceDetails.fields.filter(field =>
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
        res.redirect(`/hdc/taskList/${bookingId}`)
    }

    router.post('/address/:bookingId', asyncMiddleware(postVaryForm('address')))
    router.post('/reportingAddress/:bookingId', asyncMiddleware(postVaryForm('reportingAddress')))

    router.get('/:formName/:bookingId', asyncMiddleware(standard.get))
    router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

    router.get('/:formName/:action/:bookingId', asyncMiddleware(standard.get))
    router.post('/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post))

    return router
}

function renameKeysForForm(licenceObject, formName) {
    // some vary form field names are not the same as their licence field name
    if (isEmpty(licenceObject) || formName !== 'varyReportingAddress') {
        return licenceObject
    }
    return expectedFieldsForForm.reportingAddress.reduce((userInput, uiKey) => {
        const formFieldConfig = formConfig.licenceDetails.fields.find(field => getFieldName(field) === uiKey)
        const licenceFieldName = lastItem(formFieldConfig[uiKey].licencePosition)

        return {
            ...userInput,
            [uiKey]: licenceObject[licenceFieldName],
        }
    }, {})
}
