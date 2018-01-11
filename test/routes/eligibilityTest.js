const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createEligibilityRoute = require('../../server/routes/eligibility');
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

const app = appSetup(createEligibilityRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}), testUser);

const formResponse = {
    eligibility: {
        excluded: 'yes',
        excludedReasons: ['sexOffenderRegister', 'convictedSexOffences']
    }
};

describe('/hdc/eligibility', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('GET /eligibility/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders eligibility check page', () => {
            return request(app)
                .get('/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('HDC eligibility and suitability check');
                });
        });

        it('calls getLicence from licenceService', () => {
            return request(app)
                .get('/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(licenceServiceStub.getLicence.callCount).to.equal(1);
                });
        });

        it('doesnt pre-populates input if it doesnt exist on licence', () => {
            return request(app)
                .get('/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain(
                        '<input id="excludedYes" type="radio" name="excluded"');
                    expect(res.text).to.not.contain(
                        '<input id="excludedYes" type="radio" checked name="excluded"');
                });
        });

        it('pre-populates input if it exists on licence', () => {
            licenceServiceStub.getLicence.resolves({
                licence: {
                    eligibility: {
                        excluded: 'yes',
                        excludedReasons: ['sexOffenderRegister', 'convictedSexOffences']
                    }
                }
            });

            return request(app)
                .get('/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('value="sexOffenderRegister" checked');
                    expect(res.text).to.contain('value="convictedSexOffences" checked');
                });
        });
    });

    describe('POST /eligibility/:nomisId', () => {

        it('calls getLicence from licenceService', () => {
            return request(app)
                .post('/1')
                .send(formResponse)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.getLicence.callCount).to.equal(1);
                });
        });

        it('creates licence if none exists', () => {

            licenceServiceStub.getLicence.resolves(undefined);

            return request(app)
                .post('/1')
                .send(formResponse)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.getLicence.callCount).to.equal(1);
                    expect(licenceServiceStub.createLicence).to.be.called();
                    expect(licenceServiceStub.createLicence).to.be.calledWith('1', formResponse);
                });
        });

        it('calls updateEligibility from licenceService and redirects to taskList', () => {
            return request(app)
                .post('/1')
                .send(formResponse)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.updateEligibility).to.be.calledOnce();
                    expect(licenceServiceStub.updateEligibility).to.be.calledWith(formResponse);
                    expect(res.header['location']).to.include('/hdc/taskList');
                });

        });
    });

});

