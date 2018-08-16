const express = require('express');

const {asyncMiddleware, checkLicenceMiddleWare, authorisationMiddleware} = require('../utils/middleware');
const {getIn, lastItem, isEmpty, firstItem, lastIndex, omit} = require('../utils/functionalHelpers');
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
const createPdfConfig = require('./config/createPdf');

const formConfig = {
    ...licenceConditionsConfig,
    ...eligibilityConfig,
    ...proposedAddressConfig,
    ...curfewConfig,
    ...riskConfig,
    ...reportingConfig,
    ...finalChecksConfig,
    ...approvalConfig,
    ...createPdfConfig
};

module.exports = function(
    {logger, licenceService, conditionsService, prisonerService, authenticationMiddleware, audit}) {

    const router = express.Router();
    router.use(authenticationMiddleware());
    router.use(authorisationMiddleware);

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
        const licenceStatus = getLicenceStatus(res.locals.licence);
        const data = getIn(res.locals.licence, ['licence', 'licenceConditions', 'standard']) || {};

        res.render('licenceConditions/standard', {nomisId, conditions, data, licenceStatus});
    }));

    router.get('/licenceConditions/additionalConditions/:nomisId', checkLicence, asyncMiddleware(async (req, res) => {
        logger.debug('GET /additionalConditions');

        const nomisId = req.params.nomisId;
        const licence = getIn(res.locals.licence, ['licence']);
        const bespokeConditions = getIn(licence, ['licenceConditions', 'bespoke']) || [];
        const conditions = await conditionsService.getAdditionalConditions(licence);
        const licenceStatus = getLicenceStatus(res.locals.licence);

        res.render('licenceConditions/additionalConditions', {nomisId, conditions, bespokeConditions, licenceStatus});
    }));

    router.post('/licenceConditions/additionalConditions/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /additionalConditions');
        const {nomisId, additionalConditions, bespokeDecision, bespokeConditions} = req.body;

        const bespoke = bespokeDecision === 'Yes' && bespokeConditions.filter(condition => condition.text) || [];
        const additional = await getAdditionalConditionsFrom(additionalConditions, req.body);

        if (!additional) {
            await licenceService.updateLicenceConditions(nomisId, {}, bespoke);
            return res.redirect('/hdc/licenceConditions/conditionsSummary/' + nomisId);
        }

        await licenceService.updateLicenceConditions(nomisId, additional, bespoke);

        auditUpdateEventWithData(req, nomisId, 'licenceConditions', 'additionalConditions', 'update', {
            bespokeConditions,
            additional
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

            auditUpdateEventWithData(req, nomisId, 'licenceConditions', 'additionalConditions', 'delete', {
                conditionId
            });

            res.redirect('/hdc/licenceConditions/conditionsSummary/' + nomisId);
        })
    );

    router.get('/review/:sectionName/:nomisId', checkLicence, asyncMiddleware(async (req, res) => {
        const {sectionName, nomisId} = req.params;
        logger.debug(`GET /review/${sectionName}/${nomisId}`);

        const licence = getIn(res.locals.licence, ['licence']) || {};
        const stage = getIn(res.locals.licence, ['stage']) || {};
        const licenceVersion = getIn(res.locals.licence, ['version']) || {};
        const licenceStatus = getLicenceStatus(res.locals.licence);

        const licenceWithAddress = addAddressTo(licence);
        const errorObject = licenceService.getValidationErrorsForReview({licenceStatus, licence: licenceWithAddress});
        const data = await conditionsService.populateLicenceWithConditions(licenceWithAddress, errorObject);

        const prisonerInfo = await prisonerService.getPrisonerDetails(nomisId, req.user.token);

        res.render(`review/${sectionName}`, {
            nomisId,
            data,
            prisonerInfo,
            stage,
            licenceVersion,
            licenceStatus,
            errorObject
        });
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

    router.get('/approval/release/:nomisId', checkLicence, asyncMiddleware(approvalGets('release')));
    router.get('/approval/crdRefuse/:nomisId', checkLicence, asyncMiddleware(approvalGets('crdRefuse')));

    function approvalGets(formName) {
        return async (req, res) => {
            logger.debug(`GET /approval/${formName}/`);

            const {nomisId} = req.params;
            const prisonerInfo = await prisonerService.getPrisonerDetails(nomisId, req.user.token);

            const {nextPath, pageDataMap} = formConfig[formName];
            const dataPath = pageDataMap || ['licence', 'approval', 'release'];
            const data = getIn(res.locals.licence, dataPath) || {};
            const errors = firstItem(req.flash('errors'));
            const errorObject = getIn(errors, ['approval', 'release']) || {};
            const licenceStatus = getLicenceStatus(res.locals.licence);

            res.render(`approval/${formName}`, {prisonerInfo, nomisId, data, nextPath, errorObject, licenceStatus});
        };
    }

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
    router.post('/curfew/reinstateAddress/:nomisId', asyncMiddleware(addressReviewPosts('reinstateAddress')));

    function addressReviewPosts(formName) {
        return async (req, res) => {
            const {nomisId} = req.params;
            logger.debug(`POST /curfew/${formName}/${nomisId}`);

            const rawLicence = await licenceService.getLicence(nomisId);
            const addresses = getIn(rawLicence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);
            const addressIndex = lastIndex(addresses);
            const modifyingLicence = ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(rawLicence.stage);
            const nextPath = modifyingLicence ? '/hdc/taskList/' :
                getPathFor({data: req.body, config: formConfig[formName]});

            await licenceService.updateAddress({
                rawLicence,
                nomisId,
                fieldMap: formConfig[formName].fields,
                userInput: req.body,
                index: addressIndex
            });

            auditUpdateEvent(req, nomisId, 'curfew', formName);

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
        const {addressLine1, addressTown, postCode} = req.body.addresses[0];
        if (!addressLine1 && !addressTown && !postCode) {
            return res.redirect(`/hdc/proposedAddress/curfewAddress/${nomisId}`);
        }

        const rawLicence = await licenceService.getLicence(nomisId);
        const nextPath = '/hdc/taskList/';

        if (formConfig.curfewAddress.fields) {
            await licenceService.addAddress({
                rawLicence,
                nomisId,
                fieldMap: formConfig.curfewAddress.fields,
                userInput: req.body
            });
        }

        auditUpdateEventWithAction(req, nomisId, 'proposedAddress', 'curfewAddress', 'add');

        res.redirect(`${nextPath}${nomisId}`);
    }));

    router.post('/proposedAddress/curfewAddress/update/', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.body;
        const rawLicence = await licenceService.getLicence(nomisId);
        const addressIndex = lastIndex(getIn(rawLicence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']));

        await licenceService.updateAddress({
            rawLicence,
            nomisId: nomisId,
            fieldMap: formConfig.curfewAddress.fields,
            userInput: req.body,
            index: addressIndex
        });

        auditUpdateEventWithAction(req, nomisId, 'proposedAddress', 'curfewAddress', 'update');

        const nextPath = formConfig.curfewAddress.nextPath.path;
        res.redirect(`${nextPath}${nomisId}`);
    }));


    router.post('/optOut/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.body;

        await licenceService.update({
            nomisId: nomisId,
            config: {fields: [{decision: {}}]},
            userInput: req.body,
            licenceSection: 'proposedAddress',
            formName: 'optOut'
        });

        auditUpdateEvent(req, nomisId, 'optOut', 'optOut');

        const nextPath = '/hdc/taskList/';
        res.redirect(`${nextPath}${nomisId}`);
    }));

    router.get('/:sectionName/:formName/:path/:nomisId', checkLicence, (req, res) => {
        const {sectionName, formName, path, nomisId} = req.params;
        logger.debug(`GET ${sectionName}/${formName}/${path}/${nomisId}`);

        return formGet(req, res, sectionName, formName, nomisId);
    });

    router.get('/:sectionName/:formName/:nomisId', checkLicence, (req, res) => {
        const {sectionName, formName, nomisId} = req.params;
        logger.debug(`GET ${sectionName}/${formName}/${nomisId}`);

        return formGet(req, res, sectionName, formName, nomisId);
    });

    function formGet(req, res, sectionName, formName, nomisId) {
        const {licenceSection, nextPath, pageDataMap, validateInPlace} = formConfig[formName];
        const dataPath = pageDataMap || ['licence', sectionName, licenceSection];
        const data = getIn(res.locals.licence, dataPath) || {};
        const licenceStatus = getLicenceStatus(res.locals.licence);

        const errors = validateInPlace && firstItem(req.flash('errors'));
        const errorObject = getIn(errors, [sectionName, formName]) || {};

        const viewData = {nomisId, data, nextPath, licenceStatus, errorObject};

        res.render(`${sectionName}/${formName}`, viewData);
    }

    router.post('/:sectionName/:formName/:nomisId', asyncMiddleware(async (req, res) => {
        const {sectionName, formName, nomisId} = req.params;
        logger.debug(`POST ${sectionName}/${formName}/${nomisId}`);

        return formPost(req, res, sectionName, formName, nomisId);
    }));

    router.post('/:sectionName/:formName/:path/:nomisId', asyncMiddleware(async (req, res) => {
        const {sectionName, formName, path, nomisId} = req.params;
        logger.debug(`POST ${sectionName}/${formName}/${path}/${nomisId}`);

        return formPost(req, res, sectionName, formName, nomisId, path + '/');
    }));

    async function formPost(req, res, sectionName, formName, nomisId, path = '') {
        const nextPath = getPathFor({data: req.body, config: formConfig[formName]});
        const saveSection = formConfig[formName].saveSection || [];

        if (formConfig[formName].fields) {
            const updatedLicence = await licenceService.update({
                nomisId: nomisId,
                config: formConfig[formName],
                userInput: req.body,
                licenceSection: saveSection[0] || sectionName,
                formName: saveSection[1] || formName
            });

            if (formConfig[formName].validateInPlace) {
                const errors = licenceService.getValidationErrorsForPage(updatedLicence, sectionName);

                if (!isEmpty(getIn(errors, [sectionName, formName]))) {
                    req.flash('errors', errors);
                    return res.redirect(`/hdc/${sectionName}/${formName}/${path}${nomisId}`);
                }
            }
        }

        auditUpdateEvent(req, nomisId, sectionName, formName);

        if (req.body.anchor) {
            return res.redirect(`${nextPath}${path}${nomisId}#${req.body.anchor}`);
        }

        res.redirect(`${nextPath}${path}${nomisId}`);
    }


    function auditUpdateEvent(req, nomisId, sectionName, formName) {
        auditUpdateEventWithAction(req, nomisId, sectionName, formName, req.body.anchor || null);
    }

    function auditUpdateEventWithAction(req, nomisId, sectionName, formName, action) {
        auditUpdateEventWithData(req, nomisId, sectionName, formName, action, userInputFrom(req.body));
    }

    function auditUpdateEventWithData(req, nomisId, sectionName, formName, action, userInput) {
        audit.record('UPDATE_SECTION', req.user.staffId, {
            nomisId,
            sectionName,
            formName,
            action,
            userInput
        });
    }

    function userInputFrom(data) {
        return omit(['nomisId', '_csrf', 'anchor'], data);
    }

    return router;
};


