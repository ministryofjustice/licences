const logger = require('../../log');
const {asyncMiddleware} = require('../utils/middleware');
const {globalSearchUrl} = require('../config').nomis;

module.exports = ({caseListService}) => router => {

    router.get('/', (req, res) => res.redirect('/caseList/active'));

    router.get('/:tab', asyncMiddleware(async (req, res) => {
        logger.debug('GET /caseList');

        const hdcEligible = await caseListService.getHdcCaseList(
            res.locals.token,
            req.user.username,
            req.user.role,
            req.params.tab
        );

        return res.render('caseList/index', {hdcEligible, labels, tab: req.params.tab, globalSearchUrl});
    }));

    return router;
};

const labels = {
    ca: {
        'Not started': 'Start now',
        'Checking eligibility': 'Continue',
        Eligible: 'Continue',
        'Getting address': 'Continue',
        'Address rejected': 'Continue',
        'Review case': 'Continue',
        'Create licence': 'Continue',
        'Licence created': 'Continue',
        'Licence updated': 'Continue',
        'Presumed unsuitable': 'Change',
        'Opted out': 'Change',
        'Address withdrawn': 'Change',
        'BASS offer withdrawn': 'Change',
        'BASS request withdrawn': 'Change',
        Postponed: 'Change'
    },
    ro: {
        'Address provided': 'Start now',
        'BASS request': 'Start now',
        'Checking address': 'Continue',
        'Assessment ongoing': 'Continue'
    },
    dm: {
        'Make decision': 'Start now',
        'Awaiting refusal': 'Start now',
        Postponed: 'Change'
    }
};
