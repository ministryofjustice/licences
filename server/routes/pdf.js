const express = require('express');
const {async, checkLicenceMiddleWare, authorisationMiddleware, auditMiddleware} =
    require('../utils/middleware');
const {templates} = require('./config/pdf');
const {firstItem, getIn, isEmpty} = require('../utils/functionalHelpers');

module.exports = function(
    {logger, pdfService, prisonerService, authenticationMiddleware, licenceService, conditionsService, audit}) {

    const router = express.Router();
    router.use(authenticationMiddleware());
    router.param('bookingId', checkLicenceMiddleWare(licenceService, prisonerService));
    router.param('bookingId', authorisationMiddleware);

    const audited = auditMiddleware(audit, 'CREATE_PDF');

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/select/:bookingId', async(async (req, res) => {
        const {bookingId} = req.params;

        const prisoner = await prisonerService.getPrisonerPersonalDetails(bookingId, req.user.token);
        const errors = firstItem(req.flash('errors')) || {};

        const lastTemplate = getIn(res.locals.licence, ['approvedVersion', 'template']);

        return res.render('pdf/select', {bookingId, templates, prisoner, errors, lastTemplate});
    }));

    router.post('/select/:bookingId', (req, res) => {
        const {bookingId} = req.params;
        const {decision} = req.body;

        const templateIds = templates.map(template => template.id);

        if (decision === '' || !templateIds.includes(decision)) {
            req.flash('errors', {decision: 'Select a licence type'});
            return res.redirect(`/hdc/pdf/select/${bookingId}`);
        }

        res.redirect(`/hdc/pdf/taskList/${decision}/${bookingId}`);
    });

    router.get('/taskList/:templateName/:bookingId', async(async (req, res) => {

        const {bookingId, templateName} = req.params;
        const {licence} = res.locals;
        logger.debug(`GET pdf/taskList/${templateName}/${bookingId}`);

        const templateLabel = getTemplateLabel(templateName);

        if (!templateLabel) {
            throw new Error('Invalid licence template name: ' + templateName);
        }

        const [prisoner, {missing}] = await Promise.all([
            prisonerService.getPrisonerPersonalDetails(bookingId, req.user.token),
            pdfService.getPdfLicenceData(templateName, bookingId, licence, req.user.token)
        ]);

        const incompleteGroups = Object.keys(missing).filter(group => missing[group].mandatory);
        const canPrint = !incompleteGroups || isEmpty(incompleteGroups);

        return res.render('pdf/createLicenceTaskList', {
            bookingId,
            missing,
            templateName,
            prisoner,
            incompleteGroups,
            canPrint,
            versionInfo: getVersionInfo(licence, templateLabel)
        });
    }));

    function getTemplateLabel(templateName) {
        const templateConfig = templates.find(template => template.id === templateName);
        return getIn(templateConfig, ['label']);
    }

    function getVersionInfo(licence, templateLabel) {

        const lastTemplateLabel = licence.approvedVersion ?
            getTemplateLabel(licence.approvedVersion.template) : undefined;
        const isNewTemplate = licence.approvedVersion && templateLabel !== lastTemplateLabel;
        const isNewVersion = !licence.approvedVersion || licence.version > licence.approvedVersion.version;

        return {
            currentVersion: licence.version,
            lastVersion: licence.approvedVersion,
            isNewVersion,
            templateLabel,
            lastTemplateLabel,
            isNewTemplate
        };
    }

    router.get('/missing/:section/:templateName/:bookingId', async(async (req, res) => {

        const {bookingId, templateName, section} = req.params;
        const {licence} = res.locals;
        logger.debug(`GET pdf/missing/${section}/${templateName}/${bookingId}`);

        const [prisoner, {missing}] = await Promise.all([
            prisonerService.getPrisonerPersonalDetails(bookingId, req.user.token),
            pdfService.getPdfLicenceData(templateName, bookingId, licence, req.user.token)
        ]);

        const data = {};

        return res.render(`pdf/missing/${section}`, {
            bookingId,
            missing,
            templateName,
            prisoner,
            data
        });
    }));

    router.get('/create/:templateName/:bookingId', audited, async(async (req, res) => {

        const {bookingId, templateName} = req.params;
        const {licence} = res.locals;
        logger.debug(`GET pdf/create/${bookingId}/${templateName}`);

        const pdf = await pdfService.generatePdf(templateName, bookingId, licence, req.user.token);

        res.type('application/pdf');
        return res.end(pdf, 'binary');
    }));

    return router;
};
