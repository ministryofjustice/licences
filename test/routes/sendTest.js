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
    getLicence: sandbox.stub().returnsPromise().resolves({status: 'PROCESSING_RO'}),
    markForHandover: sandbox.stub().returnsPromise().resolves([{}])
};

const prisonerServiceStub = {
    getEstablishmentForPrisoner: sandbox.stub().returnsPromise().resolves({premise: 'HMP Blah'})
};

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    role: 'RO'
};

const app = appSetup(createSendRoute({
    licenceService: licenceServiceStub,
    prisonerService: prisonerServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}), testUser);

describe('Send:', () => {

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

        it('gets establishment details when submission is RO to CA', () => {
            return request(app)
                .get('/123')
                .expect(() => {
                    expect(prisonerServiceStub.getEstablishmentForPrisoner).to.be.calledOnce();
                    expect(prisonerServiceStub.getEstablishmentForPrisoner).to.be.calledWith('123', 'my-token');
                });
        });

        it('does not establishment details when submission is CA to RO', () => {

            licenceServiceStub.getLicence.resolves({status: 'WRONG_STAGE'});

            return request(app)
                .get('/123')
                .expect(() => {
                    expect(prisonerServiceStub.getEstablishmentForPrisoner).to.not.be.called();
                });
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

