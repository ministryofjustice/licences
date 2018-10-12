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

    context('CA', () => {

        beforeEach(() => {
            setupApp('caUser');
        });

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

    context('CA', () => {

        beforeEach(() => {
            setupApp('caUser');
        });

        it('should filter out offenders that dont have the correct status', () => {
            return request(app)
                .get('/')
                .expect(200)
                .expect(res => {
                    expect(res.text).to.include('RO Processing Andrews');
                    expect(res.text).to.include('Unstarted Andrews');
                    expect(res.text).to.include('Eligibility Andrews');
                    expect(res.text).to.include('Approval Andrews');
                    expect(res.text).to.include('Approved Andrews');
                    expect(res.text).to.include('Refused Andrews');
                    expect(res.text).to.include('Processing CA not postponed Andrews');
                    expect(res.text).to.include('Processing CA postponed Andrews');
                    expect(res.text).to.include('Opted out Andrews');
                    expect(res.text).to.include('Eligible Andrews');
                });
        });
    });

    context('RO', () => {

        beforeEach(() => {
            setupApp('roUser');
        });

        it('should filter out offenders that dont have the correct status', () => {
            return request(app)
                .get('/')
                .expect(200)
                .expect(res => {
                    expect(res.text).to.include('RO Processing Andrews');
                    expect(res.text).to.not.include('Unstarted Andrews');
                    expect(res.text).to.not.include('Eligibility Andrews');
                    expect(res.text).to.include('Approval Andrews');
                    expect(res.text).to.include('Approved Andrews');
                    expect(res.text).to.include('Refused Andrews');
                    expect(res.text).to.include('Processing CA not postponed Andrews');
                    expect(res.text).to.include('Processing CA postponed Andrews');
                    expect(res.text).to.not.include('Opted out Andrews');
                    expect(res.text).to.not.include('Eligible Andrews');
                });
        });

    });

    context('DM', () => {

        beforeEach(() => {
            setupApp('dmUser');
        });

        it('should filter out offenders that dont have the correct status', () => {
            return request(app)
                .get('/')
                .expect(200)
                .expect(res => {
                    expect(res.text).to.not.include('RO Processing Andrews');
                    expect(res.text).to.not.include('Unstarted Andrews');
                    expect(res.text).to.not.include('Eligibility Andrews');
                    expect(res.text).to.include('Approval Andrews');
                    expect(res.text).to.include('Approved Andrews');
                    expect(res.text).to.include('Refused Andrews');
                    expect(res.text).to.not.include('Processing CA not postponed Andrews');
                    expect(res.text).to.include('Processing CA postponed Andrews');
                    expect(res.text).to.not.include('Opted out Andrews');
                    expect(res.text).to.not.include('Eligible Andrews');
                });
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
