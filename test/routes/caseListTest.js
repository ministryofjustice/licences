const request = require('supertest');

const {
    appSetup,
    caseListServiceStub,
    loggerStub,
    authenticationMiddleware
} = require('../supertestSetup');

const caseListResponse = require('../stubs/caseListResponse');

const createCaseListRoute = require('../../server/routes/caseList');

describe('GET /caseList', () => {

    let app;
    beforeEach(() => {
        setupApp('caUser');
    });

    it('redirects if accesss /', () => {
        return request(app)
            .get('/')
            .expect(302)
            .expect('Location', '/caselist/active');
    });

    it('renders the hdc eligible prisoners page', () => {
        return request(app)
            .get('/active')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(res.text).to.include('id="hdcEligiblePrisoners">');
            });
    });
    function setupApp(user) {
        caseListServiceStub.getHdcCaseList.resolves(caseListResponse);
        app = appSetup(createCaseListRoute({
            logger: loggerStub,
            caseListService: caseListServiceStub,
            authenticationMiddleware
        }), user);
    }
});
