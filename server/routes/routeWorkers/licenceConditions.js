const logger = require('../../../log');
const {getIn} = require('../../utils/functionalHelpers');

module.exports = ({formConfig, conditionsService, licenceService}) => {

    async function getStandard(req, res) {
        logger.debug('GET /standard/:bookingId');

        const {action, bookingId} = req.params;
        const conditions = await conditionsService.getStandardConditions();
        const data = getIn(res.locals.licence, ['licence', 'licenceConditions', 'standard']) || {};

        res.render('licenceConditions/standard', {action, bookingId, conditions, data});
    }

    async function getAdditional(req, res) {
        logger.debug('GET /additionalConditions');

        const {action, bookingId} = req.params;
        const licence = getIn(res.locals.licence, ['licence']);
        const bespokeConditions = getIn(licence, ['licenceConditions', 'bespoke']) || [];
        const conditions = await conditionsService.getAdditionalConditions(licence);

        res.render('licenceConditions/additionalConditions', {action, bookingId, conditions, bespokeConditions});
    }

    async function postAdditional(req, res) {
        logger.debug('POST /additionalConditions');
        const {bookingId, additionalConditions, bespokeDecision, bespokeConditions} = req.body;
        const {action} = req.params;
        const destination = action ? action + '/' + bookingId : bookingId;

        const bespoke = bespokeDecision === 'Yes' && bespokeConditions.filter(condition => condition.text) || [];
        const additional = await getAdditionalConditionsFrom(additionalConditions, req.body);

        if (!additional) {
            await licenceService.updateLicenceConditions(bookingId, {}, bespoke);
            return res.redirect('/hdc/licenceConditions/conditionsSummary/' + destination);
        }

        await licenceService.updateLicenceConditions(bookingId, additional, bespoke);

        res.redirect('/hdc/licenceConditions/conditionsSummary/' + destination);
    }

    function getAdditionalConditionsFrom(additionalConditions, input) {
        if (!additionalConditions) {
            return null;
        }
        return conditionsService.formatConditionInputs(input);
    }

    async function getConditionsSummary(req, res) {
        const {bookingId, action} = req.params;
        logger.debug('GET licenceConditions/conditionsSummary/:bookingId');

        const nextPath = formConfig.conditionsSummary.nextPath[action] || formConfig.conditionsSummary.nextPath.path;
        const licence = getIn(res.locals.licence, ['licence']) || {};
        const errorObject = licenceService.getConditionsErrors(licence);
        const data = await conditionsService.populateLicenceWithConditions(licence, errorObject);

        res.render(`licenceConditions/conditionsSummary`, {bookingId, data, nextPath, action});
    }

    async function postDelete(req, res) {
        logger.debug('POST /additionalConditions/delete');
        const {bookingId, conditionId} = req.body;
        const {action} = req.params;

        if (conditionId) {
            await licenceService.deleteLicenceCondition(bookingId, conditionId);
        }

        const destination = action ? action + '/' : '';

        res.redirect('/hdc/licenceConditions/conditionsSummary/' + destination + bookingId);
    }

    return {
        getStandard,
        getAdditional,
        postAdditional,
        getConditionsSummary,
        postDelete
    };
};
