const express = require('express');
const {asyncMiddleware} = require('../utils/middleware');
const config = require('../config');

const templateName = config.pdf.templateName;

module.exports = function({logger, pdfService, authenticationMiddleware}) {

    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/view/:nomisId', asyncMiddleware(async (req, res) => {

        const {nomisId} = req.params;
        logger.debug(`GET pdf/view/${nomisId}`);
        const {missing} = await pdfService.getPdfLicenceData(templateName, nomisId, {tokenId: req.user.username});

        if (missing) {
            return res.render('pdf/errors', {nomisId, missing});
        }

        return res.redirect('/hdc/pdf/create/' + nomisId);
    }));

    router.get('/create/:nomisId', asyncMiddleware(async (req, res) => {

        const {nomisId} = req.params;
        logger.debug(`GET pdf/create/${nomisId}`);
        const pdf = await pdfService.generatePdf(templateName, nomisId, {tokenId: req.user.username});

        res.type('application/pdf');
        return res.end(pdf, 'binary');
    }));

    return router;
};
