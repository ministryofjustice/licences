const request = require('supertest');

const {
    appSetup,
    caseListServiceStub,
    loggerStub,
    authenticationMiddleware,
    auditStub
} = require('../supertestSetup');

const caseListResponse = require('../stubs/caseListResponse');

const createCaseListRoute = require('../../server/routes/caseList');

describe('GET /caseList', () => {

    beforeEach(() => {
        caseListServiceStub.getHdcCaseList.resolves(caseListResponse);
        caseListServiceStub.addTabToCases.returns(caseListResponse);
    });

    const app = appSetup(createCaseListRoute({
        logger: loggerStub,
        caseListService: caseListServiceStub,
        authenticationMiddleware,
        audit: auditStub
    }));

    it('redirects to tab if none supplied', () => {
        return request(app)
            .get('/')
            .expect(302)
            .expect(res => {
                expect(res.header.location).to.include('/caseList/ready');
            });
    });

    it('redirects to tab if unexpected tab supplied', () => {
        return request(app)
            .get('/fefe')
            .expect(302)
            .expect(res => {
                expect(res.header.location).to.include('/caseList/ready');
            });
    });


    it('renders and HTML output', () => {
        return request(app)
            .get('/ready')
            .expect(200)
            .expect('Content-Type', /html/);
    });

    it('renders the hdc eligible prisoners page', () => {
        return request(app)
            .get('/ready')
            .expect(200)
            .expect(res => {
                expect(res.text).to.include('No offenders in this view');
            });
    });

    it('should filter out offenders that dont have the correct tab', () => {
        caseListResponse[1].tab = 'ready';
        caseListResponse[2].tab = 'ready';
        return request(app)
            .get('/ready')
            .expect(200)
            .expect(res => {
                expect(res.text).to.not.include('RO Processing Andrews');
                expect(res.text).to.include('Unstarted Andrews');
                expect(res.text).to.include('Eligibility Andrews');
                expect(res.text).to.not.include('Approval Andrews');
                expect(res.text).to.not.include('Approved Andrews');
                expect(res.text).to.not.include('Refused Andrews');
                expect(res.text).to.not.include('Processing CA not postponed Andrews');
                expect(res.text).to.not.include('Processing CA postponed Andrews');
                expect(res.text).to.not.include('Opted out Andrews');
                expect(res.text).to.not.include('Eligible Andrews');
            });
    });
});
