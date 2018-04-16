const express = require('express');

const {asyncMiddleware, checkLicenceMiddleWare} = require('../utils/middleware');
const {getIn, isEmpty} = require('../utils/functionalHelpers');
const {getPathFor} = require('../utils/routes');
const {getLicenceStatus} = require('../utils/licenceStatus');
const {separateAddresses, getAddressToShow} = require('../utils/addressHelpers');

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

module.exports = function({logger, licenceService, conditionsService, prisonerService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    const checkLicence = checkLicenceMiddleWare(licenceService);

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

        if (!additional.validates) {
            const conditions = await conditionsService.getAdditionalConditionsWithErrors(additional);
            const data = {nomisId, conditions, bespokeConditions, submissionError: true};

            return res.render('licenceConditions/additionalConditions', data);
        }

        await licenceService.updateLicenceConditions(nomisId, additional, bespoke);
        res.redirect('/hdc/licenceConditions/conditionsSummary/' + nomisId);
    }));

    function getAdditionalConditionsFrom(additionalConditions, input) {
        if (!additionalConditions) {
            return null;
        }
        return conditionsService.validateConditionInputs(input);
    }

    router.get('/licenceConditions/conditionsSummary/:nomisId', checkLicence, asyncMiddleware(async (req, res) => {
        const {nomisId} = req.params;
        logger.debug('GET licenceConditions/conditionsSummary/:nomisId');

        const {nextPath} = formConfig.conditionsSummary;
        const licence = getIn(res.locals.licence, ['licence']) || {};
        const data = await conditionsService.populateLicenceWithConditions(licence);

        res.render(`licenceConditions/conditionsSummary`, {nomisId, data, nextPath});
    }));

    router.post('/licenceConditions/additionalConditions/:nomisId/delete/:conditionId',
        asyncMiddleware(async (req, res) => {
            logger.debug('POST /additionalConditions/delete');
            const {nomisId, conditionId} = req.body;

            if (conditionId) {
                await licenceService.deleteLicenceCondition(nomisId, conditionId);
            }

            res.redirect('/hdc/licenceConditions/conditionsSummary/' + nomisId);
        }));

    router.get('/review/:sectionName/:nomisId', checkLicence, asyncMiddleware(async (req, res) => {
        const {sectionName, nomisId} = req.params;
        logger.debug(`GET /review/${sectionName}/${nomisId}`);

        const licence = getIn(res.locals.licence, ['licence']) || {};
        const stage = getIn(res.locals.licence, ['status']) || {};
        const licenceStatus = getLicenceStatus(res.locals.licence);

        const populatedLicence = await conditionsService.populateLicenceWithConditions(licence);
        const allAddresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);
        const {activeAddresses, acceptedAddresses, rejectedAddresses} = separateAddresses(allAddresses);

        const data = {
            ...populatedLicence,
            proposedAddress: {
                ...populatedLicence.proposedAddress,
                curfewAddress: {
                    ...populatedLicence.proposedAddress.curfewAddress,
                    addresses: getAddressToShow(activeAddresses, acceptedAddresses, rejectedAddresses)
                }
            }
        };

        const prisonerInfo = await prisonerService.getPrisonerDetails(nomisId, req.user.token);
        res.render(`review/${sectionName}`, {nomisId, data, prisonerInfo, stage, licenceStatus});
    }));

    router.get('/approval/release/:nomisId', checkLicence, asyncMiddleware(async (req, res) => {
        logger.debug('GET /approval/release/');

        const {nomisId} = req.params;
        const prisonerInfo = await prisonerService.getPrisonerDetails(nomisId, req.user.token);

        const {nextPath, licenceMap} = formConfig.release;
        const dataPath = licenceMap || ['licence', 'approval', 'release'];
        const data = getIn(res.locals.licence, dataPath) || {};

        res.render('approval/release', {prisonerInfo, nomisId, data, nextPath});
    }));

    router.get('/curfew/curfewAddressReview/:nomisId', checkLicence, addressReviewGets('curfewAddressReview'));
    router.get('/curfew/addressSafety/:nomisId', checkLicence, addressReviewGets('addressSafety'));

    function addressReviewGets(formName) {
        return (req, res) => {
            const {nomisId} = req.params;

            const addresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);
            const {acceptedAddresses, activeAddresses, rejectedAddresses} = separateAddresses(addresses);
            const addressToShow = getAddressToShow(activeAddresses, acceptedAddresses, rejectedAddresses);
            const data = {addresses: addressToShow};
            const nextPath = formConfig[formName].nextPath;

            res.render(`curfew/${formName}`, {nomisId, data, nextPath});
        };
    }

    router.post('/curfew/curfewAddressReview/:nomisId', asyncMiddleware(addressReviewPosts('curfewAddressReview')));
    router.post('/curfew/addressSafety/:nomisId', asyncMiddleware(addressReviewPosts('addressSafety')));

    function addressReviewPosts(formName) {
        return async (req, res) => {
            const {nomisId} = req.params;
            logger.debug(`GET /curfew/${formName}/${nomisId}`);

            const {addressIndex} = req.body;
            const rawLicence = await licenceService.getLicence(nomisId);
            const nextPath = getPathFor({data: req.body, config: formConfig[formName]});

            await licenceService.updateAddress({
                licence: rawLicence.licence,
                nomisId: nomisId,
                fieldMap: formConfig[formName].fields,
                userInput: req.body,
                index: addressIndex
            });

            res.redirect(`${nextPath}${nomisId}`);
        };
    }

    router.get('/proposedAddress/curfewAddress/:nomisId', checkLicence, (req, res) => {
        const {nomisId} = req.params;
        const addresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);

        if(!addresses) {
            return res.render('proposedAddress/curfewAddress', {nomisId, data: []});
        }

        const splitAddresses = separateAddresses(addresses);
        const {submitPath, addressToShow} =
            getCurfewAddressFormData(splitAddresses);

        res.render('proposedAddress/curfewAddress', {nomisId, data: addressToShow, submitPath});
    });

    router.post('/proposedAddress/curfewAddress/add/', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.body;
        const rawLicence = await licenceService.getLicence(nomisId);
        const addressIndex = getIn(rawLicence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']).length + 1;
        const nextPath = '/hdc/proposedAddress/confirmAddress/';

        if (formConfig.curfewAddress.fields) {
            await licenceService.updateAddress({
                licence: rawLicence.licence,
                nomisId: nomisId,
                fieldMap: formConfig.curfewAddress.fields,
                userInput: req.body,
                index: addressIndex
            });
        }

        res.redirect(`${nextPath}${nomisId}`);
    }));

    router.get('/proposedAddress/rejected/:nomisId', checkLicence, (req, res) => {
        const {nomisId} = req.params;
        logger.debug(`GET proposedAddress/rejected/${nomisId}`);

        const addresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']) || {};
        const data = separateAddresses(addresses);
        const licenceStatus = getLicenceStatus(res.locals.licence);

        res.render('proposedAddress/rejected', {nomisId, data, licenceStatus});
    });

    router.post('/proposedAddress/submitAlternative/', asyncMiddleware(async (req, res) => {
        const {nomisId, submitAlternative} = req.body;
        logger.debug(`POST /proposedAddress/submitAlternative/${nomisId}`);
        const rawLicence = await licenceService.getLicence(nomisId);

        if(submitAlternative === 'Yes') {
            await licenceService.promoteAlternativeAddress({nomisId, licence: rawLicence.licence});
            return res.redirect(`/hdc/proposedAddress/confirmAddress/${nomisId}`);
        } else {
            await licenceService.removeAlternativeAddress({nomisId, licence: rawLicence.licence});
            return res.redirect(`/hdc/proposedAddress/curfewAddress/${nomisId}`);
        }
    }));

    router.post('/proposedAddress/curfewAddress/update/', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.body;
        const rawLicence = await licenceService.getLicence(nomisId);

        await licenceService.updateAddresses({
            licence: rawLicence.licence,
            nomisId: nomisId,
            fieldMap: formConfig.curfewAddress.fields[0].addresses.contains,
            userInput: req.body
        });

        const nextPath = '/hdc/proposedAddress/confirmAddress/';
        res.redirect(`${nextPath}${nomisId}`);
    }));

    router.get('/proposedAddress/confirmAddress/:nomisId', checkLicence, (req, res) => {
        const {nomisId} = req.params;
        const allAddresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);
        const {activeAddresses, alternativeAddresses} = separateAddresses(allAddresses);

        const data = {addresses: [...activeAddresses, ...alternativeAddresses]};
        const nextPath = formConfig.confirmAddress.nextPath;

        res.render('proposedAddress/confirmAddress', {nomisId, data, nextPath});
    });

    router.get('/:sectionName/:formName/:nomisId', checkLicence, (req, res) => {
        const {sectionName, formName, nomisId} = req.params;
        logger.debug(`GET ${sectionName}/${formName}/${nomisId}`);

        const {licenceSection, nextPath, licenceMap} = formConfig[formName];
        const dataPath = licenceMap || ['licence', sectionName, licenceSection];
        const data = getIn(res.locals.licence, dataPath) || {};
        const licenceStatus = getLicenceStatus(res.locals.licence);

        res.render(`${sectionName}/${formName}`, {nomisId, data, nextPath, licenceStatus});
    });

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

        if (req.body.anchor) {
            res.redirect(`${nextPath}${nomisId}#${req.body.anchor}`);
        }

        res.redirect(`${nextPath}${nomisId}`);
    }));

    return router;
};

function getCurfewAddressFormData(splitAddresses) {

    const {activeAddresses, acceptedAddresses, rejectedAddresses} = splitAddresses;

    if(isEmpty(activeAddresses) && isEmpty(acceptedAddresses) && isEmpty((rejectedAddresses))) {
        return {submitPath: null, addressToShow: []};
    }

    if(!isEmpty(rejectedAddresses) && !isEmpty(activeAddresses)) {
        return {submitPath: '/hdc/proposedAddress/curfewAddress/update/', addressToShow: activeAddresses};
    }

    if(isEmpty(activeAddresses) && isEmpty(acceptedAddresses) && !isEmpty((rejectedAddresses))) {
        return {submitPath: '/hdc/proposedAddress/curfewAddress/add/', addressToShow: []};
    }

    if(!isEmpty(activeAddresses)) {
        return {submitPath: null, addressToShow: activeAddresses};
    }
}
