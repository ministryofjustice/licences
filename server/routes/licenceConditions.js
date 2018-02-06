const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');
const {getIn} = require('../utils/functionalHelpers');
const formConfig = require('./config/licenceConditions');
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

    router.get('/standardConditions/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /standardConditions/:nomisId');

        const nomisId = req.params.nomisId;
        const conditions = await conditionsService.getStandardConditions();

        return res.render('licenceConditions/standardConditionsForm', {nomisId, conditions});
    }));

    router.get('/additionalConditions/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /additionalConditions');

        const nomisId = req.params.nomisId;
        const existingLicence = await licenceService.getLicence(req.params.nomisId);
        const licence = getIn(existingLicence, ['licence']);
        const conditions = await conditionsService.getAdditionalConditions(licence);

        return res.render('licenceConditions/additionalConditionsForm', {nomisId, conditions});
    }));

    router.post('/additionalConditions/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /additionalConditions');
        const nomisId = req.body.nomisId;

        if (!req.body.additionalConditions) {
            return res.redirect('/reporting/' + nomisId);
        }

        const validatedInput = await conditionsService.validateConditionInputs(req.body);
        if (!validatedInput.validates) {
            const conditions = await conditionsService.getAdditionalConditionsWithErrors(validatedInput);
            return res.render('licenceConditions/additionalConditionsForm', {
                nomisId,
                conditions,
                submissionError: true
            });
        }

        await licenceService.updateLicenceConditions(validatedInput);
        return res.redirect('/hdc/licenceConditions/conditionsReview/' + nomisId);
    }));

    router.get('/conditionsReview/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.params;
        logger.debug('GET licenceConditions/conditionsReview/:nomisId');

        const rawLicence = await licenceService.getLicence(req.params.nomisId, {populateConditions: true});
        const {licenceSection, nextPath} = formConfig.conditionsReview;
        // TODO look to put additional conditions within licenceConditions section on licence to enable generic get
        const data = getIn(rawLicence, ['licence', licenceSection]) || {};

        res.render(`licenceConditions/conditionsReviewForm`, {nomisId, data, nextPath});
    }));

    router.get('/:formName/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, formName} = req.params;
        logger.debug(`GET licenceConditions/${formName}/${nomisId}`);

        const rawLicence = await licenceService.getLicence(nomisId);
        const {licenceSection, nextPath, licenceMap} = formConfig[formName];
        const dataPath = licenceMap || ['licence', 'licenceConditions', licenceSection];
        const data = getIn(rawLicence, dataPath) || {};

        res.render(`licenceConditions/${formName}Form`, {nomisId, data, nextPath});
    }));

    router.post('/:formName/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, formName} = req.params;

        logger.debug(`POST licenceConditions/${formName}/${nomisId}`);

        const rawLicence = await licenceService.getLicence(nomisId);
        const nextPath = getPathFor({formName, data: req.body, formConfig});

        if (formConfig[formName].fields) {
            await licenceService.update({
                licence: rawLicence.licence,
                nomisId: nomisId,
                fieldMap: formConfig[formName].fields,
                userInput: req.body,
                licenceSection: 'licenceConditions',
                formName: formName
            });
        }

        if (formConfig[formName].statusChange) {
            const status = req.body[formConfig[formName].statusChange.field];
            await licenceService.updateStatus(nomisId, status);
        }

        res.redirect(`${nextPath}${nomisId}`);
    }));

    return router;
};
