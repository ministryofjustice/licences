const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createSendRoute = require('../../server/routes/sent');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;

const loggerStub = {
    debug: sandbox.stub()
};

const licenceServiceStub = {
    getEstablishment: sandbox.stub().returnsPromise().resolves([{}])
};

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'CA'
};

const app = appSetup(createSendRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}), testUser);

describe('GET sent', () => {

    afterEach(() => {
        sandbox.reset();
    });

    it('calls getEstablishment via licenceService', () => {
        return request(app)
            .get('/123')
            .expect(() => {
                expect(licenceServiceStub.getEstablishment).to.be.calledOnce();
                expect(licenceServiceStub.getEstablishment).to.be.calledWith('123');
            });

    });
});

