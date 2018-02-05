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
    createLicence: sandbox.stub().returnsPromise().resolves(),
    update: sandbox.stub().returnsPromise().resolves()
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

const form1Response = {
    decision: 'Yes',
    reasons: ['sexOffenderRegister', 'convictedSexOffences']
};


describe('/hdc/eligibility', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('GET /eligibility/excluded/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/excluded/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders eligibility check page', () => {
            return request(app)
                .get('/excluded/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('HDC eligibility check');
                });
        });

        it('does not pre-populates input if it does not exist on licence', () => {
            return request(app)
                .get('/excluded/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input id="excludedYes" type="radio" name="decision" value="Yes">');
                    expect(res.text).to.not.contain(
                        '<input id="excludedYes" type="radio" checked name="decision" value="Yes">');
                });
        });

        it('pre-populates input if it exists on licence', () => {
            licenceServiceStub.getLicence.resolves({
                licence: {
                    eligibility: {
                        excluded: {
                            decision: 'Yes',
                            reason: ['sexOffenderRegister', 'convictedSexOffences']
                        }
                    }
                }
            });

            return request(app)
                .get('/excluded/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('value="sexOffenderRegister" checked');
                    expect(res.text).to.contain('value="convictedSexOffences" checked');
                });
        });
    });

    describe('POST /eligibility/excluded/:nomisId', () => {

        it('calls getLicence from licenceService', () => {
            return request(app)
                .post('/excluded/1')
                .send(form1Response)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.getLicence.callCount).to.equal(1);
                });
        });


        it('calls update from licenceService and redirects to suitability page', () => {
            return request(app)
                .post('/excluded/1')
                .send(form1Response)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.update).to.be.calledOnce();
                    expect(licenceServiceStub.update.args[0][0].userInput).to.eql(form1Response);
                    expect(res.header['location']).to.include('/hdc/eligibility/suitability/1');
                });

        });
    });

    describe('GET /eligibility/suitability/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/suitability/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders eligibility check page 2', () => {
            return request(app)
                .get('/suitability/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('HDC presumed suitability');
                });
        });
    });

    describe('GET /eligibility/crdTimeForm/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/crdTime/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders crd time page', () => {
            return request(app)
                .get('/crdTime/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('Time left until Conditional Release Date');
                });
        });
    });
});

