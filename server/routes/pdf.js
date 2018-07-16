const express = require('express');
const {asyncMiddleware} = require('../utils/middleware');
const {templates} = require('./config/pdf');

module.exports = function({logger, pdfService, authenticationMiddleware, audit}) {

    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/view/:templateName/:nomisId', asyncMiddleware(async (req, res) => {

        const {nomisId, templateName} = req.params;
        logger.debug(`GET pdf/view/${templateName}/${nomisId}`);

        if (!templates.includes(templateName)) {
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
