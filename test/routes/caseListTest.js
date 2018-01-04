const {
    request,
    sandbox,
    appSetup,
    expect
} = require('../supertestSetup');

const createCaseListRoute = require('../../server/routes/caseList');

const loggerStub = {
    debug: sandbox.stub()
};

const serviceStub = {
    getHdcCaseList: sandbox.stub().returnsPromise().resolves([])
};

const app = appSetup(createCaseListRoute({
    logger: loggerStub,
    caseListService: serviceStub
}));

describe('GET /caseList', () => {
    it('renders and HTML output', () => {
        return request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', /html/);

    });

    it('renders the hdc eligable prisoners page', () => {
        return request(app)
            .get('/')
            .expect(200)
            .expect(res => {
                expect(res.text).to.include('id="hdcEligiblePrisoners">');
            });

    });
});
