const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createProposedAddressRoute = require('../../server/routes/licenceConditions');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;
const formConfig = require('../../server/routes/config/licenceConditions');

const loggerStub = {
    debug: sandbox.stub()
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves({licence: {key: 'value'}}),
    update: sandbox.stub().returnsPromise().resolves()
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

describe('/hdc/licenceConditions', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('GET /licenceConditions/riskManagement/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/riskManagement/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders out out page', () => {
            return request(app)
                .get('/riskManagement/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('Risk management and victim liaison');
                });
        });
    });

    describe('POST /licenceConditions/:formName/:nomisId', () => {
        context('When page contains form fields', () => {
            it('calls updateLicence from licenceService', () => {

                const formResponse = {
                    nomisId: '1',
                    planningActions: 'Yes',
                    planningActionsDetails: 'details'
                };

                return request(app)
                    .post('/riskManagement/1')
                    .send(formResponse)
                    .expect(302)
                    .expect(res => {
                        expect(licenceServiceStub.update).to.be.calledOnce();
                        expect(licenceServiceStub.update).to.be.calledWith({
                            licence: {key: 'value'},
                            nomisId: '1',
                            fieldMap: formConfig.riskManagement.fields,
                            userInput: formResponse,
                            licenceSection: 'licenceConditions',
                            formName: 'riskManagement'
                        });
                    });
            });
        });
    });
});
