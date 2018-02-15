const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');
const {getIn} = require('../utils/functionalHelpers');
const licenceConditionsConfig = require('./config/licenceConditions');
const eligibilityConfig = require('./config/eligibility');
const proposedAddressConfig = require('./config/proposedAddress');
const curfewConfig = require('./config/curfew');
const reporting = require('./config/reporting');
const {getPathFor} = require('../utils/routes');
const riskConfig = require('./config/risk');
const formConfig = {
    ...licenceConditionsConfig,
    ...eligibilityConfig,
    ...proposedAddressConfig,
    ...curfewConfig,
    ...riskConfig,
    ...reporting
};

module.exports = function({logger, licenceService, conditionsService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    // bespoke routes

    router.get('/licenceConditions/standard/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /standard/:nomisId');

        const nomisId = req.params.nomisId;
        const conditions = await conditionsService.getStandardConditions();

        const rawLicence = await licenceService.getLicence(nomisId);
        const data = getIn(rawLicence, ['licence', 'licenceConditions', 'standard']) || {};

        res.render('licenceConditions/standardForm', {nomisId, conditions, data});
    }));

    router.get('/licenceConditions/additionalConditions/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /additionalConditions');

        const nomisId = req.params.nomisId;
        const existingLicence = await licenceService.getLicence(req.params.nomisId);
        const licence = getIn(existingLicence, ['licence']);
        const bespokeConditions = getIn(existingLicence, ['licence', 'licenceConditions', 'bespoke']) || [];
        const conditions = await conditionsService.getAdditionalConditions(licence);

        res.render('licenceConditions/additionalConditionsForm', {nomisId, conditions, bespokeConditions});
    }));

    router.post('/licenceConditions/additionalConditions/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /additionalConditions');
        const {nomisId, additionalConditions, bespokeConditions} = req.body;

        const bespoke = bespokeConditions.filter(condition => condition.text) || [];
        const additional = await getAdditionalConditionsFrom(additionalConditions, req.body);

        if(!additional) {
            await licenceService.updateLicenceConditions(nomisId, {}, bespoke);
            return res.redirect('/hdc/licenceConditions/conditionsSummary/' + nomisId);
        }

        if (!additional.validates) {
            const conditions = await conditionsService.getAdditionalConditionsWithErrors(additional);
            const data = {nomisId, conditions, bespokeConditions, submissionError: true};
            return res.render('licenceConditions/additionalConditionsForm', data);
        }

        await licenceService.updateLicenceConditions(nomisId, additional, bespoke);
        res.redirect('/hdc/licenceConditions/conditionsSummary/' + nomisId);
    }));

    function getAdditionalConditionsFrom(additionalConditions, input) {
        if(!additionalConditions) {
            return null;
        }
        return conditionsService.validateConditionInputs(input);
    }

    router.get('/licenceConditions/conditionsSummary/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.params;
        logger.debug('GET licenceConditions/conditionsSummary/:nomisId');

        const rawLicence = await licenceService.getLicence(req.params.nomisId, {populateConditions: true});
        const {nextPath} = formConfig.conditionsSummary;

        const licence = getIn(rawLicence, ['licence']) || {};

        res.render(`licenceConditions/conditionsSummaryForm`, {nomisId, licence, nextPath});
    }));

    // standard routes

    router.get('/:sectionName/:formName/:nomisId', asyncMiddleware(async (req, res) => {
        const {sectionName, formName, nomisId} = req.params;
        logger.debug(`GET licenceConditions/${formName}/${nomisId}`);

        const rawLicence = await licenceService.getLicence(nomisId);
        const {licenceSection, nextPath, licenceMap} = formConfig[formName];
        const dataPath = licenceMap || ['licence', sectionName, licenceSection];
        const data = getIn(rawLicence, dataPath) || {};

        res.render(`${sectionName}/${formName}Form`, {nomisId, data, nextPath});
    }));

    router.post('/:sectionName/:formName/:nomisId', asyncMiddleware(async (req, res) => {
        const {sectionName, formName, nomisId} = req.params;

        logger.debug(`POST ${sectionName}/${formName}/${nomisId}`);

        const rawLicence = await licenceService.getLicence(nomisId);
        const nextPath = getPathFor({data: req.body, config: formConfig[formName]});

        if (formConfig[formName].fields) {
            await licenceService.update({
                licence: rawLicence.licence,
                nomisId: nomisId,
                fieldMap: formConfig[formName].fields,
                userInput: req.body,
                licenceSection: sectionName,
                formName: formName
            });
        }

        res.redirect(`${nextPath}${nomisId}`);
    }));

    return router;
};

