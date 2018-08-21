const express = require('express');
const {asyncMiddleware, checkLicenceMiddleWare, authorisationMiddleware} = require('../utils/middleware');
const {templates} = require('./config/pdf');
const {firstItem, getIn} = require('../utils/functionalHelpers');

module.exports = function(
    {logger, pdfService, prisonerService, authenticationMiddleware, licenceService, conditionsService, audit}) {

    const router = express.Router();
    router.use(authenticationMiddleware());
    router.param('nomisId', checkLicenceMiddleWare(licenceService, prisonerService));
    router.param('nomisId', authorisationMiddleware);

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/select/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.params;

        const prisoner = await prisonerService.getPrisonerPersonalDetails(nomisId, req.user.token);
        const errors = firstItem(req.flash('errors')) || {};

        const lastTemplate = getIn(res.locals.licence, ['approvedVersion', 'template']);

        return res.render('pdf/select', {nomisId, templates, prisoner, errors, lastTemplate});
    }));

    router.post('/select/:nomisId', (req, res) => {
        const {nomisId} = req.params;
        const {decision} = req.body;

        const templateIds = templates.map(template => template.id);

        if (decision === '' || !templateIds.includes(decision)) {
            req.flash('errors', {decision: 'Select a licence type'});
            return res.redirect(`/hdc/pdf/select/${nomisId}`);
        }

        res.redirect(`/hdc/pdf/taskList/${decision}/${nomisId}`);
    });

    router.get('/taskList/:templateName/:nomisId', asyncMiddleware(async (req, res) => {

        const {nomisId, templateName} = req.params;
        const {licence} = res.locals;
        logger.debug(`GET pdf/taskList/${templateName}/${nomisId}`);

        const templateLabel = getTemplateLabel(templateName);

        if (!templateLabel) {
            throw new Error('Invalid licence template name: ' + templateName);
        }

        const [prisoner, {missing}] = await Promise.all([
            prisonerService.getPrisonerPersonalDetails(nomisId, req.user.token),
            pdfService.getPdfLicenceData(templateName, nomisId, licence, req.user.token)
        ]);

        const incompleteGroups = Object.keys(missing).find(group => missing[group].mandatory);
        const canPrint = !incompleteGroups;

        return res.render('pdf/createLicenceTaskList', {
            nomisId,
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

    router.get('/missing/:section/:templateName/:nomisId', asyncMiddleware(async (req, res) => {

        const {nomisId, templateName, section} = req.params;
        const {licence} = res.locals;
        logger.debug(`GET pdf/missing/${section}/${templateName}/${nomisId}`);

        const [prisoner, {missing}] = await Promise.all([
            prisonerService.getPrisonerPersonalDetails(nomisId, req.user.token),
            pdfService.getPdfLicenceData(templateName, nomisId, licence, req.user.token)
        ]);

        const data = {};

        return res.render(`pdf/missing/${section}`, {
            nomisId,
            missing,
            templateName,
            prisoner,
            data
        });
    }));

    router.get('/create/:templateName/:nomisId', asyncMiddleware(async (req, res) => {

        const {nomisId, templateName} = req.params;
        const {licence} = res.locals;
        logger.debug(`GET pdf/create/${nomisId}/${templateName}`);

        const pdf = await pdfService.generatePdf(templateName, nomisId, licence, req.user.token);

        audit.record('CREATE_PDF', req.user.staffId, {templateName, nomisId});

        res.type('application/pdf');
        return res.end(pdf, 'binary');
    }));

    return router;
};
