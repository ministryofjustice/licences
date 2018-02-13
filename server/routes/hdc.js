const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');
const {getIn} = require('../utils/functionalHelpers');
const licenceConditionsConfig = require('./config/licenceConditions');
const eligibilityConfig = require('./config/eligibility');
const proposedAddressConfig = require('./config/proposedAddress');
const formConfig = {...licenceConditionsConfig, ...eligibilityConfig, ...proposedAddressConfig};
const {getPathFor} = require('../utils/routes');

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

    router.get('/licenceConditions/standardConditions/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /standardConditions/:nomisId');

        const nomisId = req.params.nomisId;
        const conditions = await conditionsService.getStandardConditions();

        const rawLicence = await licenceService.getLicence(nomisId);
        const data = getIn(rawLicence, ['licence', 'licenceConditions', 'standardConditions']) || {};

        res.render('licenceConditions/standardConditionsForm', {nomisId, conditions, data});
    }));

    router.get('/licenceConditions/additionalConditions/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /additionalConditions');

        const nomisId = req.params.nomisId;
        const existingLicence = await licenceService.getLicence(req.params.nomisId);
        const licence = getIn(existingLicence, ['licence']);
        const bespokeConditions = getIn(existingLicence, ['licence', 'additionalConditions', 'bespoke']) || [];
        const conditions = await conditionsService.getAdditionalConditions(licence);

        res.render('licenceConditions/additionalConditionsForm', {nomisId, conditions, bespokeConditions});
    }));

    router.post('/licenceConditions/additionalConditions/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /additionalConditions');
        const nomisId = req.body.nomisId;

        if (!req.body.additionalConditions) {
            return res.redirect('/reporting/' + nomisId);
        }

        const additionalConditions = await conditionsService.validateConditionInputs(req.body);
        const bespokeConditions = req.body.bespokeConditions || [];
        if (!additionalConditions.validates) {
            const conditions = await conditionsService.getAdditionalConditionsWithErrors(additionalConditions);
            return res.render('licenceConditions/additionalConditionsForm', {
                nomisId,
                conditions,
                bespokeConditions,
                submissionError: true
            });
        }

        await licenceService.updateLicenceConditions(nomisId, additionalConditions, bespokeConditions);
        res.redirect('/hdc/licenceConditions/conditionsSummary/' + nomisId);
    }));

    router.get('/licenceConditions/conditionsSummary/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.params;
        logger.debug('GET licenceConditions/conditionsSummary/:nomisId');

        const rawLicence = await licenceService.getLicence(req.params.nomisId, {populateConditions: true});
        const {nextPath} = formConfig.conditionsSummary;
        // TODO look to put additional conditions within licenceConditions section on licence to enable generic get
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
