const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createSendRoute = require('../../server/routes/send');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;

const loggerStub = {
    debug: sandbox.stub()
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves([{}]),
    markForHandover: sandbox.stub().returnsPromise().resolves([{}])
};

const app = appSetup(createSendRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}));

describe('Sending', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('GET /send', () => {
        it('renders and HTML output', () => {
            return request(app)
                .get('/123')
                .expect(200)
                .expect('Content-Type', /html/);
        });
    });

    describe('POST /send', () => {
        it('calls markForHandover via licenceService', () => {
            return request(app)
                .post('/123')
                .send({nomisId: 123, sender: 'from', receiver: 'to'})
                .expect(() => {
                    expect(licenceServiceStub.markForHandover).to.be.calledOnce();
                    expect(licenceServiceStub.markForHandover).to.be.calledWith(123, 'from', 'to');
                });

        });

        it('shows sent confirmation', () => {
            return request(app)
                .post('/123')
                .send({nomisId: 123, sender: 'from', receiver: 'to'})
                .expect(302)
                .expect(res => {
                    expect(res.header['location']).to.eql('/hdc/sent/123');
                });

        });
    });

});

