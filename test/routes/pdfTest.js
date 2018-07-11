const request = require('supertest');

const {
    loggerStub,
    pdfServiceStub,
    authenticationMiddleware,
    appSetup,
    auditStub
} = require('../supertestSetup');

const createPdfRoute = require('../../server/routes/pdf');

const testUser = {
    staffId: 'my-staff-id',
    username: 'my-username',
    email: 'user@email',
    role: 'CA'
};

const app = appSetup(createPdfRoute({
    logger: loggerStub,
    pdfService: pdfServiceStub,
    authenticationMiddleware,
    audit: auditStub
}), testUser);

const valuesWithMissing = {
    values: {
        OFF_NAME: 'FIRST LAST'
    },
    missing: {
        OFF_DOB: 'Missing 1',
        OFF_PNC: 'Missing 2'
    }
};

const valuesOnly = {
    values: {
        OFF_NAME: 'FIRST LAST'
    }
};

describe('PDF:', () => {

    beforeEach(() => {
        auditStub.record.reset();
    });

    describe('GET /view', () => {

        it('Shows display labels when missing values', () => {

            pdfServiceStub.getPdfLicenceData.resolves(valuesWithMissing);

            return request(app)
                .get('/view/hdc_ap_pss/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('Missing 1');
                    expect(res.text).to.include('Missing 2');
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledOnce();
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledWith(
                        'hdc_ap_pss', '123', 'my-username');
                });
        });

        it('Redirects to create when all values present', () => {

            pdfServiceStub.getPdfLicenceData.resolves(valuesOnly);

            return request(app)
                .get('/view/hdc_ap_pss/123')
                .expect(302)
                .expect(res => {
                    expect(res.header.location).to.equal('/hdc/pdf/create/hdc_ap_pss/123');
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
                    expect(pdfServiceStub.generatePdf).to.be.calledWith('hdc_ap_pss', '123', 'my-username');
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
                        'CREATE_PDF', 'user@email', {nomisId: '123', templateName: 'hdc_ap_pss'});
                });
        });
    });

});

