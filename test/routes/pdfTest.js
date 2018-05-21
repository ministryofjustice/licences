const {
    request,
    expect,
    sandbox,
    loggerStub,
    pdfServiceStub,
    authenticationMiddleware,
    appSetup,
    nock
} = require('../supertestSetup');
const config = require('../../server/config');

const createPdfRoute = require('../../server/routes/pdf');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    role: 'CA'
};

const app = appSetup(createPdfRoute({
    logger: loggerStub,
    pdfService: pdfServiceStub,
    authenticationMiddleware
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

const fakePdfGenerator = nock(`${config.pdf.pdfServiceHost}`);

describe('PDF:', () => {

    afterEach(() => {
        sandbox.reset();
        nock.cleanAll();
    });

    describe('GET /view', () => {

        it('Shows display labels when missing values', () => {

            pdfServiceStub.getPdfLicenceData.resolves(valuesWithMissing);

            return request(app)
                .get('/view/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('Missing 1');
                    expect(res.text).to.include('Missing 2');
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledOnce();
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledWith('123', 'my-token');
                });
        });

        it('Redirects to create when all values present', () => {

            pdfServiceStub.getPdfLicenceData.resolves(valuesOnly);

            return request(app)
                .get('/view/123')
                .expect(302)
                .expect(res => {
                    expect(res.header.location).to.equal('/hdc/pdf/create/123');
                });
        });
    });

    describe('GET /create', () => {

        it('Posts to PDF generator and renders response as PDF', () => {

            const pdf1AsBytes = [80, 68, 70, 45, 49];

            fakePdfGenerator
                .post('/generate', valuesOnly)
                .reply(200, pdf1AsBytes);

            pdfServiceStub.getPdfLicenceData.resolves(valuesOnly);

            return request(app)
                .get('/create/123')
                .expect(200)
                .expect('Content-Type', 'application/pdf')
                .expect(res => {
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledOnce();
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledWith('123', 'my-token');
                    expect(res.text).to.include('PDF-1');
                });
        });
    });

});

