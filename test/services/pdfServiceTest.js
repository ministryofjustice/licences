const createPdfService = require('../../server/services/pdfService');
const {expect, sandbox} = require('../testSetup');

describe('pdfService', () => {

    const licenceService = {
        getLicence: sandbox.stub().returnsPromise().resolves({licence: {key: 'value'}})
    };

    const conditionsService = {
        populateLicenceWithConditions: sandbox.stub().returnsPromise().resolves({})
    };

    const prisonerService = {
        getPrisonerDetails: sandbox.stub().returnsPromise().resolves({facialImageId: 'imageId'}),
        getEstablishmentForPrisoner: sandbox.stub().returnsPromise().resolves({}),
        getPrisonerImage: sandbox.stub().returnsPromise().resolves({})
    };

    const service = createPdfService(licenceService, conditionsService, prisonerService);

    afterEach(() => {
        sandbox.reset();
    });

    describe('getPdfLicenceData', () => {
        it('should request details from services', async () => {

            await service.getPdfLicenceData('123', 'token');

            expect(licenceService.getLicence).to.be.calledOnce();
            expect(licenceService.getLicence).to.be.calledWith('123');

            expect(conditionsService.populateLicenceWithConditions).to.be.calledOnce();
            expect(conditionsService.populateLicenceWithConditions).to.be.calledWith({key: 'value'});

            expect(prisonerService.getPrisonerDetails).to.be.calledOnce();
            expect(prisonerService.getPrisonerDetails).to.be.calledWith('123');

            expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce();
            expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith('123');

            expect(prisonerService.getPrisonerImage).to.be.calledOnce();
            expect(prisonerService.getPrisonerImage).to.be.calledWith('imageId');
        });

        it('should return values and missing', async () => {
            const result = await service.getPdfLicenceData('123', 'token');

            expect(result.values.OFF_NAME).to.equal('(DATA MISSING)');
            expect(result.missing.OFF_NAME).to.equal('Offender name');
        });

        it('should throw if error in other service', () => {
            licenceService.getLicence.rejects(new Error('dead'));

            return expect(service.getPdfLicenceData('123')).to.be.rejected();
        });
    });

});
