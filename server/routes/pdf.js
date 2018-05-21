const express = require('express');
const superagent = require('superagent');
const {asyncMiddleware} = require('../utils/middleware');
const config = require('../config');

const pdfGenPath = `${config.pdf.pdfServiceHost}/generate`;
const templateName = config.pdf.templateName;

module.exports = function({logger, pdfService, authenticationMiddleware}) {

    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/view/:nomisId', asyncMiddleware(async (req, res) => {

        const {nomisId} = req.params;
        const data = await pdfService.getPdfLicenceData(nomisId, req.user.token);

        if (data.missing) {
            return res.render('pdf/errors', {nomisId, missing: data.missing});
        }

        return res.redirect('/hdc/pdf/create/' + nomisId);
    }));

    router.get('/create/:nomisId', asyncMiddleware(async (req, res) => {

        const {nomisId} = req.params;
        const data = await pdfService.getPdfLicenceData(nomisId, req.user.token);

        try {
            return await generatePdf(res, data.values);
        } catch (error) {
            logger.error('Error during generate PDF: ', error.stack);
            throw error;
        }
    }));

    async function generatePdf(res, values) {

        logger.info(`Creating PDF at URI '${pdfGenPath}' for template '${templateName}'`);
        logger.debug(values);

        const result = await superagent
            .post(pdfGenPath)
            .send({
                templateName,
                values
            });

        res.writeHead(200, {'Content-Type': 'application/pdf'});
        return res.end(new Buffer(result.body), 'binary');
    }

    return router;
};
