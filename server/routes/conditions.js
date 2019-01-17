const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const logger = require('../../log');
const {getIn} = require('../utils/functionalHelpers');
const formConfig = require('./config/licenceConditions');

module.exports = ({licenceService, conditionsService}) => (router, audited) => {

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'licenceConditions'});

    router.get('/standard/:bookingId', getStandard);
    router.get('/standard/:action/:bookingId', getStandard);

    function getStandard(req, res) {
        logger.debug('GET /standard/:bookingId');

        const {action, bookingId} = req.params;
        const conditions = conditionsService.getStandardConditions();
        const data = getIn(res.locals.licence, ['licence', 'licenceConditions', 'standard']) || {};

        res.render('licenceConditions/standard', {action, bookingId, conditions, data});
    }

    router.get('/additionalConditions/:bookingId', getAdditional);
    router.get('/additionalConditions/:action/:bookingId', getAdditional);

    function getAdditional(req, res) {
        logger.debug('GET /additionalConditions');

        const {action, bookingId} = req.params;
        const licence = getIn(res.locals.licence, ['licence']);
        const bespokeConditions = getIn(licence, ['licenceConditions', 'bespoke']) || [];
        const conditions = conditionsService.getAdditionalConditions(licence);

        res.render('licenceConditions/additionalConditions', {action, bookingId, conditions, bespokeConditions});
    }

    router.post('/additionalConditions/:bookingId', audited, asyncMiddleware(postAdditional));
    router.post('/additionalConditions/:action/:bookingId', audited, asyncMiddleware(postAdditional));

    async function postAdditional(req, res) {
        logger.debug('POST /additionalConditions');
        const {bookingId, additionalConditions, bespokeDecision, bespokeConditions} = req.body;
        const {action} = req.params;
        const destination = action ? action + '/' + bookingId : bookingId;

        const bespoke = bespokeDecision === 'Yes' && bespokeConditions.filter(condition => condition.text) || [];
        const additional = getAdditionalConditionsFrom(additionalConditions, req.body);

        if (!additional) {
            await licenceService.updateLicenceConditions(bookingId, res.locals.licence, {}, bespoke);
            return res.redirect('/hdc/licenceConditions/conditionsSummary/' + destination);
        }

        await licenceService.updateLicenceConditions(bookingId, res.locals.licence, additional, bespoke);

        res.redirect('/hdc/licenceConditions/conditionsSummary/' + destination);
    }

    function getAdditionalConditionsFrom(additionalConditions, input) {
        if (!additionalConditions) {
            return null;
        }
        return conditionsService.formatConditionInputs(input);
    }

    router.get('/conditionsSummary/:bookingId', getConditionsSummary);
    router.get('/conditionsSummary/:action/:bookingId', getConditionsSummary);

    function getConditionsSummary(req, res) {
        const {bookingId, action} = req.params;
        logger.debug('GET licenceConditions/conditionsSummary/:bookingId');

        const nextPath = formConfig.conditionsSummary.nextPath[action] || formConfig.conditionsSummary.nextPath.path;
        const licence = getIn(res.locals.licence, ['licence']) || {};
        const additionaConditions = getIn(licence, ['licenceConditions', 'additional']) || {};
        const errorObject = licenceService.validateForm({
            formResponse: additionaConditions,
            pageConfig: formConfig.additional,
            formType: 'additional'});
        const data = conditionsService.populateLicenceWithConditions(licence, errorObject);

        res.render(`licenceConditions/conditionsSummary`, {bookingId, data, nextPath, action});
    }

    router.post('/additionalConditions/:bookingId/delete/:conditionId',
        audited, asyncMiddleware(postDelete));
    router.post('/additionalConditions/:action/:bookingId/delete/:conditionId',
        audited, asyncMiddleware(postDelete));

    async function postDelete(req, res) {
        logger.debug('POST /additionalConditions/delete');
        const {bookingId, conditionId} = req.body;
        const {action} = req.params;

        if (conditionId) {
            await licenceService.deleteLicenceCondition(bookingId, res.locals.licence, conditionId);
        }

        const destination = action ? action + '/' : '';

        res.redirect('/hdc/licenceConditions/conditionsSummary/' + destination + bookingId);
    }

    router.get('/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post));
    router.post('/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};


