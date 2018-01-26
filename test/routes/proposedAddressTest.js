const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createProposedAddressRoute = require('../../server/routes/proposedAddress');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;

const loggerStub = {
    debug: sandbox.stub()
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves({licence: {}}),
    updateEligibility: sandbox.stub().returnsPromise().resolves(),
    createLicence: sandbox.stub().returnsPromise().resolves()
};

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'OM'
};

const app = appSetup(createProposedAddressRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}), testUser);

describe('/hdc/proposedAddress', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('GET /proposedAddress/optOut/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/optOut/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders out out page', () => {
            return request(app)
                .get('/optOut/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('HDC opt out decision');
                });
        });
    });

    describe('GET /proposedAddress/bassReferral/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/bassReferral/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders out out page', () => {
            return request(app)
                .get('/bassReferral/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('BASS referral');
                });
        });
    });
});
