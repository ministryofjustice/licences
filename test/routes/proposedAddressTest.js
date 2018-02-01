const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createProposedAddressRoute = require('../../server/routes/proposedAddress');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;
const formConfig = require('../../server/routes/config/proposedAddress');

const loggerStub = {
    debug: sandbox.stub()
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves({licence: {key: 'value'}}),
    updateEligibility: sandbox.stub().returnsPromise().resolves(),
    createLicence: sandbox.stub().returnsPromise().resolves(),
    update: sandbox.stub().returnsPromise().resolves(),
    updateStatus: sandbox.stub().returnsPromise().resolves()
};

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'OM'
};

const app = appSetup(createProposedAddressRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}), testUser);

describe('/hdc/proposedAddress', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('GET /proposedAddress/optOut/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/optOut/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders out out page', () => {
            return request(app)
                .get('/optOut/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('HDC opt out decision');
                });
        });
    });

    describe('GET /proposedAddress/bassReferral/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/bassReferral/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders out out page', () => {
            return request(app)
                .get('/bassReferral/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('BASS referral');
                });
        });
    });

    describe('GET /proposedAddress/curfewAddress/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/curfewAddress/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders out out page', () => {
            return request(app)
                .get('/curfewAddress/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('Proposed curfew address');
                });
        });
    });

    describe('GET /proposedAddress/confirmAddress/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/confirmAddress/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders out out page', () => {
            return request(app)
                .get('/confirmAddress/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('Confirm address details');
                });
        });
    });

    describe('GET /proposedAddress/submit/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/submit/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders out out page', () => {
            return request(app)
                .get('/submit/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('Submit to Responsible Officer');
                });
        });
    });

    describe('GET /proposedAddress/confirmation/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/confirmation/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders out out page', () => {
            return request(app)
                .get('/confirmation/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('Address information sent');
                });
        });
    });

    describe('POST /proposedAddress/:formName/:nomisId', () => {
        context('When page contains form fields', () => {
            it('calls updateLicence from licenceService', () => {

                const formResponse = {
                    nomisId: '1',
                    decision: 'Yes',
                    reason: 'sexOffenderRegister'
                };

                return request(app)
                    .post('/optOut/1')
                    .send(formResponse)
                    .expect(302)
                    .expect(res => {
                        expect(licenceServiceStub.update).to.be.calledOnce();
                        expect(licenceServiceStub.update).to.be.calledWith({
                            licence: {key: 'value'},
                            nomisId: '1',
                            fieldMap: formConfig.optOut.fields,
                            userInput: formResponse,
                            licenceSection: 'proposedAddress',
                            formName: 'optOut'
                        });
                    });
            });
        });

        context('When page contains status', () => {
            it('calls updateLicence from licenceService', () => {

                const formResponse = {
                    nomisId: '1',
                    licenceStatus: 'StatusChange'
                };

                return request(app)
                    .post('/submit/1')
                    .send(formResponse)
                    .expect(302)
                    .expect(res => {
                        expect(licenceServiceStub.updateStatus).to.be.calledOnce();
                        expect(licenceServiceStub.updateStatus).to.be.calledWith('1', 'StatusChange');
                    });
            });
        });
    });
});
