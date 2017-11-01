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
    send: sandbox.stub().returnsPromise().resolves([{}])
};

const app = appSetup(createSendRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}));

describe('POST /send/:nomisId', () => {

    afterEach(() => {
        sandbox.reset();
    });

    it('calls send via licenceService', () => {
        return request(app)
            .post('/123')
            .send({nomisId: 123})
            .expect(() => {
                expect(licenceServiceStub.getLicence).to.be.calledOnce();
                expect(licenceServiceStub.getLicence).to.be.calledWith(123);
                expect(licenceServiceStub.send).to.be.calledOnce();
                expect(licenceServiceStub.send).to.be.calledWith(123);
            });

    });

    it('redirects to tasklist', () => {
        return request(app)
            .post('/1')
            .expect(302)
            .expect(res => {
                expect(res.header['location']).to.eql('/');
            });

    });
});

