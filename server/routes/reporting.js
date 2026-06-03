const { asyncMiddleware } = require('../utils/middleware')
const createStandardRoutes = require('./routeWorkers/standard')
const formConfig = require('./config/reporting')
const { getPathFor } = require('../utils/routes')
const { getIn, isEmpty } = require('../utils/functionalHelpers')

module.exports =
  ({ licenceService }) =>
  (router, audited) => {
    const sectionName = 'reporting'
    const standard = createStandardRoutes({ formConfig, licenceService, sectionName })

    function get(req, res) {
      const { bookingId, action } = req.params
      const errorObject = req.flash('errors')[0] || {}
      const userInput = req.flash('userInput')[0] || {}
      return formGet(req, res, 'reportingInstructions', bookingId, errorObject, userInput, action)
    }

    function formGet(req, res, formName, bookingId, errorObject, userInput, action) {
      const { nextPath } = formConfig[formName]
      const rawData = getIn(res.locals.licence, ['licence', 'reporting', 'reportingInstructions']) || {}
      const data = Object.keys(userInput).length ? userInput : licenceService.addSplitDateFields(rawData, formConfig[formName].fields)
      const viewData = { bookingId, data, nextPath, errorObject, action, sectionName, formName }

      res.render('reporting/reportingInstructions', viewData)
    }

    async function post(req, res) {
      const { bookingId, action } = req.params
      return formPost(req, res, bookingId, action)
    }

    async function formPost(req, res, bookingId, action) {
      const formName = 'reportingInstructions'
      const nextPath = getPathFor({ data: req.body, config: formConfig[formName], action })

      const formData = licenceService.getFormResponse(formConfig[formName].fields, req.body) 

      if (formConfig[formName].validate) {
        const errors = standard.validationErrors(formData, formName, res)

        if (!isEmpty(errors)) {
          req.flash('errors', errors)
          req.flash('userInput', req.body)
          const actionPath = action ? `${action}/` : ''
          return res.redirect(`/hdc/reporting/${formName}/${actionPath}${bookingId}`)
        }
      }

      const updatedLicence = await licenceService.update({
        bookingId,
        originalLicence: res.locals.licence,
        config: formConfig[formName],
        userInput: req.body,
        licenceSection: sectionName,
        formName,
        postRelease: res.locals.postRelease,
      })

      await standard.pushStatus(updatedLicence, formName, bookingId, req.user.username)

      if (req.body.anchor) {
        return res.redirect(`${nextPath}${bookingId}#${req.body.anchor}`)
      }

      if (req.body.path) {
        return res.redirect(`${nextPath}${req.body.path}/${bookingId}`)
      }

      return res.redirect(`${nextPath}${bookingId}`)
    }

    router.get('/reportingInstructions/:bookingId', asyncMiddleware(get))
    router.post('/reportingInstructions/:bookingId', audited, asyncMiddleware(post))

    router.get('/:formName/:action/:bookingId', asyncMiddleware(standard.get))
    router.post('/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post))

    router.get('/:formName/:bookingId', asyncMiddleware(standard.get))
    router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

    return router
  }
