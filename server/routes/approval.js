const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const {getIn, firstItem} = require('../utils/functionalHelpers');
const logger = require('../../log');
const formConfig = require('./config/approval');

module.exports = ({licenceService, prisonerService}) => (router, audited) => {

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'approval'});

    router.get('/approval/release/:bookingId', asyncMiddleware(approvalGets('release')));
    router.get('/approval/refuseReason/:bookingId', asyncMiddleware(approvalGets('refuseReason')));

    function approvalGets(formName) {
        return async (req, res) => {
            logger.debug(`GET /approval/${formName}/`);

            const {bookingId} = req.params;
            const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, req.user.token);

            const {nextPath, pageDataMap} = formConfig[formName];
            const dataPath = pageDataMap || ['licence', 'approval', 'release'];
            const data = getIn(res.locals.licence, dataPath) || {};
            const errors = firstItem(req.flash('errors'));
            const errorObject = getIn(errors, ['approval', 'release']) || {};

            res.render(`approval/${formName}`, {
                prisonerInfo,
                bookingId,
                data,
                nextPath,
                errorObject
            });
        };
    }

    router.post('/approval/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};


