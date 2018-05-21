const {getValues} = require('./utils/pdfFormatter');

module.exports = function createPdfService(licenceService, conditionsService, prisonerService) {

    async function getPdfLicenceData(nomisId, token) {

        const rawLicence = await licenceService.getLicence(nomisId);
        const licence = await conditionsService.populateLicenceWithConditions(rawLicence.licence);
        const prisonerInfo = await prisonerService.getPrisonerDetails(nomisId, token);
        const establishment = await prisonerService.getEstablishmentForPrisoner(nomisId, token);
        const image = await prisonerService.getPrisonerImage(prisonerInfo.facialImageId, token);

        return getValues(nomisId, {licence, prisonerInfo, establishment}, image);
    }

    return {
        getPdfLicenceData
    };
};


