const superagent = require('superagent');
const config = require('../config');

const pdfGenPath = `${config.pdf.pdfServiceHost}/generate`;

module.exports = function createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter) {

    async function getPdfLicenceData(templateName, nomisId, {tokenId}) {

        const rawLicence = await licenceService.getLicence(nomisId);
        const licence = await conditionsService.populateLicenceWithConditions(rawLicence.licence);
        const prisonerInfo = await prisonerService.getPrisonerDetails(nomisId, {tokenId});
        const establishment = await prisonerService.getEstablishmentForPrisoner(nomisId, {tokenId});
        const image = await prisonerService.getPrisonerImage(prisonerInfo.facialImageId, {tokenId});

        return pdfFormatter.formatPdfData(templateName, nomisId, {licence, prisonerInfo, establishment}, image);
    }

    async function getPdf(templateName, values) {

        logger.info(`Creating PDF at URI '${pdfGenPath}' for template '${templateName}'`);

        try {
            const result = await superagent
                .post(pdfGenPath)
                .send({
                    templateName,
                    values
                });
            return Buffer.from(result.body);

        } catch (error) {
            logger.error('Error during generate PDF: ', error.stack);
            throw error;
        }
    }

    async function generatePdf(templateName, nomisId, {tokenId}) {
        const {values} = await getPdfLicenceData(templateName, nomisId, {tokenId});
        return getPdf(templateName, values);
    }

    return {
        getPdfLicenceData,
        getPdf,
        generatePdf
    };
};
