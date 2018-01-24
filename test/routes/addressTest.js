const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createAddressRoute = require('../../server/routes/address');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;

const loggerStub = {
    debug: sandbox.stub()
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves({licence: {}}),
    updateBassReferral: sandbox.stub().returnsPromise().resolves()
};

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'OM'
};

const app = appSetup(createAddressRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}), testUser);

const bassFormResponse = {
    bassReferral: {
        bassReferralRequested: 'yes',
        proposedTown: 'aTown',
        proposedCounty: 'aCounty'
    }
};

describe('/hdc/address/bass', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('GET /address/bass/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/bass/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders bass referral page', () => {
            return request(app)
                .get('/bass/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('BASS referral');
                });
        });

        it('calls getLicence from licenceService', () => {
            return request(app)
                .get('/bass/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(licenceServiceStub.getLicence.callCount).to.equal(1);
                });
        });

        it('doesnt pre-populates input if it doesnt exist on licence', () => {
            return request(app)
                .get('/bass/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain(
                        '<input id="bassReferralYes" type="radio" name="bassReferralRequested"');
                    expect(res.text).to.not.contain(
                        '<input id="bassReferralYes" type="radio" checked name="bassReferralRequested"');
                });
        });

        it('pre-populates input if it exists on licence', () => {
            licenceServiceStub.getLicence.resolves({
                licence: {
                    bassReferral: {
                        bassReferralRequested: 'Yes',
                        proposedTown: 'aTown',
                        proposedCounty: 'aCounty'
                    }
                }
            });

            return request(app)
                .get('/bass/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('id="proposedTown" value="aTown"');
                    expect(res.text).to.contain('id="proposedCounty" value="aCounty"');
                });
        });
    });

    describe('POST /address/bass/:nomisId', () => {

        it('calls getLicence from licenceService', () => {
            return request(app)
                .post('/bass/1')
                .send(bassFormResponse)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.getLicence.callCount).to.equal(1);
                });
        });

        it('calls updateBassReferral from licenceService and redirects to tasklist', () => {
            return request(app)
                .post('/bass/1')
                .send(bassFormResponse)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.updateBassReferral).to.be.calledOnce();
                    expect(licenceServiceStub.updateBassReferral).to.be.calledWith(bassFormResponse);
                    expect(res.header['location']).to.include('taskList/');
                });

        });
    });

});

