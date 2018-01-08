const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createPrisonerDetailsRoute = require('../../server/routes/taskList');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;

const loggerStub = {
    debug: sandbox.stub()
};
const serviceStub = {
    getPrisonerDetails: sandbox.stub()
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise(),
    createLicence: sandbox.stub().returnsPromise()
};

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'OM'
};

const app = appSetup(createPrisonerDetailsRoute({
        prisonerService: serviceStub,
        licenceService: licenceServiceStub,
        logger: loggerStub,
        authenticationMiddleware
    }
), testUser);

describe('GET /details/:prisonNumber', () => {

    it('should call getPrisonerDetails from prisonerDetailsService', () => {
        return request(app)
            .get('/123')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(serviceStub.getPrisonerDetails).to.be.calledOnce();
                expect(serviceStub.getPrisonerDetails).to.be.calledWith('123');
            });

    });

    it('should redirect to dischargeAddress if a licence already exists', () => {
        licenceServiceStub.getLicence.resolves(['1']);
        return request(app)
            .post('/1233456')
            .send({
                nomisId: '123'
            })
            .expect(302)
            .expect(res => {
                expect(licenceServiceStub.getLicence).to.be.calledOnce();
                expect(licenceServiceStub.getLicence).to.be.calledWith('123');
                expect(licenceServiceStub.createLicence).to.not.be.called();
                expect(res.header['location']).to.include('/dischargeAddress');
            });

    });
});

describe('POST /details/:prisonNumber', () => {

    it('should create a new licence if a licence does not already exist', () => {
        const formResponse = {
            nomisId: '123',
            extra: 'field'
        };

        licenceServiceStub.getLicence.resolves(undefined);
        licenceServiceStub.createLicence.resolves();
        return request(app)
            .post('/1233456')
            .send(formResponse)
            .expect(302)
            .expect(res => {
                expect(licenceServiceStub.createLicence).to.be.called();
                expect(licenceServiceStub.createLicence).to.be.calledWith('123', formResponse);
                expect(res.header['location']).to.include('/dischargeAddress');
            });
    });
});

