const {
    request,
    expect,
    sandbox,
    loggerStub,
    pdfServiceStub,
    authenticationMiddleware,
    appSetup
} = require('../supertestSetup');
const config = require('../../server/config');

const createPdfRoute = require('../../server/routes/pdf');

const testUser = {
    staffId: 'my-staff-id',
    username: 'my-username',
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

const templateName = config.pdf.templateName;

describe('PDF:', () => {

    afterEach(() => {
        sandbox.reset();
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
                    expect(pdfServiceStub.getPdfLicenceData).to.be.calledWith(
                        templateName, '123', {tokenId: 'my-username'});
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

        it('Calls pdf service and renders response as PDF', () => {

            const pdf1AsBytes = new Buffer([80, 68, 70, 45, 49]);
            pdfServiceStub.generatePdf.resolves(pdf1AsBytes);

            return request(app)
                .get('/create/123')
                .expect(200)
                .expect('Content-Type', 'application/pdf')
                .expect(res => {
                    expect(pdfServiceStub.generatePdf).to.be.calledOnce();
                    expect(pdfServiceStub.generatePdf).to.be.calledWith(templateName, '123', {tokenId: 'my-username'});
                    expect(res.text).to.include('PDF-1');
                });
        });
    });

});

