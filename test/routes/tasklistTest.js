const {
    request,
    sandbox,
    expect,
    appSetup
} = require('./supertestSetup');

const createTasklistRoute = require('../../server/routes/tasklist');

const loggerStub = {
    debug: sandbox.stub()
};
const serviceStub = {
    getDashboardDetail: sandbox.stub()
};

const userManager = {
    getUser: sandbox.stub().returns('a1')
};

const audit = {
    record: sandbox.stub()
};

const app = appSetup(createTasklistRoute({tasklistService: serviceStub, logger: loggerStub, audit, userManager}));

describe('GET /', () => {

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
                expect(serviceStub.getDashboardDetail).to.be.calledWith('a1');
            });

    });

    it('should audit the interaction', () => {
        return request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(audit.record).to.be.calledOnce();
                expect(audit.record).to.be.calledWith('VIEW_DASHBOARD', 'a1');
            });

    });
});

