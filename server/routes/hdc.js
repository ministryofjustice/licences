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
    router.param('bookingId', checkLicenceMiddleWare(licenceService, prisonerService));
    router.param('bookingId', authorisationMiddleware);

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    // bespoke routes

    router.get('/licenceConditions/standard/:bookingId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /standard/:bookingId');

        const bookingId = req.params.bookingId;
        const conditions = await conditionsService.getStandardConditions();
        const licenceStatus = getLicenceStatus(res.locals.licence);
        const data = getIn(res.locals.licence, ['licence', 'licenceConditions', 'standard']) || {};

        res.render('licenceConditions/standard', {bookingId, conditions, data, licenceStatus});
    }));

    router.get('/licenceConditions/additionalConditions/:bookingId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /additionalConditions');

        const bookingId = req.params.bookingId;
        const licence = getIn(res.locals.licence, ['licence']);
        const bespokeConditions = getIn(licence, ['licenceConditions', 'bespoke']) || [];
        const conditions = await conditionsService.getAdditionalConditions(licence);
        const licenceStatus = getLicenceStatus(res.locals.licence);

        res.render('licenceConditions/additionalConditions', {bookingId, conditions, bespokeConditions, licenceStatus});
    }));

    router.post('/licenceConditions/additionalConditions/:bookingId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /additionalConditions');
        const {bookingId, additionalConditions, bespokeDecision, bespokeConditions} = req.body;

        const bespoke = bespokeDecision === 'Yes' && bespokeConditions.filter(condition => condition.text) || [];
        const additional = await getAdditionalConditionsFrom(additionalConditions, req.body);

        if (!additional) {
            await licenceService.updateLicenceConditions(bookingId, {}, bespoke);
            return res.redirect('/hdc/licenceConditions/conditionsSummary/' + bookingId);
        }

        await licenceService.updateLicenceConditions(bookingId, additional, bespoke);

        auditUpdateEventWithData(req, bookingId, 'licenceConditions', 'additionalConditions', 'update', {
            bespokeConditions,
            additional
        });

        res.redirect('/hdc/licenceConditions/conditionsSummary/' + bookingId);
    }));

    function getAdditionalConditionsFrom(additionalConditions, input) {
        if (!additionalConditions) {
            return null;
        }
        return conditionsService.formatConditionInputs(input);
    }

    router.get('/licenceConditions/conditionsSummary/:bookingId', asyncMiddleware(async (req, res) => {
        const {bookingId} = req.params;
        logger.debug('GET licenceConditions/conditionsSummary/:bookingId');

        const {nextPath} = formConfig.conditionsSummary;
        const licence = getIn(res.locals.licence, ['licence']) || {};
        const errorObject = licenceService.getConditionsErrors(licence);
        const data = await conditionsService.populateLicenceWithConditions(licence, errorObject);

        res.render(`licenceConditions/conditionsSummary`, {bookingId, data, nextPath});
    }));

    router.post('/licenceConditions/additionalConditions/:bookingId/delete/:conditionId',
        asyncMiddleware(async (req, res) => {
            logger.debug('POST /additionalConditions/delete');
            const {bookingId, conditionId} = req.body;

            if (conditionId) {
                await licenceService.deleteLicenceCondition(bookingId, conditionId);
            }

            auditUpdateEventWithData(req, bookingId, 'licenceConditions', 'additionalConditions', 'delete', {
                conditionId
            });

            res.redirect('/hdc/licenceConditions/conditionsSummary/' + bookingId);
        })
    );

    router.get('/review/:sectionName/:bookingId', asyncMiddleware(async (req, res) => {
        const {sectionName, bookingId} = req.params;
        logger.debug(`GET /review/${sectionName}/${bookingId}`);

        const licence = getIn(res.locals.licence, ['licence']) || {};
        const stage = getIn(res.locals.licence, ['stage']) || {};
        const licenceVersion = getIn(res.locals.licence, ['version']) || {};
        const licenceStatus = getLicenceStatus(res.locals.licence);

        const licenceWithAddress = addAddressTo(licence);
        const errorObject = licenceService.getValidationErrorsForReview({licenceStatus, licence: licenceWithAddress});
        const data = await conditionsService.populateLicenceWithConditions(licenceWithAddress, errorObject);

        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, req.user.token);

        res.render(`review/${sectionName}`, {
            bookingId,
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

    router.get('/approval/release/:bookingId', asyncMiddleware(approvalGets('release')));
    router.get('/approval/crdRefuse/:bookingId', asyncMiddleware(approvalGets('crdRefuse')));

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
            const licenceStatus = getLicenceStatus(res.locals.licence);

            res.render(`approval/${formName}`, {prisonerInfo, bookingId, data, nextPath, errorObject, licenceStatus});
        };
    }

    router.get('/curfew/curfewAddressReview/:bookingId', addressReviewGets('curfewAddressReview'));
    router.get('/curfew/addressSafety/:bookingId', addressReviewGets('addressSafety'));

    function addressReviewGets(formName) {
        return (req, res) => {
            const {bookingId} = req.params;

            const addresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);
            const data = lastItem(addresses);
            const nextPath = formConfig[formName].nextPath;

            res.render(`curfew/${formName}`, {bookingId, data, nextPath});
        };
    }

    router.post('/curfew/curfewAddressReview/:bookingId', asyncMiddleware(addressReviewPosts('curfewAddressReview')));
    router.post('/curfew/addressSafety/:bookingId', asyncMiddleware(addressReviewPosts('addressSafety')));
    router.post('/curfew/withdrawAddress/:bookingId', asyncMiddleware(addressReviewPosts('withdrawAddress')));
    router.post('/curfew/withdrawConsent/:bookingId', asyncMiddleware(addressReviewPosts('withdrawConsent')));
    router.post('/curfew/reinstateAddress/:bookingId', asyncMiddleware(addressReviewPosts('reinstateAddress')));

    function addressReviewPosts(formName) {
        return async (req, res) => {
            const {bookingId} = req.params;
            logger.debug(`POST /curfew/${formName}/${bookingId}`);

            const rawLicence = res.locals.licence;
            const addresses = getIn(rawLicence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);
            const addressIndex = lastIndex(addresses);
            const modifyingLicence = ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(rawLicence.stage);
            const nextPath = modifyingLicence ? '/hdc/taskList/' :
                getPathFor({data: req.body, config: formConfig[formName]});

            await licenceService.updateAddress({
                rawLicence,
                bookingId,
                fieldMap: formConfig[formName].fields,
                userInput: req.body,
                index: addressIndex
            });

            auditUpdateEvent(req, bookingId, 'curfew', formName);

            res.redirect(`${nextPath}${bookingId}`);
        };
    }

    router.get('/proposedAddress/curfewAddress/:bookingId', (req, res) => {
        const {bookingId} = req.params;
        const addresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);

        if (!addresses) {
            return res.render('proposedAddress/curfewAddress', {bookingId, data: []});
        }

        const {submitPath, addressToShow} = getCurfewAddressFormData(addresses);

        res.render('proposedAddress/curfewAddress', {bookingId, data: addressToShow, submitPath});
    });

    router.post('/proposedAddress/curfewAddress/add/:bookingId', asyncMiddleware(async (req, res) => {
        const {bookingId} = req.body;
        const {addressLine1, addressTown, postCode} = req.body.addresses[0];

        if (!addressLine1 && !addressTown && !postCode) {
            return res.redirect(`/hdc/proposedAddress/curfewAddress/${bookingId}`);
        }

        const rawLicence = res.locals.licence;
        const nextPath = '/hdc/taskList/';

        if (formConfig.curfewAddress.fields) {
            await licenceService.addAddress({
                rawLicence,
                bookingId,
                fieldMap: formConfig.curfewAddress.fields,
                userInput: req.body
            });
        }

        auditUpdateEventWithAction(req, bookingId, 'proposedAddress', 'curfewAddress', 'add');

        res.redirect(`${nextPath}${bookingId}`);
    }));

    router.post('/proposedAddress/curfewAddress/update/:bookingId', asyncMiddleware(async (req, res) => {
        const {bookingId} = req.body;
        const rawLicence = await res.locals.licence;

        const addressIndex = lastIndex(getIn(rawLicence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']));

        await licenceService.updateAddress({
            rawLicence,
            bookingId: bookingId,
            fieldMap: formConfig.curfewAddress.fields,
            userInput: req.body,
            index: addressIndex
        });

        auditUpdateEventWithAction(req, bookingId, 'proposedAddress', 'curfewAddress', 'update');

        const nextPath = formConfig.curfewAddress.nextPath.path;
        res.redirect(`${nextPath}${bookingId}`);
    }));


    router.post('/optOut/:bookingId', asyncMiddleware(async (req, res) => {
        const {bookingId} = req.body;

        await licenceService.update({
            bookingId: bookingId,
            config: {fields: [{decision: {}}]},
            userInput: req.body,
            licenceSection: 'proposedAddress',
            formName: 'optOut'
        });

        auditUpdateEvent(req, bookingId, 'optOut', 'optOut');

        const nextPath = '/hdc/taskList/';
        res.redirect(`${nextPath}${bookingId}`);
    }));

    router.get('/:sectionName/:formName/:path/:bookingId', (req, res) => {
        const {sectionName, formName, path, bookingId} = req.params;
        logger.debug(`GET ${sectionName}/${formName}/${path}/${bookingId}`);

        return formGet(req, res, sectionName, formName, bookingId);
    });

    router.get('/:sectionName/:formName/:bookingId', (req, res) => {
        const {sectionName, formName, bookingId} = req.params;
        logger.debug(`GET ${sectionName}/${formName}/${bookingId}`);

        return formGet(req, res, sectionName, formName, bookingId);
    });

    function formGet(req, res, sectionName, formName, bookingId) {
        const {licenceSection, nextPath, pageDataMap, validateInPlace} = formConfig[formName];
        const dataPath = pageDataMap || ['licence', sectionName, licenceSection];
        const data = getIn(res.locals.licence, dataPath) || {};
        const licenceStatus = getLicenceStatus(res.locals.licence);

        const errors = validateInPlace && firstItem(req.flash('errors'));
        const errorObject = getIn(errors, [sectionName, formName]) || {};

        const viewData = {bookingId, data, nextPath, licenceStatus, errorObject};

        res.render(`${sectionName}/${formName}`, viewData);
    }

    router.post('/:sectionName/:formName/:bookingId', asyncMiddleware(async (req, res) => {
        const {sectionName, formName, bookingId} = req.params;
        logger.debug(`POST ${sectionName}/${formName}/${bookingId}`);

        return formPost(req, res, sectionName, formName, bookingId);
    }));

    router.post('/:sectionName/:formName/:path/:bookingId', asyncMiddleware(async (req, res) => {
        const {sectionName, formName, path, bookingId} = req.params;
        logger.debug(`POST ${sectionName}/${formName}/${path}/${bookingId}`);

        return formPost(req, res, sectionName, formName, bookingId, path + '/');
    }));

    async function formPost(req, res, sectionName, formName, bookingId, path = '') {
        const nextPath = getPathFor({data: req.body, config: formConfig[formName]});
        const saveSection = formConfig[formName].saveSection || [];

        if (formConfig[formName].fields) {
            const updatedLicence = await licenceService.update({
                bookingId: bookingId,
                config: formConfig[formName],
                userInput: req.body,
                licenceSection: saveSection[0] || sectionName,
                formName: saveSection[1] || formName
            });

            if (formConfig[formName].validateInPlace) {
                const errors = licenceService.getValidationErrorsForPage(updatedLicence, sectionName);

                if (!isEmpty(getIn(errors, [sectionName, formName]))) {
                    req.flash('errors', errors);
                    return res.redirect(`/hdc/${sectionName}/${formName}/${path}${bookingId}`);
                }
            }
        }

        auditUpdateEvent(req, bookingId, sectionName, formName);

        if (req.body.anchor) {
            return res.redirect(`${nextPath}${path}${bookingId}#${req.body.anchor}`);
        }

        res.redirect(`${nextPath}${path}${bookingId}`);
    }


    function auditUpdateEvent(req, bookingId, sectionName, formName) {
        auditUpdateEventWithAction(req, bookingId, sectionName, formName, req.body.anchor || null);
    }

    function auditUpdateEventWithAction(req, bookingId, sectionName, formName, action) {
        auditUpdateEventWithData(req, bookingId, sectionName, formName, action, userInputFrom(req.body));
    }

    function auditUpdateEventWithData(req, bookingId, sectionName, formName, action, userInput) {
        audit.record('UPDATE_SECTION', req.user.staffId, {
            bookingId,
            sectionName,
            formName,
            action,
            userInput
        });
    }

    function userInputFrom(data) {
        return omit(['bookingId', '_csrf', 'anchor'], data);
    }

    return router;
};


