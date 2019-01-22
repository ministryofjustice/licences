const request = require('supertest');

const {
    pdfServiceStub,
    appSetup,
    auditStub,
    createPrisonerServiceStub,
    createLicenceServiceStub,
    signInServiceStub
} = require('../supertestSetup');

const standardRouter = require('../../server/routes/routeWorkers/standardRouter');
const createPdfRouter = require('../../server/routes/pdf');

const licenceServiceStub = createLicenceServiceStub();

let app;

const valuesWithMissing = {
    values: {
        OFF_NAME: 'FIRST LAST'
    },
    missing: {
        firstNight:
            {mandatory: {CURFEW_FIRST_FROM: 'Curfew first night from'}},
        reporting:
            {mandatory: {REPORTING_AT: 'reporting date'}},
        sentence:
            {mandatory: {OFF_NOMS: 'noms id'}}
    }
};

const valuesWithoutMissing = {
    values: {
        OFF_NAME: 'FIRST LAST'
    },
    missing: {}
};

describe('PDF:', () => {

    const prisonerServiceStub = createPrisonerServiceStub();
    prisonerServiceStub.getPrisonerPersonalDetails.resolves({agencyLocationId: 'out'});

    beforeEach(() => {
        app = createApp({licenceServiceStub, pdfServiceStub, prisonerServiceStub}, 'caUser');
        auditStub.record.reset();
        pdfServiceStub.getPdfLicenceData.reset();
        licenceServiceStub.getLicence.resolves({licence: {key: 'value'}});
    });

    describe('GET /select', () => {

        it('renders dropdown containing licence types', () => {
            return request(app)
                .get('/hdc/pdf/select/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('<option value="hdc_ap_pss">AP PSS HDC Licence</option>');
                    expect(res.text).to.include('<option value="hdc_yn">HDC Young Person\'s Licence</option>');
                    expect(res.text).to.include('<option value="hdc_ap">AP HDC Licence</option>');
                    expect(res.text).to.include('<option value="hdc_pss">HDC PSS Notice of Supervision</option>');
                });
        });

        it('defaults to type used in last approved version', () => {

            licenceServiceStub.getLicence.resolves({approvedVersionDetails: {template: 'hdc_ap'}});

            return request(app)
                .get('/hdc/pdf/select/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('<option value="hdc_ap_pss">AP PSS HDC Licence</option>');
                    expect(res.text).to.include('<option value="hdc_yn">HDC Young Person\'s Licence</option>');
                    expect(res.text).to.include('<option value="hdc_ap" selected>AP HDC Licence</option>');
                    expect(res.text).to.include('<option value="hdc_pss">HDC PSS Notice of Supervision</option>');
                });
        });

        it('should throw if a non ca or ro tries to access the page', () => {
            app = createApp({}, 'dmUser');

            licenceServiceStub.getLicence.resolves({approvedVersionDetails: {template: 'hdc_ap'}});

            return request(app)
                .get('/hdc/pdf/select/123')
                .expect(403);
        });
    });

    describe('POST /select', () => {

        it('redirects to the page of the selected pdf', () => {
            return request(app)
                .post('/hdc/pdf/select/123')
                .send({decision: 'hdc_ap_pss'})
                .expect(302)
                .expect('Location', '/hdc/pdf/taskList/hdc_ap_pss/123');
        });

        it('redirects back to the select page if nothing selected', () => {
            return request(app)
                .post('/hdc/pdf/select/123')
                .send({decision: ''})
                .expect(302)
                .expect('Location', '/hdc/pdf/select/123');
        });

        it('should throw if a non ca or ro tries to post to the route', () => {
            app = createApp({}, 'dmUser', '/hdc/pdf');

            return request(app)
                .post('/hdc/pdf/select/123')
                .send({decision: ''})
                .expect(403);
        });
    });

    describe('GET /taskList', () => {

        it('Shows incomplete status on each task with missing data', () => {

            pdfServiceStub.getPdfLicenceData.resolves(valuesWithMissing);

            return request(app)
                .get('/hdc/pdf/taskList/hdc_ap_pss/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('id="firstNightTaskStatus">Not complete');
                    expect(res.text).to.include('id="reportingTaskStatus">Not complete');
                    expect(res.text).to.include('id="sentenceTaskStatus">Not complete');
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledOnce();
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledWith(
                        'hdc_ap_pss', '123', {licence: {key: 'value'}}, 'token');
                });
        });

        it('Does not allow print when missing values', () => {

            pdfServiceStub.getPdfLicenceData.resolves(valuesWithMissing);

            return request(app)
                .get('/hdc/pdf/taskList/hdc_ap_pss/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).not.to.include('Ready to create');
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledOnce();
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledWith(
                        'hdc_ap_pss', '123', {licence: {key: 'value'}}, 'token');
                });
        });

        it('Shows template version info - same version when same template', () => {

            pdfServiceStub.getPdfLicenceData.resolves(valuesWithoutMissing);

            licenceServiceStub.getLicence.resolves({
                version: 1,
                approvedVersionDetails: {template: 'hdc_ap', version: 1, timestamp: '11/12/13'}
            });

            return request(app)
                .get('/hdc/pdf/taskList/hdc_ap/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('Ready to print');
                    expect(res.text).to.include('11/12/13');
                    expect(res.text).to.include('AP HDC Licence');
                    expect(res.text).to.include('Version 1');
                });
        });

        it('Shows template version info - new version when new template', () => {

            pdfServiceStub.getPdfLicenceData.resolves(valuesWithoutMissing);

            licenceServiceStub.getLicence.resolves({
                version: 1,
                approvedVersionDetails: {template: 'hdc_ap', version: 1, timestamp: '11/12/13'}
            });

            return request(app)
                .get('/hdc/pdf/taskList/hdc_ap_pss/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('Ready to print version 2');
                    expect(res.text).to.include('AP PSS HDC Licence');
                    expect(res.text).to.include('11/12/13');
                    expect(res.text).to.include('AP HDC Licence');
                    expect(res.text).to.include('Version 1');
                });
        });

        it('Shows template version info - new version when modified licence version', () => {

            pdfServiceStub.getPdfLicenceData.resolves(valuesWithoutMissing);

            licenceServiceStub.getLicence.resolves({
                version: 2,
                approvedVersionDetails: {template: 'hdc_ap', version: 1, timestamp: '11/12/13'}
            });

            return request(app)
                .get('/hdc/pdf/taskList/hdc_ap/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('Ready to print version 2');
                    expect(res.text).to.include('11/12/13');
                    expect(res.text).to.include('AP HDC Licence');
                    expect(res.text).to.include('Version 1');
                });
        });

        it('should throw if a non ca or ro tries to access the taskList', () => {
            app = createApp({}, 'dmUser');

            pdfServiceStub.getPdfLicenceData.resolves(valuesWithoutMissing);

            licenceServiceStub.getLicence.resolves({
                version: 2,
                approvedVersionDetails: {template: 'hdc_ap', version: 1, timestamp: '11/12/13'}
            });

            return request(app)
                .get('/hdc/pdf/taskList/hdc_ap/123')
                .expect(403);

        });
    });

    describe('GET /create', () => {

        it('Calls pdf service and renders response as PDF', () => {

            const pdf1AsBytes = Buffer.from([80, 68, 70, 45, 49]);
            pdfServiceStub.generatePdf.resolves(pdf1AsBytes);

            return request(app)
                .get('/hdc/pdf/create/hdc_ap_pss/123')
                .expect(200)
                .expect('Content-Type', 'application/pdf')
                .expect(res => {
                    expect(pdfServiceStub.generatePdf).to.be.calledOnce();
                    expect(pdfServiceStub.generatePdf).to.be.calledWith(
                        'hdc_ap_pss', '123', {licence: {key: 'value'}}, 'token', true);
                    expect(res.body.toString()).to.include('PDF-1');
                });
        });

        it('Audits the PDF creation event', () => {

            const pdf1AsBytes = Buffer.from([80, 68, 70, 45, 49]);
            pdfServiceStub.generatePdf.resolves(pdf1AsBytes);

            return request(app)
                .get('/hdc/pdf/create/hdc_ap_pss/123')
                .expect(200)
                .expect('Content-Type', 'application/pdf')
                .expect(res => {
                    expect(auditStub.record).to.be.calledOnce();
                    expect(auditStub.record).to.be.calledWith(
                        'CREATE_PDF', 'id', {
                            path: '/hdc/pdf/create/hdc_ap_pss/123',
                            bookingId: '123',
                            userInput: {}
                        });
                });
        });

        it('should throw if a non ca or ro tries to create the pdf', () => {
            app = createApp({}, 'dmUser');

            const pdf1AsBytes = Buffer.from([80, 68, 70, 45, 49]);
            pdfServiceStub.generatePdf.resolves(pdf1AsBytes);

            return request(app)
                .get('/hdc/pdf/create/hdc_ap_pss/123')
                .expect(403);
        });
    });
});

function createApp({licenceServiceStub, pdfServiceStub, prisonerServiceStub}, user) {
    const prisonerService = prisonerServiceStub || createPrisonerServiceStub();
    const licenceService = licenceServiceStub || createLicenceServiceStub();
    const signInService = signInServiceStub;

    const baseRouter = standardRouter({licenceService, prisonerService, audit: auditStub, signInService});
    const route = baseRouter(createPdfRouter({pdfService: pdfServiceStub, prisonerService}),
        {auditKey: 'CREATE_PDF'});

    return appSetup(route, user, '/hdc/pdf/');
}

