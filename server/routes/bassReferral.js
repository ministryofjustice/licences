const { asyncMiddleware } = require('../utils/middleware')
const createStandardRoutes = require('./routeWorkers/standard')
const formConfig = require('./config/bassReferral')
const { getIn, firstItem, mergeWithRight, isYes } = require('../utils/functionalHelpers')
const recordList = require('../services/utils/recordList')

module.exports = ({ licenceService, nomisPushService }) => (router, audited, pushToNomis) => {
  const standard = createStandardRoutes({ formConfig, licenceService, sectionName: 'bassReferral' })

  router.post('/rejected/:bookingId', audited, asyncMiddleware(reject('area', 'rejected')))
  router.post('/unsuitable/:bookingId', audited, asyncMiddleware(reject('offender', 'unsuitable')))

  function reject(reason, type) {
    return async (req, res) => {
      const { bookingId } = req.params
      const { enterAlternative } = req.body
      const { licence } = res.locals.licence

      await licenceService.rejectBass(licence, bookingId, enterAlternative, reason)

      const nextPath = formConfig[type].nextPath.decisions[enterAlternative]
      return res.redirect(`${nextPath}${bookingId}`)
    }
  }

  router.get('/approvedPremisesChoice/:bookingId', asyncMiddleware(getChoice))
  function getChoice(req, res) {
    const { bookingId } = req.params
    const { licence } = res.locals
    const data = { decision: getApprovedPremisesChoice(getIn(licence, ['licence'])) }
    const viewData = { data, errorObject: {}, bookingId }

    return res.render('bassReferral/approvedPremisesChoice', viewData)
  }

  function getApprovedPremisesChoice(licence) {
    if (isYes(licence, ['proposedAddress', 'optOut', 'decision'])) {
      return 'OptOut'
    }

    if (isYes(licence, ['bassReferral', 'bassAreaCheck', 'approvedPremisesRequiredYesNo'])) {
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

      const bassReferral = getIn(licence, ['licence', 'bassReferral'])
      const newCurfew = mergeWithRight(bassReferral, approvedPremisesContents[decision])

      const proposedAddress = getIn(licence, ['licence', 'proposedAddress'])
      const newProposedAddress = mergeWithRight(proposedAddress, proposedAddressContents[decision])

      await Promise.all([
        licenceService.updateSection('proposedAddress', bookingId, newProposedAddress),
        licenceService.updateSection('bassReferral', bookingId, newCurfew),
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
    OptOut: { bassAreaCheck: { bassAreaCheckSeen: null, bassAreaReason: null, approvedPremisesRequiredYesNo: null } },
    ApprovedPremises: { bassAreaCheck: { approvedPremisesRequiredYesNo: 'Yes' } },
  }

  const proposedAddressContents = {
    OptOut: { optOut: { decision: 'Yes' } },
    ApprovedPremises: { optOut: { decision: 'No' } },
  }

  router.get(
    '/bassOffer/:bookingId',
    asyncMiddleware(async (req, res) => {
      const formName = 'bassOffer'
      const sectionName = 'bassReferral'

      const { bookingId, action } = req.params
      const { licenceStatus } = res.locals

      const { licenceSection, pageDataMap } = formConfig[formName]
      const dataPath = pageDataMap || ['licence', sectionName, licenceSection]

      const data = getIn(res.locals.licence, dataPath) || {}
      const withdrawnBass = licenceStatus.decisions.bassWithdrawn ? getBassRejections(res.locals.licence).last() : {}

      const errorObject = firstItem(req.flash('errors')) || {}

      const viewData = { bookingId, action, data, withdrawnBass, licenceStatus, errorObject }

      res.render('bassReferral/bassOffer', viewData)
    })
  )

  router.post(
    '/bassOffer/withdraw/:bookingId',
    audited,
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params
      const { withdrawalType } = req.body
      const { licence } = res.locals.licence

      await licenceService.withdrawBass(licence, bookingId, withdrawalType)

      const nextPath = formConfig.bassOffer.nextPath.withdraw
      res.redirect(`${nextPath}${bookingId}`)
    })
  )

  router.post(
    '/bassOffer/reinstate/:bookingId',
    audited,
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params
      const { licence } = res.locals.licence

      await licenceService.reinstateBass(licence, bookingId)

      const nextPath = formConfig.bassOffer.nextPath.reinstate
      res.redirect(`${nextPath}${bookingId}`)
    })
  )

  router.get('/:formName/:action/:bookingId', asyncMiddleware(standard.get))
  router.post('/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post))

  router.get('/:formName/:bookingId', asyncMiddleware(standard.get))
  router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

  function getBassRejections(licence) {
    return recordList({ licence, path: ['licence', 'bassRejections'], allowEmpty: true })
  }

  return router
}
