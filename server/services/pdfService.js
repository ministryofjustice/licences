const superagent = require('superagent');
const config = require('../config');

const pdfGenPath = `${config.pdf.pdfServiceHost}/generate`;

module.exports = function createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter) {

    async function getPdfLicenceData(templateName, nomisId, rawLicence, token) {

        const [licence, prisonerInfo, establishment] = await Promise.all([
            conditionsService.populateLicenceWithConditions(rawLicence.licence),
            prisonerService.getPrisonerDetails(nomisId, token),
            prisonerService.getEstablishmentForPrisoner(nomisId, token)
        ]);
        const image = await prisonerService.getPrisonerImage(prisonerInfo.facialImageId, token);

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

    async function generatePdf(templateName, nomisId, rawLicence, token) {
        const {values} = await getPdfLicenceData(templateName, nomisId, rawLicence, token);

        const {version, approvedVersion} = rawLicence;

        if (!approvedVersion || version > approvedVersion.version) {
            await licenceService.updateVersion(nomisId);
        }

        return getPdf(templateName, values);
    }

    return {
        getPdfLicenceData,
        getPdf,
        generatePdf
    };
};
