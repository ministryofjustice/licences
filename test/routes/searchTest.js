const request = require('supertest');

const {
    createPrisonerServiceStub,
    createLicenceServiceStub,
    searchServiceStub,
    appSetup,
    auditStub
} = require('../supertestSetup');

const standardRouter = require('../../server/routes/routeWorkers/standardRouter');
const createSearchRouter = require('../../server/routes/search');


describe('Search:', () => {

    beforeEach(() => {
        searchServiceStub.searchOffenders.resolves({});
    });

    describe('When role is RO', () => {

        const app = createApp({}, 'roUser', '/search/');

        describe('GET /search/offender', () => {

            it('renders and HTML output', () => {
                return request(app)
                    .get('/search/offender')
                    .expect(200)
                    .expect('Content-Type', /html/);
            });

        });

        describe('POST /search/offender', () => {

            it('parses search terms into query string and redirects to /hdc/search/offender/results', () => {
                return request(app)
                    .post('/search/offender')
                    .send({searchTerm: 'A0001XX'})
                    .expect(302)
                    .expect(res => {
                        expect(res.header['location']).to.eql('/hdc/search/offender/results?nomisId=A0001XX');
                    });

            });

            it('renders search page if input error', () => {
                return request(app)
                    .post('/search/offender')
                    .send({searchTerm: ''})
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.include('Invalid entry - too short');
                    });

            });

        });

        describe('POST /search/offender/results', () => {

            it('parses search terms into query string and redirects to /hdc/search/offender/results', () => {
                return request(app)
                    .post('/search/offender/results')
                    .send({searchTerm: 'A0001XX'})
                    .expect(302)
                    .expect(res => {
                        expect(res.header['location']).to.eql('/hdc/search/offender/results?nomisId=A0001XX');
                    });

            });

            it('renders search page if input error', () => {
                return request(app)
                    .post('/search/offender/results')
                    .send({searchTerm: ''})
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.include('Invalid entry - too short');
                    });

            });

        });

        describe('GET /search/offender/results', () => {

            it('calls search service and renders HTML output', () => {
                return request(app)
                    .get('/search/offender/results?nomisId=A0001XX')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(() => {
                        expect(searchServiceStub.searchOffenders).to.be.calledOnce();
                        expect(searchServiceStub.searchOffenders)
                            .to.be.calledWith('A0001XX', 'token', 'RO');
                    });
            });

        });
    });
});

function createApp({}, user) {
    const prisonerService = createPrisonerServiceStub();
    const licenceService = createLicenceServiceStub();

    const baseRouter = standardRouter({licenceService, prisonerService, audit: auditStub});
    const route = baseRouter(createSearchRouter({searchService: searchServiceStub}));

    return appSetup(route, user, '/search/');
}
