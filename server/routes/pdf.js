const express = require('express');
const {asyncMiddleware} = require('../utils/middleware');
const {templates} = require('./config/pdf');
const {firstItem} = require('../utils/functionalHelpers');

module.exports = function({logger, pdfService, prisonerService, authenticationMiddleware, audit}) {

    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/select/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.params;

        const prisoner = await prisonerService.getPrisonerPersonalDetails(nomisId, req.user.username);
        const errors = firstItem(req.flash('errors')) || {};

        return res.render('pdf/select', {nomisId, templates, prisoner, errors});
    }));

    router.post('/select/:nomisId', (req, res) => {
        const {nomisId} = req.params;
        const {decision} = req.body;

        const templateIds = templates.map(template => template.id);

        if (decision === '' || !templateIds.includes(decision)) {
            req.flash('errors', {decision: 'Select a licence type'});
            return res.redirect(`/hdc/pdf/select/${nomisId}`);
        }

        res.redirect(`/hdc/pdf/view/${decision}/${nomisId}`);
    });

    router.get('/view/:templateName/:nomisId', asyncMiddleware(async (req, res) => {

        const {nomisId, templateName} = req.params;
        logger.debug(`GET pdf/view/${templateName}/${nomisId}`);

        const templateIds = templates.map(template => template.id);
        if (!templateIds.includes(templateName)) {
            throw new Error('Invalid licence template name');
        }

        const {missing} = await pdfService.getPdfLicenceData(templateName, nomisId, req.user.username);

        if (missing) {
            return res.render('pdf/errors', {nomisId, missing, templateName});
        }

        return res.redirect(`/hdc/pdf/create/${templateName}/${nomisId}`);
    }));

    router.get('/create/:templateName/:nomisId', asyncMiddleware(async (req, res) => {

        const {nomisId, templateName} = req.params;
        logger.debug(`GET pdf/create/${nomisId}/${templateName}`);
        const pdf = await pdfService.generatePdf(templateName, nomisId, req.user.username);

        audit.record('CREATE_PDF', req.user.staffId, {templateName, nomisId});

        res.type('application/pdf');
        return res.end(pdf, 'binary');
    }));

    return router;
};
