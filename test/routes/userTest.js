const request = require('supertest');

const {
    auditStub,
    authenticationMiddleware,
    createPrisonerServiceStub,
    createLicenceServiceStub,
    appSetup
} = require('../supertestSetup');

const standardRouter = require('../../server/routes/routeWorkers/standardRouter');
const createRoute = require('../../server/routes/user');

describe('/user', () => {

    let signInService;

    beforeEach(() => {
        signInService = {
            getAllRoles: sinon.stub().resolves(['CA', 'RO']),
            setRole: sinon.stub().resolves()
        };
        auditStub.record.reset();
    });

    describe('user page get', () => {
        it(`renders the /user page`, () => {
            const app = createApp({signInService}, 'caUser');
            return request(app)
                .get('/')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('Select a role from the list');
                    expect(res.text).to.contain('<option value="CA"');
                    expect(res.text).to.contain('<option value="RO"');
                });
        });
    });

    describe('user page post', () => {

        it(`calls setRole`, () => {
            const app = createApp({signInService}, 'caUser');
            return request(app)
                .post('/')
                .send({role: 'RO'})
                .expect(302)
                .expect(res => {
                    expect(signInService.setRole).to.be.calledOnce();
                    expect(signInService.setRole).to.be.calledWith('RO');
                });
        });

        it(`redirects to the /user page`, () => {
            const app = createApp({signInService}, 'caUser');
            return request(app)
                .post('/')
                .send({role: 'RO'})
                .expect(302)
                .expect('Location', '/user');
        });
    });

});

function createApp({signInService}, user) {
    const prisonerService = createPrisonerServiceStub();
    const licenceService = createLicenceServiceStub();

    const baseRouter = standardRouter({licenceService, prisonerService, authenticationMiddleware, audit: auditStub});
    const route = baseRouter(createRoute({signInService}));

    return appSetup(route, user);
}
