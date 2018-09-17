const express = require('express');

const {async, checkLicenceMiddleWare, authorisationMiddleware, auditMiddleware}
    = require('../utils/middleware');
const {getIn, isEmpty, firstItem} = require('../utils/functionalHelpers');
const {getPathFor} = require('../utils/routes');
const {getLicenceStatus} = require('../utils/licenceStatus');
const createConditionsRoutes = require('./hdcRoutes/licenceConditions');
const createReviewRoutes = require('./hdcRoutes/review');
const createApprovalRoutes = require('./hdcRoutes/approval');
const createCurfewRoutes = require('./hdcRoutes/curfew');
const createProposedAddressRoutes = require('./hdcRoutes/proposedAddress');

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

    const audited = auditMiddleware(audit, 'UPDATE_SECTION');

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    const conditions = createConditionsRoutes({conditionsService, licenceService, logger});
    router.get('/licenceConditions/standard/:bookingId', async(conditions.getStandard));
    router.get('/licenceConditions/additionalConditions/:bookingId', async(conditions.getAdditional));
    router.post('/licenceConditions/additionalConditions/:bookingId', audited, async(conditions.postAdditional));
    router.get('/licenceConditions/conditionsSummary/:bookingId', async(conditions.getConditionsSummary));
    router.post('/licenceConditions/additionalConditions/:bookingId/delete/:conditionId', audited,
        async(conditions.postDeleteAdditionalCondition));

    const review = createReviewRoutes({conditionsService, licenceService, prisonerService, logger});
    router.get('/review/:sectionName/:bookingId', async(review.getReviewSection));

    const approval = createApprovalRoutes({conditionsService, licenceService, prisonerService, logger});
    router.get('/approval/release/:bookingId', async(approval.getApprovalRelease));
    router.get('/approval/refuseReason/:bookingId', async(approval.getRefuseReason));

    const curfew = createCurfewRoutes({licenceService, logger});
    router.get('/curfew/curfewAddressReview/:bookingId', curfew.getCurfewAddressReview);
    router.get('/curfew/addressSafety/:bookingId', curfew.getAddressSafetyReview);
    router.post('/curfew/curfewAddressReview/:bookingId', audited, async(curfew.postCurfewAddressReview));
    router.post('/curfew/addressSafety/:bookingId', audited, async(curfew.postAddressSafetyReview));
    router.post('/curfew/withdrawAddress/:bookingId', audited, async(curfew.postWithdrawAddress));
    router.post('/curfew/withdrawConsent/:bookingId', audited, async(curfew.postWithdrawConsent));
    router.post('/curfew/reinstateAddress/:bookingId', audited, async(curfew.postReinstateAddress));

    const proposedAddress = createProposedAddressRoutes({licenceService, logger});
    router.get('/proposedAddress/curfewAddress/:bookingId', proposedAddress.getAddress);
    router.post('/proposedAddress/curfewAddress/add/:bookingId', audited, async(proposedAddress.postAddAddress));
    router.post('/proposedAddress/curfewAddress/update/:bookingId', audited, async(proposedAddress.postUpdateAddress));

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

    router.post('/:sectionName/:formName/:bookingId', audited, async(async (req, res) => {
        const {sectionName, formName, bookingId} = req.params;
        logger.debug(`POST ${sectionName}/${formName}/${bookingId}`);

        return formPost(req, res, sectionName, formName, bookingId);
    }));

    router.post('/:sectionName/:formName/:path/:bookingId', audited, async(async (req, res) => {
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

        if (req.body.anchor) {
            return res.redirect(`${nextPath}${path}${bookingId}#${req.body.anchor}`);
        }

        res.redirect(`${nextPath}${path}${bookingId}`);
    }

    return router;
};


