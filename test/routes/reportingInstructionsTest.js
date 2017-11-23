const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createReportingInstructionRoute = require('../../server/routes/reportingInstructions');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves({licence: {}}),
    updateAddress: sandbox.stub().returnsPromise().resolves(),
    updateReportingInstructions: sandbox.stub().returnsPromise().resolves()
};

const loggerStub = {
    debug: sandbox.stub()
};

const app = appSetup(createReportingInstructionRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}));

describe('GET /reporting/:prisonNumber', () => {

    afterEach(() => {
        sandbox.reset();
    });

    it('load html', () => {
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/);
    });

    it('renders reporting instructions page if licence exists', () => {

        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(res.text).to.contain('Reporting instructions</h1\>');
            });
    });

    it('doesnt pre-populates input if it doesnt exist on licence', () => {

        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(res.text).to.contain(
                    '<input class="form-control block" id="street" name="address2" type="text">');
                expect(res.text).to.not.contain(
                    '<input class="form-control block" id="street" name="address2" type="text" value="abc">');
            });
    });

    it('pre-populates input if it exists on licence', () => {

        licenceServiceStub.getLicence.resolves({licence: {reportingInstructions: {address2: 'abc'}}});

        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(res.text).to.contain(
                    '<input class="form-control block" id="street" name="address2" type="text" value="abc">');
            });
    });

    it('redirects to details page if no licence exits', () => {

        licenceServiceStub.getLicence.resolves(null);

        return request(app)
            .get('/1')
            .expect(302)
            .expect(res => {
                expect(res.header['location']).to.include('/details/');
            });

    });
});

describe('POST /dischargeAddress/:prisonNumber', () => {
    afterEach(() => {
        sandbox.reset();
    });

    const formResponse = {
        address1: '123',
        address2: '456',
        postCode: 'pc',
        time: '15:33',
        date: '23 October'
    };

    it('calls updateReportingInstructions from licenceService and redirects to licence details', () => {
        return request(app)
            .post('/1')
            .send(formResponse)
            .expect(302)
            .expect(res => {
                expect(licenceServiceStub.updateReportingInstructions).to.be.calledOnce();
                expect(licenceServiceStub.updateReportingInstructions).to.be.calledWith(formResponse);
                expect(res.header['location']).to.include('/licenceDetails');
            });

    });
});
