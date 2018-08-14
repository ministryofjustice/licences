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

        return pdfFormatter.formatPdfData(templateName, nomisId, {
            licence,
            prisonerInfo,
            establishment
        }, image, rawLicence.approvedVersion);
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

        const versionedLicence = await checkAndUpdateVersion(rawLicence, nomisId, templateName);

        const {values} = await getPdfLicenceData(templateName, nomisId, versionedLicence, token);

        return getPdf(templateName, values);
    }

    async function checkAndUpdateVersion(rawLicence, nomisId, template) {

        const {version, approvedVersion} = rawLicence;

        const templateChange = approvedVersion && template !== approvedVersion.template;

        if (templateChange) {
            await licenceService.update({
                nomisId: nomisId,
                config: {fields: [{decision: {}}], noModify: true},
                userInput: {decision: template},
                licenceSection: 'document',
                formName: 'template'
            });
        }

        if (!approvedVersion || version > approvedVersion.version || templateChange) {
            await licenceService.saveApprovedLicenceVersion(nomisId, template);
            return licenceService.getLicence(nomisId);
        }

        return rawLicence;
    }

    return {
        getPdfLicenceData,
        getPdf,
        generatePdf
    };
};
