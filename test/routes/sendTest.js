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
    sendToOmu: sandbox.stub().returnsPromise().resolves([{}]),
    sendToPm: sandbox.stub().returnsPromise().resolves([{}])
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

describe('Sending', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('POST /send/omu', () => {
        it('calls sendToOmu via licenceService', () => {
            return request(app)
                .post('/omu')
                .send({nomisId: 123})
                .expect(() => {
                    expect(licenceServiceStub.sendToOmu).to.be.calledOnce();
                    expect(licenceServiceStub.sendToOmu).to.be.calledWith(123);
                });

        });

        it('shows sent confirmation', () => {
            return request(app)
                .post('/omu')
                .send({nomisId: 123})
                .expect(302)
                .expect(res => {
                    expect(res.header['location']).to.eql('/sent/123');
                });

        });
    });

    describe('POST /send/pm', () => {
        it('calls sendToPm via licenceService', () => {
            return request(app)
                .post('/pm')
                .send({nomisId: 123})
                .expect(() => {
                    expect(licenceServiceStub.sendToPm).to.be.calledOnce();
                    expect(licenceServiceStub.sendToPm).to.be.calledWith(123);
                });

        });

        it('shows sent confirmation', () => {
            return request(app)
                .post('/pm')
                .send({nomisId: 123})
                .expect(302)
                .expect(res => {
                    expect(res.header['location']).to.eql('/sent/123');
                });

        });
    });
});

