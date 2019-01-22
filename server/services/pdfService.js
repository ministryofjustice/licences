const superagent = require('superagent');
const config = require('../config');

const pdfGenPath = `${config.pdf.pdfServiceHost}/generate`;

module.exports = function createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter) {

    async function getPdfLicenceData(templateName, bookingId, rawLicence, token) {

        const [licence, prisonerInfo, establishment] = await Promise.all([
            conditionsService.populateLicenceWithConditions(rawLicence.licence),
            prisonerService.getPrisonerDetails(bookingId, token),
            prisonerService.getEstablishmentForPrisoner(bookingId, token)
        ]);
        const image = await prisonerService.getPrisonerImage(prisonerInfo.facialImageId, token);

        return pdfFormatter.formatPdfData(templateName, {
            licence,
            prisonerInfo,
            establishment
        }, image, rawLicence.approvedVersionDetails);
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

    async function generatePdf(templateName, bookingId, rawLicence, token, postRelease) {

        const versionedLicence = await checkAndUpdateVersion(rawLicence, bookingId, templateName, postRelease);

        const {values} = await getPdfLicenceData(templateName, bookingId, versionedLicence, token);

        return getPdf(templateName, values);
    }

    async function checkAndUpdateVersion(rawLicence, bookingId, template, postRelease) {

        const {version, approvedVersionDetails} = rawLicence;

        const templateChange = approvedVersionDetails && template !== approvedVersionDetails.template;

        if (templateChange) {
            await licenceService.update({
                bookingId,
                originalLicence: rawLicence,
                config: {fields: [{decision: {}}], noModify: true},
                userInput: {decision: template},
                licenceSection: 'document',
                formName: 'template',
                postRelease
            });
        }

        if (!approvedVersionDetails || version > approvedVersionDetails.version || templateChange) {
            await licenceService.saveApprovedLicenceVersion(bookingId, template);
            return licenceService.getLicence(bookingId);
        }

        return rawLicence;
    }

    return {
        getPdfLicenceData,
        getPdf,
        generatePdf
    };
};
