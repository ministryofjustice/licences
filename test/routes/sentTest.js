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
    getLicence: sandbox.stub().returnsPromise().resolves({status: 'CA-RO'})
};

const app = appSetup(createSendRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}));

describe('GET sent', () => {

    afterEach(() => {
        sandbox.reset();
    });

    it('renders the sent page', () => {
        return request(app)
            .get('/123')
            .expect(200)
            .expect(res => {
                expect(res.text).to.include('Address information submitted');
            });
    });
});

