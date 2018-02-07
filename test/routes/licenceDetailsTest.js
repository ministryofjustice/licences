const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createLicenceDetailsRoute = require('../../server/routes/licenceDetails');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;

const loggerStub = {
    debug: sandbox.stub()
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves({licence: {
        proposedAddress: {
            curfewAddress: {
                addressLine1: 'Address 1'
            }
        },
        additionalConditions: [{content: [{text: 'Condition1'}]}],
        licenceConditions: {riskManagement: {planningActions: 'Yes'}}
    }})
};

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'CA'
};

const app = appSetup(createLicenceDetailsRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}), testUser);

describe('GET /licenceDetails/:prisonNumber', () => {

    it('renders html and displays licence detail', () => {
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(res.text).to.include('Address 1');
                expect(res.text).to.include('Condition1');
                expect(res.text).to.include('Yes');
            });

    });

    it('renders html and displays licence details if sections are missing', () => {
        licenceServiceStub.getLicence.resolves({licence: {
                additionalConditions: [{content: [{text: 'Condition1'}]}]
        }});
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(res.text).to.not.include('Address 1');
                expect(res.text).to.include('Condition1');
                expect(res.text).to.not.include('Yes');
            });

    });
});

