const { asyncMiddleware } = require('../utils/middleware')
const createStandardRoutes = require('./routeWorkers/standard')
const { getPathFor } = require('../utils/routes')
const { getIn, mergeWithRight, isYes } = require('../utils/functionalHelpers')
const formConfig = require('./config/curfew')
const { isPostApproval } = require('../services/config/licenceStage')

module.exports =
  ({ licenceService, nomisPushService }) =>
  (router, audited, { pushToNomis }) => {
    const standard = createStandardRoutes({ formConfig, licenceService, sectionName: 'curfew' })

    router.get('/approvedPremises/:bookingId', addressReviewGets('approvedPremises'))
    router.get('/approvedPremises/:action/:bookingId', addressReviewGets('approvedPremises'))

    router.get('/approvedPremisesChoice/:action/:bookingId', asyncMiddleware(getChoice))
    router.get('/approvedPremisesChoice/:bookingId', asyncMiddleware(getChoice))

    function getChoice(req, res) {
      const { bookingId } = req.params
      const { licence } = res.locals
      const data = { decision: getApprovedPremisesChoice(getIn(licence, ['licence'])) }
      const viewData = { data, errorObject: {}, bookingId }

      return res.render('curfew/approvedPremisesChoice', viewData)
    }

    function getApprovedPremisesChoice(licence) {
      if (isYes(licence, ['proposedAddress', 'optOut', 'decision'])) {
        return 'OptOut'
      }

      if (isYes(licence, ['curfew', 'approvedPremises', 'required'])) {
        return 'ApprovedPremises'
      }

      return null
    }

    router.post(
      '/approvedPremisesChoice/:bookingId',
      audited,
      asyncMiddleware(async (req, res) => {
        const { bookingId } = req.params
        const { decision } = req.body
        const { licence } = res.locals

        const curfew = getIn(licence, ['licence', 'curfew'])
        const newCurfew = mergeWithRight(curfew, approvedPremisesContents[decision])

        const proposedAddress = getIn(licence, ['licence', 'proposedAddress'])
        const newProposedAddress = mergeWithRight(proposedAddress, proposedAddressContents[decision])

        await Promise.all([
          licenceService.updateSection('proposedAddress', bookingId, newProposedAddress),
          licenceService.updateSection('curfew', bookingId, newCurfew),
        ])

        if (pushToNomis && decision === 'OptOut') {
          await nomisPushService.pushStatus({
            bookingId,
            data: { type: 'optOut', status: 'Yes' },
            username: req.user.username,
          })
        }

        const nextPath = formConfig.approvedPremisesChoice.nextPath[decision] || `/hdc/taskList/`

        return res.redirect(`${nextPath}${bookingId}`)
      })
    )

    const approvedPremisesContents = {
      OptOut: { approvedPremises: { required: 'No' } },
      ApprovedPremises: { approvedPremises: { required: 'Yes' } },
    }

    const proposedAddressContents = {
      OptOut: { optOut: { decision: 'Yes' } },
      ApprovedPremises: { optOut: { decision: 'No' } },
    }

    router.get('/curfewAddressReview/:bookingId', addressReviewGets('curfewAddressReview'))
    router.get('/curfewAddressReview/:action/:bookingId', addressReviewGets('curfewAddressReview'))

    function addressReviewGets(formName) {
      return (req, res) => {
        const { action, bookingId } = req.params

        const proposedAddress = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress'])
        const data = getIn(res.locals.licence, ['licence', 'curfew', formName]) || {}
        const { nextPath } = formConfig[formName]

        res.render(`curfew/${formName}`, { bookingId, data, proposedAddress, nextPath, action })
      }
    }

    router.post('/curfewAddressReview/:bookingId', audited, asyncMiddleware(addressReviewPosts('curfewAddressReview')))
    router.post(
      '/curfewAddressReview/:action/:bookingId',
      audited,
      asyncMiddleware(addressReviewPosts('curfewAddressReview'))
    )

    function addressReviewPosts(formName) {
      return (req, res) => {
        const { action, bookingId } = req.params
        const { licence } = res.locals

        const modifyAction = !action && isPostApproval(licence.stage) ? 'modify' : action

        standard.formPost(req, res, formName, bookingId, modifyAction)
      }
    }

    router.post('/withdrawAddress/:bookingId', audited, asyncMiddleware(addressWithdrawalPosts('withdrawAddress')))
    router.post('/withdrawConsent/:bookingId', audited, asyncMiddleware(addressWithdrawalPosts('withdrawConsent')))

    function addressWithdrawalPosts(formName) {
      return async (req, res) => {
        const { action, bookingId } = req.params
        const { licence, stage } = res.locals.licence

        await licenceService.rejectProposedAddress(licence, bookingId, formName)

        const modifyAction = !action && isPostApproval(stage) ? 'modify' : action

        const nextPath = getPathFor({
          data: req.body,
          config: formConfig[formName],
          action: modifyAction,
        })

        res.redirect(`${nextPath}${bookingId}`)
      }
    }

    router.post(
      '/reinstateAddress/:bookingId',
      audited,
      asyncMiddleware(async (req, res) => {
        const { action, bookingId } = req.params
        const { licence, stage } = res.locals.licence

        await licenceService.reinstateProposedAddress(licence, bookingId)

        const modifyAction = !action && isPostApproval(stage) ? 'modify' : action

        const nextPath = getPathFor({
          data: req.body,
          config: formConfig.reinstateAddress,
          action: modifyAction,
        })

        res.redirect(`${nextPath}${bookingId}`)
      })
    )

    router.post(
      '/curfewHours/:bookingId',
      audited,
      asyncMiddleware(async (req, res) => {
        const { bookingId } = req.params
        const nextPath = getPathFor({ data: req.body, config: formConfig.curfewHours })

        const input = licenceService.addCurfewHoursInput(req.body)
        await licenceService.update({
          bookingId,
          originalLicence: res.locals.licence,
          config: formConfig.curfewHours,
          userInput: input,
          licenceSection: 'curfew',
          formName: 'curfewHours',
          postRelease: res.locals.postRelease,
        })

        res.redirect(`${nextPath}${bookingId}`)
      })
    )

    router.get('/:formName/:bookingId', asyncMiddleware(standard.get))
    router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

    router.get('/:formName/:action/:bookingId', asyncMiddleware(standard.get))
    router.post('/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post))

    return router
  }
