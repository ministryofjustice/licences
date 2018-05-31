const createPdfService = require('../../server/services/pdfService');
const {
    expect,
    sandbox,
    nock
} = require('../supertestSetup');
const config = require('../../server/config');

describe('pdfService', () => {

    const licence = {key: 'value'};
    const licenceResponse = {licence};
    const prisonerResponse = {facialImageId: 'imageId'};
    const establishmentResponse = {};
    const imageResponse = {};

    const licenceService = {
        getLicence: sandbox.stub().returnsPromise().resolves(licenceResponse)
    };

    const conditionsService = {
        populateLicenceWithConditions: sandbox.stub().returnsPromise().resolves(licence)
    };

    const prisonerService = {
        getPrisonerDetails: sandbox.stub().returnsPromise().resolves(prisonerResponse),
        getEstablishmentForPrisoner: sandbox.stub().returnsPromise().resolves(establishmentResponse),
        getPrisonerImage: sandbox.stub().returnsPromise().resolves(imageResponse)
    };

    const logger = {
        info: sandbox.stub(),
        error: sandbox.stub()
    };

    const values = {
        OFF_NAME: 'FIRST LAST'
    };

    const pdf1AsBytes = [80, 68, 70, 45, 49];

    const pdfFormatter = {
        formatPdfData: sandbox.stub().returnsPromise().resolves({values})
    };

    const service = createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter);

    const templateName = 'hdc_ap_pss';

    const fakePdfGenerator = nock(`${config.pdf.pdfServiceHost}`);

    afterEach(() => {
        sandbox.reset();
        nock.cleanAll();
    });

    describe('generatePdf', () => {

        it('should call services, format data, and return as buffer', async () => {

            fakePdfGenerator
                .post('/generate', {templateName, values})
                .reply(200, pdf1AsBytes);

            const result = await service.generatePdf(templateName, '123', {tokenId: 'token'});

            expect(licenceService.getLicence).to.be.calledOnce();
            expect(conditionsService.populateLicenceWithConditions).to.be.calledOnce();
            expect(prisonerService.getPrisonerDetails).to.be.calledOnce();
            expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce();
            expect(prisonerService.getPrisonerImage).to.be.calledOnce();
            expect(pdfFormatter.formatPdfData).to.be.calledOnce();

            expect(result).to.eql(new Buffer(pdf1AsBytes));
        });

    });

    describe('getPdf', () => {

        it('Posts to PDF generator and renders response as byte buffer', async () => {

            fakePdfGenerator
                .post('/generate', {templateName, values})
                .reply(200, pdf1AsBytes);

            const result = await service.getPdf(templateName, values);
            expect(result).to.eql(new Buffer(pdf1AsBytes));
        });

        it('should throw if error in PDF generator service', () => {

            fakePdfGenerator
                .post('/generate', {templateName, values})
                .reply(500, 'DIED');

            return expect(service.getPdf(templateName, values)).to.be.rejected();
        });
    });

    describe('getPdfLicenceData', () => {
        it('should request details from services and pass to formatter', async () => {

            await service.getPdfLicenceData(templateName, '123', 'token');

            expect(licenceService.getLicence).to.be.calledOnce();
            expect(licenceService.getLicence).to.be.calledWith('123');

            expect(conditionsService.populateLicenceWithConditions).to.be.calledOnce();
            expect(conditionsService.populateLicenceWithConditions).to.be.calledWith(licence);

            expect(prisonerService.getPrisonerDetails).to.be.calledOnce();
            expect(prisonerService.getPrisonerDetails).to.be.calledWith('123');

            expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce();
            expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith('123');

            expect(prisonerService.getPrisonerImage).to.be.calledOnce();
            expect(prisonerService.getPrisonerImage).to.be.calledWith('imageId');

            expect(pdfFormatter.formatPdfData).to.be.calledOnce();
            expect(pdfFormatter.formatPdfData).to.be.calledWith(
                templateName, '123',
                {licence, prisonerInfo: prisonerResponse, establishment: establishmentResponse}, imageResponse);
        });


        it('should throw if error in other service', () => {

            licenceService.getLicence.rejects(new Error('dead'));
            return expect(service.getPdfLicenceData(templateName, '123', 'token')).to.be.rejected();
        });
    });
});
