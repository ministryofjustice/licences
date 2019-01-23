const nock = require('nock');

const createPdfService = require('../../server/services/pdfService');
const config = require('../../server/config');

describe('pdfService', () => {
    let licenceService;
    let conditionsService;
    let prisonerService;
    let pdfFormatter;
    let service;
    let fakePdfGenerator;

    const licence = {key: 'value'};
    const licenceResponse = {licence};
    const prisonerResponse = {facialImageId: 'imageId'};
    const establishmentResponse = {};
    const imageResponse = {};
    const values = {
        OFF_NAME: 'FIRST LAST'
    };
    const pdf1AsBytes = [80, 68, 70, 45, 49];
    const templateName = 'hdc_ap_pss';
    const logger = {
        info: sinon.stub(),
        error: sinon.stub()
    };

    beforeEach(() => {
        licenceService = {
            getLicence: sinon.stub().resolves(licenceResponse),
            saveApprovedLicenceVersion: sinon.stub().resolves({}),
            update: sinon.stub().resolves({})
        };

        conditionsService = {
            populateLicenceWithConditions: sinon.stub().resolves(licence)
        };

        prisonerService = {
            getPrisonerDetails: sinon.stub().resolves(prisonerResponse),
            getEstablishmentForPrisoner: sinon.stub().resolves(establishmentResponse),
            getPrisonerImage: sinon.stub().resolves(imageResponse)
        };

        pdfFormatter = {
            formatPdfData: sinon.stub().resolves({values}),
            DEFAULT_PLACEHOLDER: 'placeholder'
        };

        service = createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter);
        fakePdfGenerator = nock(`${config.pdf.pdfServiceHost}`);
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('generatePdf', () => {
        it('should call services, format data, and return as buffer', async () => {
            fakePdfGenerator
                .post('/generate', {templateName, values})
                .reply(200, pdf1AsBytes);

            const result = await service.generatePdf(templateName, '123', {licence: {key: 'value'}}, 'token', false);

            expect(conditionsService.populateLicenceWithConditions).to.be.calledOnce();
            expect(prisonerService.getPrisonerDetails).to.be.calledOnce();
            expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce();
            expect(prisonerService.getPrisonerImage).to.be.calledOnce();
            expect(pdfFormatter.formatPdfData).to.be.calledOnce();

            expect(result).to.eql(new Buffer(pdf1AsBytes));
        });

        it('should increment the version if first version', async () => {
            fakePdfGenerator
                .post('/generate', {templateName, values})
                .reply(200, pdf1AsBytes);

            const rawLicence = {licence: {key: 'value'}};
            await service.generatePdf(templateName, '123', rawLicence, 'username');

            expect(licenceService.saveApprovedLicenceVersion).to.be.calledOnce();
            expect(licenceService.saveApprovedLicenceVersion).to.be.calledWith('123');
            expect(licenceService.getLicence).to.be.calledOnce();
        });

        it('should increment the version if approved version is lower than current version', async () => {
            fakePdfGenerator
                .post('/generate', {templateName, values})
                .reply(200, pdf1AsBytes);

            const rawLicence = {licence: {key: 'value'},
                versionDetails: {version: 4, vary_version: 0},
                approvedVersionDetails: {version: 3, vary_version: 0}};
            await service.generatePdf(templateName, '123', rawLicence, 'username');

            expect(licenceService.saveApprovedLicenceVersion).to.be.calledOnce();
            expect(licenceService.saveApprovedLicenceVersion).to.be.calledWith('123');
            expect(licenceService.getLicence).to.be.calledOnce();
        });

        it('should update licence & increment version if template is different', async () => {
            fakePdfGenerator
                .post('/generate', {templateName, values})
                .reply(200, pdf1AsBytes);

            const rawLicence = {
                licence: {key: 'value'},
                versionDetails: {version: 4, vary_version: 0},
                approvedVersionDetails: {version: 4, template: 'other_template'}
            };

            await service.generatePdf(templateName, '123', rawLicence, 'token', true);

            expect(licenceService.update).to.be.calledOnce();
            expect(licenceService.saveApprovedLicenceVersion).to.be.calledOnce();
            expect(licenceService.saveApprovedLicenceVersion).to.be.calledWith('123');
            expect(licenceService.getLicence).to.be.calledOnce();
        });

        it('should pass postApproval to update', async () => {
            fakePdfGenerator
                .post('/generate', {templateName, values})
                .reply(200, pdf1AsBytes);

            const rawLicence = {
                licence: {key: 'value'},
                versionDetails: {version: 4, vary_version: 0},
                approvedVersionDetails: {version: 4, template: 'other_template'}
            };

            await service.generatePdf(templateName, '123', rawLicence, 'token', true);

            expect(licenceService.update.getCalls()[0].args[0].postRelease).to.eql(true);
        });

        it('should not update licence when incrementing version if template is same', async () => {
            fakePdfGenerator
                .post('/generate', {templateName, values})
                .reply(200, pdf1AsBytes);

            const rawLicence = {
                licence: {key: 'value'},
                versionDetails: {version: 4, vary_version: 0},
                approvedVersionDetails: {version: 3, template: 'hdc_ap_pss'}
            };

            await service.generatePdf(templateName, '123', rawLicence, 'username');

            expect(licenceService.update).not.to.be.calledOnce();
            expect(licenceService.saveApprovedLicenceVersion).to.be.calledOnce();
            expect(licenceService.saveApprovedLicenceVersion).to.be.calledWith('123');
            expect(licenceService.getLicence).to.be.calledOnce();
        });

        it('should not update licence when incrementing version if first version', async () => {
            fakePdfGenerator
                .post('/generate', {templateName, values})
                .reply(200, pdf1AsBytes);

            const rawLicence = {
                licence: {key: 'value'},
                versionDetails: {version: 1, vary_version: 0}
            };

            await service.generatePdf(templateName, '123', rawLicence, 'username');

            expect(licenceService.update).not.to.be.calledOnce();
            expect(licenceService.saveApprovedLicenceVersion).to.be.calledOnce();
            expect(licenceService.saveApprovedLicenceVersion).to.be.calledWith('123');
            expect(licenceService.getLicence).to.be.calledOnce();
        });

        it('should replace the approver value if postDecision and vary_approver added', async () => {
            pdfFormatter.formatPdfData.resolves({values: {APPROVER: '1', VARY_APPROVER: '2'}});
            const prValues = {APPROVER: '2', VARY_APPROVER: '2'};

            fakePdfGenerator
                .post('/generate', {templateName, values: prValues})
                .reply(200, pdf1AsBytes);

            const rawLicence = {
                licence: {key: 'value'},
                versionDetails: {version: 4},
                approvedVersionDetails: {version: 4, template: 'hdc_ap_pss'}
            };

            await service.generatePdf(templateName, '123', rawLicence, 'username', true);

            expect(licenceService.saveApprovedLicenceVersion).to.not.be.called();
        });

        it('should not replace the approver value if postDecision and no vary_approver added', async () => {
            pdfFormatter.formatPdfData.resolves({values: {APPROVER: '1', VARY_APPROVER: 'placeholder'}});

            fakePdfGenerator
                .post('/generate', {templateName, values: {APPROVER: '1', VARY_APPROVER: 'placeholder'}})
                .reply(200, pdf1AsBytes);

            const rawLicence = {
                licence: {key: 'value'},
                versionDetails: {version: 4},
                approvedVersionDetails: {version: 4, template: 'hdc_ap_pss'}
            };

            await service.generatePdf(templateName, '123', rawLicence, 'username', true);

            expect(licenceService.saveApprovedLicenceVersion).to.not.be.called();
        });

        it('should not replace the approver value if not postDecision', async () => {
            pdfFormatter.formatPdfData.resolves({values: {APPROVER: '1', VARY_APPROVER: '2'}});

            fakePdfGenerator
                .post('/generate', {templateName, values: {APPROVER: '1', VARY_APPROVER: '2'}})
                .reply(200, pdf1AsBytes);

            const rawLicence = {
                licence: {key: 'value'},
                versionDetails: {version: 4},
                approvedVersionDetails: {version: 4, template: 'hdc_ap_pss'}
            };

            await service.generatePdf(templateName, '123', rawLicence, 'username', false);

            expect(licenceService.saveApprovedLicenceVersion).to.not.be.called();
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

        const rawLicence = {
            licence: {key: 'value'},
            approvedVersion: 1.3,
            approvedVersionDetails: {a: 'a'}
        };

        it('should request details from services and pass to formatter', async () => {
            await service.getPdfLicenceData(templateName, '123', rawLicence, 'token');

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
                templateName, {
                    licence,
                    prisonerInfo: prisonerResponse,
                    establishment: establishmentResponse
                }, imageResponse, {a: 'a', approvedVersion: 1.3});
        });

        it('should throw if error in other service', () => {
            prisonerService.getPrisonerDetails.rejects(new Error('dead'));
            return expect(service.getPdfLicenceData(
                templateName, '123', rawLicence, 'token')).to.be.rejected();
        });
    });
});
