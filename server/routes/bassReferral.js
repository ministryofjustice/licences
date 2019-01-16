const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const formConfig = require('./config/bassReferral');
const {getIn, firstItem} = require('../utils/functionalHelpers');
const recordList = require('../services/utils/recordList');

module.exports = ({licenceService}) => (router, audited) => {

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'bassReferral'});

    router.post('/rejected/:bookingId', audited, asyncMiddleware(reject('area', 'rejected')));
    router.post('/unsuitable/:bookingId', audited, asyncMiddleware(reject('offender', 'unsuitable')));

    function reject(reason, type) {
        return async (req, res) => {
            const {bookingId} = req.params;
            const {enterAlternative} = req.body;
            const {licence} = res.locals.licence;

            await licenceService.rejectBass(licence, bookingId, enterAlternative, reason);

            const nextPath = formConfig[type].nextPath.decisions[enterAlternative];
            return res.redirect(`${nextPath}${bookingId}`);
        };
    }

    router.get('/bassOffer/:bookingId', asyncMiddleware(async (req, res) => {

        const formName = 'bassOffer';
        const sectionName = 'bassReferral';

        const {bookingId, action} = req.params;
        const licenceStatus = res.locals.licenceStatus;

        const {licenceSection, pageDataMap} = formConfig[formName];
        const dataPath = pageDataMap || ['licence', sectionName, licenceSection];

        const data = getIn(res.locals.licence, dataPath) || {};
        const withdrawnBass = licenceStatus.decisions.bassWithdrawn ? getBassRejections(res.locals.licence).last() : {};

        const errorObject = firstItem(req.flash('errors')) || {};

        const viewData = {bookingId, action, data, withdrawnBass, licenceStatus, errorObject};

        res.render('bassReferral/bassOffer', viewData);
    }));

    router.post('/bassOffer/withdraw/:bookingId', audited, asyncMiddleware(async (req, res) => {

        const {bookingId} = req.params;
        const {withdrawalType} = req.body;
        const {licence} = res.locals.licence;

        await licenceService.withdrawBass(licence, bookingId, withdrawalType);

        const nextPath = formConfig['bassOffer'].nextPath.withdraw;
        res.redirect(`${nextPath}${bookingId}`);
    }));

    router.post('/bassOffer/reinstate/:bookingId', audited, asyncMiddleware(async (req, res) => {

        const {bookingId} = req.params;
        const {licence} = res.locals.licence;

        await licenceService.reinstateBass(licence, bookingId);

        const nextPath = formConfig['bassOffer'].nextPath.reinstate;
        res.redirect(`${nextPath}${bookingId}`);
    }));

    router.get('/:formName/:action/:bookingId', asyncMiddleware(standard.get));
    router.post('/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post));

    router.get('/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    function getBassRejections(licence) {
        return recordList({licence, path: ['licence', 'bassRejections'], allowEmpty: true});
    }

    return router;
};
