const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createLicenceDetailsRoute = require('../../server/routes/licenceDetails');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;

const loggerStub = {
    debug: sandbox.stub()
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves({licence: {}})
};

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'CA'
};

const app = appSetup(createLicenceDetailsRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}), testUser);

describe('GET /licenceDetails/:prisonNumber', () => {

    it('calls getLicenceDetails from licenceDetailsService', () => {
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(licenceServiceStub.getLicence.callCount).to.equal(1);
            });

    });
});

