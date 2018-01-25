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

const form1Response = {
    eligibility: {
        excluded: 'yes',
        excludedReasons: ['sexOffenderRegister', 'convictedSexOffences']
    }
};

const form2Response = {
    eligibility: {
        unsuitable: 'No'
    }
};


describe('/hdc/proposedAddress', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('GET /proposedAddress/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders proposedAddress check page', () => {
            return request(app)
                .get('/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('HDC eligibility check');
                });
        });
    });
});
