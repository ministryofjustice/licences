const request = require('supertest');

const {
    loggerStub,
    pdfServiceStub,
    authenticationMiddleware,
    appSetup,
    auditStub,
    createPrisonerServiceStub,
    createLicenceServiceStub
} = require('../supertestSetup');

const createPdfRoute = require('../../server/routes/pdf');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    email: 'user@email',
    role: 'CA'
};

const prisonerService = createPrisonerServiceStub();
const licenceService = createLicenceServiceStub();

const app = appSetup(createPdfRoute({
    logger: loggerStub,
    pdfService: pdfServiceStub,
    authenticationMiddleware,
    audit: auditStub,
    prisonerService,
    licenceService
}), testUser);

const valuesWithMissing = {
    values: {
        OFF_NAME: 'FIRST LAST'
    },
    missing: {
        monitoring:
            {mandatory: {MONITOR: 'Monitoring company telephone number'}}
    }
};

describe('PDF:', () => {

    beforeEach(() => {
        auditStub.record.reset();
        pdfServiceStub.getPdfLicenceData.reset();
    });

    describe('GET /select', () => {

        it('renders dropdown containing licence types', () => {
            return request(app)
                .get('/select/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('<option value="hdc_ap_pss">AP PSS HDC Licence</option>');
                    expect(res.text).to.include('<option value="hdc_yn">HDC Young Person\'s Licence</option>');
                    expect(res.text).to.include('<option value="hdc_ap">AP HDC Licence</option>');
                    expect(res.text).to.include('<option value="hdc_pss">HDC PSS Notice of Supervision</option>');
                });
        });
    });

    describe('POST /select', () => {

        it('redirects to the page of the selected pdf', () => {
            return request(app)
                .post('/select/123')
                .send({decision: 'hdc_ap_pss'})
                .expect(302)
                .expect('Location', '/hdc/pdf/taskList/hdc_ap_pss/123');
        });

        it('redirects back to the select page if nothing selected', () => {
            return request(app)
                .post('/select/123')
                .send({decision: ''})
                .expect(302)
                .expect('Location', '/hdc/pdf/select/123');
        });
    });

    describe('GET /view', () => {

        it('Shows incomplete tasks when missing values', () => {

            pdfServiceStub.getPdfLicenceData.resolves(valuesWithMissing);

            return request(app)
                .get('/taskList/hdc_ap_pss/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('Not complete');
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledOnce();
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledWith(
                        'hdc_ap_pss', '123', {licence: {key: 'value'}}, 'my-token');
                });
        });


        it('Does not allow print when missing values', () => {

            pdfServiceStub.getPdfLicenceData.resolves(valuesWithMissing);

            return request(app)
                .get('/taskList/hdc_ap_pss/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).not.to.include('Ready to create');
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledOnce();
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledWith(
                        'hdc_ap_pss', '123', {licence: {key: 'value'}}, 'my-token');
                });
        });
    });

    describe('GET /create', () => {

        it('Calls pdf service and renders response as PDF', () => {

            const pdf1AsBytes = Buffer.from([80, 68, 70, 45, 49]);
            pdfServiceStub.generatePdf.resolves(pdf1AsBytes);

            return request(app)
                .get('/create/hdc_ap_pss/123')
                .expect(200)
                .expect('Content-Type', 'application/pdf')
                .expect(res => {
                    expect(pdfServiceStub.generatePdf).to.be.calledOnce();
                    expect(pdfServiceStub.generatePdf).to.be.calledWith(
                        'hdc_ap_pss', '123', {licence: {key: 'value'}});
                    expect(res.body.toString()).to.include('PDF-1');
                });
        });

        it('Audits the PDF creation event', () => {

            const pdf1AsBytes = Buffer.from([80, 68, 70, 45, 49]);
            pdfServiceStub.generatePdf.resolves(pdf1AsBytes);

            return request(app)
                .get('/create/hdc_ap_pss/123')
                .expect(200)
                .expect('Content-Type', 'application/pdf')
                .expect(res => {
                    expect(auditStub.record).to.be.calledOnce();
                    expect(auditStub.record).to.be.calledWith(
                        'CREATE_PDF', 'my-staff-id', {nomisId: '123', templateName: 'hdc_ap_pss'});
                });
        });
    });

});

