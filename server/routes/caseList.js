const logger = require('../../log')
const { asyncMiddleware, authorisationMiddleware } = require('../utils/middleware')
const { links } = require('../config')

module.exports = ({ caseListService }) => (router) => {
  router.use(authorisationMiddleware)
  router.get('/', (req, res) => res.redirect('/caseList/active'))

  router.get(
    '/:tab',
    asyncMiddleware(async (req, res) => {
      logger.debug('GET /caseList')

      const { hdcEligible, message } = await caseListService.getHdcCaseList(
        res.locals.token,
        req.user.username,
        req.user.role,
        req.params.tab
      )

      return res.render('caseList/index', {
        hdcEligible,
        message,
        labels,
        tab: req.params.tab,
        globalSearchUrl: `${links.globalSearchUrl}?referrer=licences`,
        exitUrl: links.exitUrl,
      })
    })
  )

  return router
}

const labels = {
  ca: {
    'Not started': 'Start now',
    Eligible: 'Continue',
    'Address not suitable': 'Continue',
    'Address suitable': 'Continue',
    'Approved premises': 'Continue',
    Approved: 'Continue',
    'Licence created': 'Continue',
    'Presumed unsuitable': 'Change',
    'Opted out': 'Change',
    'BASS offer withdrawn': 'Change',
    'BASS request withdrawn': 'Change',
    Postponed: 'Change',
  },
  ro: {
    'Not started': 'Start now',
    'BASS request': 'Start now',
    'In progress': 'Continue',
  },
  dm: {
    'Not started': 'Start now',
    'Awaiting refusal': 'Start now',
    Postponed: 'View',
  },
}
