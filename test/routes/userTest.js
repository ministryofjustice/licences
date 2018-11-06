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

    let userService;

    beforeEach(() => {
        userService = {
            getAllRoles: sinon.stub().resolves(['CA', 'RO']),
            setRole: sinon.stub().resolves()
        };
        auditStub.record.reset();
    });

    describe('user page get', () => {
        it(`renders the /user page`, () => {
            const app = createApp({userService}, 'caUser');
            return request(app)
                .get('/')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('Select role');
                    expect(res.text).to.contain('<option value="CA"');
                    expect(res.text).to.contain('<option value="RO"');
                });
        });
    });

    describe('user page post', () => {

        it(`calls setRole`, () => {
            const app = createApp({userService}, 'caUser');
            return request(app)
                .post('/')
                .send({role: 'RO'})
                .expect(302)
                .expect(res => {
                    expect(userService.setRole).to.be.calledOnce();
                    expect(userService.setRole).to.be.calledWith('RO');
                });
        });

        it(`redirects to the /user page`, () => {
            const app = createApp({userService}, 'caUser');
            return request(app)
                .post('/')
                .send({role: 'RO'})
                .expect(302)
                .expect('Location', '/user');
        });
    });

});

function createApp({userService}, user) {
    const prisonerService = createPrisonerServiceStub();
    const licenceService = createLicenceServiceStub();

    const baseRouter = standardRouter({licenceService, prisonerService, authenticationMiddleware, audit: auditStub});
    const route = baseRouter(createRoute({userService}));

    return appSetup(route, user);
}
