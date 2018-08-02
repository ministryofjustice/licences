const request = require('supertest');

const {
    loggerStub,
    searchServiceStub,
    authenticationMiddleware,
    appSetup,
    auditStub
} = require('../supertestSetup');

const createSearchRoute = require('../../server/routes/search');


describe('Search:', () => {

    beforeEach(() => {
        searchServiceStub.searchOffenders.resolves({});
    });

    describe('When role is RO', () => {

        const testUser = {
            token: 'token',
            role: 'RO'
        };

        const app = appSetup(createSearchRoute({
            searchService: searchServiceStub,
            logger: loggerStub,
            authenticationMiddleware,
            audit: auditStub
        }), testUser);

        describe('GET /search/offender', () => {

            it('renders and HTML output', () => {
                return request(app)
                    .get('/offender')
                    .expect(200)
                    .expect('Content-Type', /html/);
            });

        });

        describe('POST /search/offender', () => {

            it('parses search terms into query string and redirects to /hdc/search/offender/results', () => {
                return request(app)
                    .post('/offender')
                    .send({searchTerm: 'A0001XX'})
                    .expect(302)
                    .expect(res => {
                        expect(res.header['location']).to.eql('/hdc/search/offender/results?nomisId=A0001XX');
                    });

            });

            it('renders search page if input error', () => {
                return request(app)
                    .post('/offender')
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
                    .post('/offender/results')
                    .send({searchTerm: 'A0001XX'})
                    .expect(302)
                    .expect(res => {
                        expect(res.header['location']).to.eql('/hdc/search/offender/results?nomisId=A0001XX');
                    });

            });

            it('renders search page if input error', () => {
                return request(app)
                    .post('/offender/results')
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
                    .get('/offender/results?nomisId=A0001XX')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(() => {
                        expect(searchServiceStub.searchOffenders).to.be.calledOnce();
                        expect(searchServiceStub.searchOffenders)
                            .to.be.calledWith('A0001XX', testUser.token, testUser.role);
                    });
            });

        });
    });
});


