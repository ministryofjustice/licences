const express = require('express');

const {asyncMiddleware, checkLicenceMiddleWare} = require('../utils/middleware');
const {getIn, lastItem, isEmpty, firstItem, lastIndex} = require('../utils/functionalHelpers');
const {getPathFor} = require('../utils/routes');
const {getLicenceStatus} = require('../utils/licenceStatus');
const {getCurfewAddressFormData} = require('../utils/addressHelpers');

const licenceConditionsConfig = require('./config/licenceConditions');
const eligibilityConfig = require('./config/eligibility');
const proposedAddressConfig = require('./config/proposedAddress');
const curfewConfig = require('./config/curfew');
const reportingConfig = require('./config/reporting');
const finalChecksConfig = require('./config/finalChecks');
const approvalConfig = require('./config/approval');
const riskConfig = require('./config/risk');

const formConfig = {
    ...licenceConditionsConfig,
    ...eligibilityConfig,
    ...proposedAddressConfig,
    ...curfewConfig,
    ...riskConfig,
    ...reportingConfig,
    ...finalChecksConfig,
    ...approvalConfig
};

module.exports = function(
    {logger, licenceService, conditionsService, prisonerService, authenticationMiddleware, audit}) {

    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    const checkLicence = checkLicenceMiddleWare(licenceService, prisonerService);

    // bespoke routes

    router.get('/licenceConditions/standard/:nomisId', checkLicence, asyncMiddleware(async (req, res) => {
        logger.debug('GET /standard/:nomisId');

        const nomisId = req.params.nomisId;
        const conditions = await conditionsService.getStandardConditions();

        const data = getIn(res.locals.licence, ['licence', 'licenceConditions', 'standard']) || {};

        res.render('licenceConditions/standard', {nomisId, conditions, data});
    }));

    router.get('/licenceConditions/additionalConditions/:nomisId', checkLicence, asyncMiddleware(async (req, res) => {
        logger.debug('GET /additionalConditions');

        const nomisId = req.params.nomisId;
        const licence = getIn(res.locals.licence, ['licence']);
        const bespokeConditions = getIn(licence, ['licenceConditions', 'bespoke']) || [];
        const conditions = await conditionsService.getAdditionalConditions(licence);

        res.render('licenceConditions/additionalConditions', {nomisId, conditions, bespokeConditions});
    }));

    router.post('/licenceConditions/additionalConditions/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /additionalConditions');
        const {nomisId, additionalConditions, bespokeConditions} = req.body;

        const bespoke = bespokeConditions.filter(condition => condition.text) || [];
        const additional = await getAdditionalConditionsFrom(additionalConditions, req.body);

        if (!additional) {
            await licenceService.updateLicenceConditions(nomisId, {}, bespoke);
            return res.redirect('/hdc/licenceConditions/conditionsSummary/' + nomisId);
        }

        await licenceService.updateLicenceConditions(nomisId, additional, bespoke);

        audit.record('UPDATE_SECTION', req.user.email,
            {
                nomisId,
                sectionName: 'licenceConditions',
                formName: 'additionalConditions',
                action: 'update',
                userInput: {bespokeConditions, additional}
            });

        res.redirect('/hdc/licenceConditions/conditionsSummary/' + nomisId);
    }));

    function getAdditionalConditionsFrom(additionalConditions, input) {
        if (!additionalConditions) {
            return null;
        }
        return conditionsService.formatConditionInputs(input);
    }

    router.get('/licenceConditions/conditionsSummary/:nomisId', checkLicence, asyncMiddleware(async (req, res) => {
        const {nomisId} = req.params;
        logger.debug('GET licenceConditions/conditionsSummary/:nomisId');

        const {nextPath} = formConfig.conditionsSummary;
        const licence = getIn(res.locals.licence, ['licence']) || {};
        const errorObject = licenceService.getConditionsErrors(licence);
        const data = await conditionsService.populateLicenceWithConditions(licence, errorObject);

        res.render(`licenceConditions/conditionsSummary`, {nomisId, data, nextPath});
    }));

    router.post('/licenceConditions/additionalConditions/:nomisId/delete/:conditionId',
        asyncMiddleware(async (req, res) => {
            logger.debug('POST /additionalConditions/delete');
            const {nomisId, conditionId} = req.body;

            if (conditionId) {
                await licenceService.deleteLicenceCondition(nomisId, conditionId);
            }

            audit.record('UPDATE_SECTION', req.user.email,
                {
                    nomisId,
                    sectionName: 'licenceConditions',
                    formName: 'additionalConditions',
                    action: 'delete',
                    userInput: {conditionId}
                });

            res.redirect('/hdc/licenceConditions/conditionsSummary/' + nomisId);
        })
    );

    router.get('/review/:sectionName/:nomisId', checkLicence, asyncMiddleware(async (req, res) => {
        const {sectionName, nomisId} = req.params;
        logger.debug(`GET /review/${sectionName}/${nomisId}`);

        const licence = getIn(res.locals.licence, ['licence']) || {};
        const stage = getIn(res.locals.licence, ['stage']) || {};
        const licenceStatus = getLicenceStatus(res.locals.licence);

        const licenceWithAddress = addAddressTo(licence);
        const errorObject = licenceService.getValidationErrorsForReview({licenceStatus, licence: licenceWithAddress});
        const data = await conditionsService.populateLicenceWithConditions(licenceWithAddress, errorObject);

        const prisonerInfo = await prisonerService.getPrisonerDetails(nomisId, req.user.username);

        res.render(`review/${sectionName}`, {nomisId, data, prisonerInfo, stage, licenceStatus, errorObject});
    }));

    function addAddressTo(licence) {
        const allAddresses = getIn(licence, ['proposedAddress', 'curfewAddress', 'addresses']);

        if (!allAddresses) {
            return licence;
        }

        const address = lastItem(allAddresses);
        return {
            ...licence,
            proposedAddress: {
                ...licence.proposedAddress,
                curfewAddress: address
            }
        };
    }

    router.get('/approval/release/:nomisId', checkLicence, asyncMiddleware(async (req, res) => {
        logger.debug('GET /approval/release/');

        const {nomisId} = req.params;
        const prisonerInfo = await prisonerService.getPrisonerDetails(nomisId, req.user.username);

        const {nextPath, pageDataMap} = formConfig.release;
        const dataPath = pageDataMap || ['licence', 'approval', 'release'];
        const data = getIn(res.locals.licence, dataPath) || {};
        const errors = firstItem(req.flash('errors'));
        const errorObject = getIn(errors, ['approval', 'release']) || {};
        const licenceStatus = getLicenceStatus(res.locals.licence);

        res.render('approval/release', {prisonerInfo, nomisId, data, nextPath, errorObject, licenceStatus});
    }));

    router.get('/curfew/curfewAddressReview/:nomisId', checkLicence, addressReviewGets('curfewAddressReview'));
    router.get('/curfew/addressSafety/:nomisId', checkLicence, addressReviewGets('addressSafety'));

    function addressReviewGets(formName) {
        return (req, res) => {
            const {nomisId} = req.params;

            const addresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);
            const data = lastItem(addresses);
            const nextPath = formConfig[formName].nextPath;

            res.render(`curfew/${formName}`, {nomisId, data, nextPath});
        };
    }

    router.post('/curfew/curfewAddressReview/:nomisId', asyncMiddleware(addressReviewPosts('curfewAddressReview')));
    router.post('/curfew/addressSafety/:nomisId', asyncMiddleware(addressReviewPosts('addressSafety')));
    router.post('/curfew/withdrawAddress/:nomisId', asyncMiddleware(addressReviewPosts('withdrawAddress')));
    router.post('/curfew/withdrawConsent/:nomisId', asyncMiddleware(addressReviewPosts('withdrawConsent')));

    function addressReviewPosts(formName) {
        return async (req, res) => {
            const {nomisId} = req.params;
            logger.debug(`POST /curfew/${formName}/${nomisId}`);

            const rawLicence = await licenceService.getLicence(nomisId);
            const addresses = getIn(rawLicence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);
            const addressIndex = lastIndex(addresses);
            const nextPath = getPathFor({data: req.body, config: formConfig[formName]});

            await licenceService.updateAddress({
                licence: rawLicence.licence,
                nomisId: nomisId,
                fieldMap: formConfig[formName].fields,
                userInput: req.body,
                index: addressIndex
            });

            audit.record('UPDATE_SECTION', req.user.email, {
                nomisId, sectionName: 'curfew', formName, userInput: auditableData(req.body)
            });

            res.redirect(`${nextPath}${nomisId}`);
        };
    }

    router.get('/proposedAddress/curfewAddress/:nomisId', checkLicence, (req, res) => {
        const {nomisId} = req.params;
        const addresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);

        if (!addresses) {
            return res.render('proposedAddress/curfewAddress', {nomisId, data: []});
        }

        const {submitPath, addressToShow} = getCurfewAddressFormData(addresses);

        res.render('proposedAddress/curfewAddress', {nomisId, data: addressToShow, submitPath});
    });

    router.post('/proposedAddress/curfewAddress/add/', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.body;
        const rawLicence = await licenceService.getLicence(nomisId);
        const nextPath = '/hdc/taskList/';

        if (formConfig.curfewAddress.fields) {
            await licenceService.addAddress({
                licence: rawLicence.licence,
                nomisId: nomisId,
                fieldMap: formConfig.curfewAddress.fields,
                userInput: req.body
            });
        }

        audit.record('UPDATE_SECTION', req.user.email,
            {
                nomisId,
                sectionName: 'proposedAddress',
                formName: 'curfewAddress',
                action: 'add',
                userInput: auditableData(req.body)
            });

        res.redirect(`${nextPath}${nomisId}`);
    }));

    router.post('/proposedAddress/curfewAddress/update/', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.body;
        const rawLicence = await licenceService.getLicence(nomisId);
        const addressIndex = lastIndex(getIn(rawLicence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']));

        await licenceService.updateAddress({
            licence: rawLicence.licence,
            nomisId: nomisId,
            fieldMap: formConfig.curfewAddress.fields,
            userInput: req.body,
            index: addressIndex
        });

        audit.record('UPDATE_SECTION', req.user.email,
            {
                nomisId,
                sectionName: 'proposedAddress',
                formName: 'curfewAddress',
                action: 'update',
                userInput: auditableData(req.body)
            });

        const nextPath = formConfig.curfewAddress.nextPath.path;
        res.redirect(`${nextPath}${nomisId}`);
    }));

    router.get('/:sectionName/:formName/:nomisId', checkLicence, (req, res) => {
        const {sectionName, formName, nomisId} = req.params;
        logger.debug(`GET ${sectionName}/${formName}/${nomisId}`);

        const {licenceSection, nextPath, pageDataMap, validateInPlace} = formConfig[formName];
        const dataPath = pageDataMap || ['licence', sectionName, licenceSection];
        const data = getIn(res.locals.licence, dataPath) || {};
        const licenceStatus = getLicenceStatus(res.locals.licence);

        const errors = validateInPlace && firstItem(req.flash('errors'));
        const errorObject = getIn(errors, [sectionName, formName]) || {};

        const viewData = {nomisId, data, nextPath, licenceStatus, errorObject};

        res.render(`${sectionName}/${formName}`, viewData);
    });

    router.post('/optOut/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.body;
        const rawLicence = await licenceService.getLicence(nomisId);

        await licenceService.update({
            licence: rawLicence.licence,
            nomisId: nomisId,
            fieldMap: [{decision: {}}],
            userInput: req.body,
            licenceSection: 'proposedAddress',
            formName: 'optOut'
        });

        audit.record('UPDATE_SECTION', req.user.email,
            {nomisId, sectionName: 'optOut', formName: 'optOut', userInput: auditableData(req.body)});

        const nextPath = '/hdc/taskList/';
        res.redirect(`${nextPath}${nomisId}`);
    }));

    router.post('/:sectionName/:formName/:nomisId', asyncMiddleware(async (req, res) => {
        const {sectionName, formName, nomisId} = req.params;

        logger.debug(`POST ${sectionName}/${formName}/${nomisId}`);


        const rawLicence = await licenceService.getLicence(nomisId);
        const nextPath = getPathFor({data: req.body, config: formConfig[formName]});
        const saveSection = formConfig[formName].saveSection || [];

        if (formConfig[formName].fields) {
            const updatedLicence = await licenceService.update({
                licence: rawLicence.licence,
                nomisId: nomisId,
                fieldMap: formConfig[formName].fields,
                userInput: req.body,
                licenceSection: saveSection[0] || sectionName,
                formName: saveSection[1] || formName
            });

            if (formConfig[formName].validateInPlace) {
                const errors = licenceService.getValidationErrorsForPage(updatedLicence, sectionName);

                if (!isEmpty(getIn(errors, [sectionName, formName]))) {
                    req.flash('errors', errors);
                    return res.redirect(`/hdc/${sectionName}/${formName}/${nomisId}`);
                }
            }
        }

        audit.record('UPDATE_SECTION', req.user.email,
            {
                nomisId,
                sectionName,
                formName,
                action: req.body.anchor || '',
                userInput: auditableData(req.body)
            });

        if (req.body.anchor) {
            return res.redirect(`${nextPath}${nomisId}#${req.body.anchor}`);
        }

        res.redirect(`${nextPath}${nomisId}`);
    }));

    return router;
};

function auditableData(input) {
    return Object.keys(input).reduce((objectBuilt, key) => {
        if (notAcceptedKeys.includes(key)) {
            return {...objectBuilt};
        } else {
            const value = input[key] || '';
            return {...objectBuilt, ...{[key]: value}};
        }
    }, {});
}

const notAcceptedKeys = ['nomisId', '_csrf', 'anchor'];
