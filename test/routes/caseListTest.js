const {
    request,
    appSetup,
    expect,
    caseListServiceStub,
    loggerStub,
    authenticationMiddleware
} = require('../supertestSetup');

const createCaseListRoute = require('../../server/routes/caseList');

const app = appSetup(createCaseListRoute({
    logger: loggerStub,
    caseListService: caseListServiceStub,
    authenticationMiddleware
}));

describe('GET /caseList', () => {

    it('renders and HTML output', () => {
        return request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', /html/);

    });

    it('renders the hdc eligible prisoners page', () => {
        return request(app)
            .get('/')
            .expect(200)
            .expect(res => {
                expect(res.text).to.include('id="hdcEligiblePrisoners">');
            });

    });
});
