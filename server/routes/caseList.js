const logger = require('../../log')
const { asyncMiddleware } = require('../utils/middleware')
const { globalSearchUrl } = require('../config').nomis

module.exports = ({ caseListService }) => router => {
  router.get('/', (req, res) => res.redirect('/caseList/active'))

  router.get(
    '/:tab',
    asyncMiddleware(async (req, res) => {
      logger.debug('GET /caseList')

      const hdcEligible = await caseListService.getHdcCaseList(
        res.locals.token,
        req.user.username,
        req.user.role,
        req.params.tab
      )

      return res.render('caseList/index', {
        hdcEligible,
        labels,
        tab: req.params.tab,
        globalSearchUrl: `${globalSearchUrl}?referrer=licences`,
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
    Postponed: 'Change',
  },
}
