const { asyncMiddleware } = require('../utils/middleware')
const { getIn, firstItem, isEmpty, pickBy, getFieldName } = require('../utils/functionalHelpers')
const logger = require('../../log')
const formConfig = require('./config/approval')
const { getPathFor } = require('../utils/routes')

module.exports = ({ licenceService, prisonerService, nomisPushService, signInService }) => (
  router,
  audited,
  { pushToNomis }
) => {
  router.get('/release/:bookingId', asyncMiddleware(approvalGets('release')))
  router.get('/refuseReason/:bookingId', asyncMiddleware(approvalGets('refuseReason')))

  function approvalGets(formName) {
    return async (req, res) => {
      logger.debug(`GET /approval/${formName}/`)

      const { bookingId } = req.params
      const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, res.locals.token)

      const { nextPath, pageDataMap } = formConfig[formName]
      const dataPath = pageDataMap || ['licence', 'approval', 'release']
      const data = firstItem(req.flash('userInput')) || getIn(res.locals.licence, dataPath) || {}
      const errorObject = firstItem(req.flash('errors')) || {}

      res.render(`approval/${formName}`, {
        prisonerInfo,
        bookingId,
        data,
        nextPath,
        errorObject,
      })
    }
  }

  router.post(
    '/:formName/:bookingId',
    audited,
    asyncMiddleware(async (req, res) => {
      const { formName, bookingId } = req.params

      const expectedFields = formConfig[formName].fields.map(getFieldName)
      const inputForExpectedFields = pickBy((val, key) => expectedFields.includes(key), req.body)
      const errors = licenceService.validateForm({
        formResponse: inputForExpectedFields,
        pageConfig: formConfig[formName],
        formType: formName,
        bespokeConditions: {
          confiscationOrder: res.locals.licenceStatus.decisions.confiscationOrder,
        },
      })

      if (!isEmpty(errors)) {
        req.flash('errors', errors)
        req.flash('userInput', inputForExpectedFields)
        return res.redirect(`/hdc/approval/${formName}/${bookingId}`)
      }

      const updatedLicence = await licenceService.update({
        bookingId,
        originalLicence: res.locals.licence,
        config: formConfig[formName],
        userInput: req.body,
        licenceSection: 'approval',
        formName: 'release',
        postRelease: res.locals.postRelease,
      })

      if (pushToNomis) {
        const systemToken = await signInService.getClientCredentialsTokens(req.user.username)
        await nomisPushService.pushStatus(
          bookingId,
          { approval: getIn(updatedLicence, ['approval', 'release', 'decision']) },
          systemToken
        )
      }

      const nextPath = getPathFor({ data: req.body, config: formConfig[formName] })
      res.redirect(`${nextPath}${bookingId}`)
    })
  )

  return router
}
