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

const form1Response = {
    eligibility: {
        excluded: 'yes',
        excludedReasons: ['sexOffenderRegister', 'convictedSexOffences']
    }
};

const form2Response = {
    eligibility: {
        unsuitable: 'No'
    }
};

const form3Response = {
    eligibility: {
        crdTime: 'No'
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
                    expect(res.text).to.contain('HDC eligibility check');
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
                .send(form1Response)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.getLicence.callCount).to.equal(1);
                });
        });

        it('creates licence if none exists', () => {

            licenceServiceStub.getLicence.resolves(undefined);

            return request(app)
                .post('/1')
                .send(form1Response)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.getLicence.callCount).to.equal(1);
                    expect(licenceServiceStub.createLicence).to.be.called();
                    expect(licenceServiceStub.createLicence).to.be.calledWith('1', form1Response);
                });
        });

        it('calls updateEligibility from licenceService and redirects to suitability page', () => {
            return request(app)
                .post('/1')
                .send(form1Response)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.updateEligibility).to.be.calledOnce();
                    expect(licenceServiceStub.updateEligibility).to.be.calledWith(form1Response);
                    expect(res.header['location']).to.include('suitability/');
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

        it('doesnt pre-populates input if it doesnt exist on licence', () => {
            return request(app)
                .get('/suitability/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain(
                        '<input id="unsuitableYes" type="radio" name="unsuitable"');
                    expect(res.text).to.not.contain(
                        '<input id="unsuitableNo" type="radio" checked name="unsuitable"');
                });
        });

        it('pre-populates input if it exists on licence', () => {
            licenceServiceStub.getLicence.resolves({
                licence: {
                    eligibility: {
                        unsuitable: 'Yes',
                        unsuitableReasons: ['deportationLiable']
                    }
                }
            });

            return request(app)
                .get('/suitability/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('value="deportationLiable" checked');
                });
        });
    });

    describe('POST /eligibility/step2/:nomisId', () => {

        it('calls getLicence from licenceService', () => {
            return request(app)
                .post('/suitability/1')
                .send(form2Response)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.getLicence.callCount).to.equal(1);
                });
        });

        it('creates licence if none exists', () => {

            licenceServiceStub.getLicence.resolves(undefined);

            return request(app)
                .post('/suitability/1')
                .send(form2Response)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.getLicence.callCount).to.equal(1);
                    expect(licenceServiceStub.createLicence).to.be.called();
                    expect(licenceServiceStub.createLicence).to.be.calledWith('1', form2Response);
                });
        });

        it('calls updateEligibility from licenceService and redirects to step 3', () => {
            return request(app)
                .post('/suitability/1')
                .send(form2Response)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.updateEligibility).to.be.calledOnce();
                    expect(licenceServiceStub.updateEligibility).to.be.calledWith(form2Response);
                    expect(res.header['location']).to.include('eligibility/crdTime/');
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

        it('doesnt pre-populates input if it doesnt exist on licence', () => {
            return request(app)
                .get('/crdTime/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain(
                        '<input id="crdTimeYes" type="radio" name="crdTime"');
                    expect(res.text).to.not.contain(
                        '<input id="crdTimeNo" type="radio" checked name="crdTime"');
                });
        });

        it('pre-populates input if it exists on licence', () => {
            licenceServiceStub.getLicence.resolves({
                licence: {
                    eligibility: {
                        crdTime: 'Yes'
                    }
                }
            });

            return request(app)
                .get('/crdTime/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('checked name="crdTime" value="Yes"');
                });
        });
    });

    describe('POST /eligibility/step2/:nomisId', () => {

        it('calls getLicence from licenceService', () => {
            return request(app)
                .post('/crdTime/1')
                .send(form2Response)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.getLicence.callCount).to.equal(1);
                });
        });

        it('creates licence if none exists', () => {

            licenceServiceStub.getLicence.resolves(undefined);

            return request(app)
                .post('/crdTime/1')
                .send(form3Response)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.getLicence.callCount).to.equal(1);
                    expect(licenceServiceStub.createLicence).to.be.called();
                    expect(licenceServiceStub.createLicence).to.be.calledWith('1', form3Response);
                });
        });

        it('calls updateEligibility from licenceService and redirects to step 3', () => {
            return request(app)
                .post('/crdTime/1')
                .send(form3Response)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.updateEligibility).to.be.calledOnce();
                    expect(licenceServiceStub.updateEligibility).to.be.calledWith(form3Response);
                    expect(res.header['location']).to.include('/hdc/taskList');
                });

        });
    });
});

