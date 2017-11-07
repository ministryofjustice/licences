const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createTasklistRoute = require('../../server/routes/tasklist');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;

const loggerStub = {
    debug: sandbox.stub()
};
const serviceStub = {
    getDashboardDetail: sandbox.stub().returnsPromise()
};

const audit = {
    record: sandbox.stub()
};

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'OM'
};

const app = appSetup(createTasklistRoute(
    {tasklistService: serviceStub, logger: loggerStub, audit, authenticationMiddleware}), testUser);

describe('GET /', () => {

    beforeEach(() => {
        serviceStub.getDashboardDetail.resolves({});
    });

    afterEach(() => {
        sandbox.reset();
    });

    it('should call getDashboardDetail from tasklistService', () => {
        return request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(serviceStub.getDashboardDetail).to.be.calledOnce();
                expect(serviceStub.getDashboardDetail).to.be.calledWith(testUser);
            });
    });
});

