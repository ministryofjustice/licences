const {getLicenceStatus} = require('../../utils/licenceStatus');
const formConfig = require('../config/licenceConditions');
const {getIn} = require('../../utils/functionalHelpers');

module.exports = ({conditionsService, licenceService, logger}) => {

    async function getStandard(req, res) {
        logger.debug('GET /standard/:bookingId');

        const bookingId = req.params.bookingId;
        const conditions = await conditionsService.getStandardConditions();
        const licenceStatus = getLicenceStatus(res.locals.licence);
        const data = getIn(res.locals.licence, ['licence', 'licenceConditions', 'standard']) || {};

        res.render('licenceConditions/standard', {bookingId, conditions, data, licenceStatus});
    }

    async function getAdditional(req, res) {
        logger.debug('GET /additionalConditions');

        const bookingId = req.params.bookingId;
        const licence = getIn(res.locals.licence, ['licence']);
        const bespokeConditions = getIn(licence, ['licenceConditions', 'bespoke']) || [];
        const conditions = await conditionsService.getAdditionalConditions(licence);
        const licenceStatus = getLicenceStatus(res.locals.licence);

        res.render('licenceConditions/additionalConditions', {bookingId, conditions, bespokeConditions, licenceStatus});
    }

    async function postAdditional(req, res) {
        logger.debug('POST /additionalConditions');
        const {bookingId, additionalConditions, bespokeDecision, bespokeConditions} = req.body;

        const bespoke = bespokeDecision === 'Yes' && bespokeConditions.filter(condition => condition.text) || [];
        const additional = await getAdditionalConditionsFrom(additionalConditions, req.body);

        if (!additional) {
            await licenceService.updateLicenceConditions(bookingId, {}, bespoke);
            return res.redirect('/hdc/licenceConditions/conditionsSummary/' + bookingId);
        }

        await licenceService.updateLicenceConditions(bookingId, additional, bespoke);

        res.redirect('/hdc/licenceConditions/conditionsSummary/' + bookingId);
    }

    function getAdditionalConditionsFrom(additionalConditions, input) {
        if (!additionalConditions) {
            return null;
        }
        return conditionsService.formatConditionInputs(input);
    }

    async function getConditionsSummary(req, res) {
        const {bookingId} = req.params;
        logger.debug('GET licenceConditions/conditionsSummary/:bookingId');

        const {nextPath} = formConfig.conditionsSummary;
        const licence = getIn(res.locals.licence, ['licence']) || {};
        const errorObject = licenceService.getConditionsErrors(licence);
        const data = await conditionsService.populateLicenceWithConditions(licence, errorObject);

        res.render(`licenceConditions/conditionsSummary`, {bookingId, data, nextPath});
    }

    async function postDeleteAdditionalCondition(req, res) {
        logger.debug('POST /additionalConditions/delete');
        const {bookingId, conditionId} = req.body;

        if (conditionId) {
            await licenceService.deleteLicenceCondition(bookingId, conditionId);
        }

        res.redirect('/hdc/licenceConditions/conditionsSummary/' + bookingId);
    }

    return {
        getStandard,
        getAdditional,
        postAdditional,
        getConditionsSummary,
        postDeleteAdditionalCondition
    };
};
