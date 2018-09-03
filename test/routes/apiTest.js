const request = require('supertest');
const express = require('express');

const createApiRoute = require('../../server/routes/api');
let reportingService;

describe('/api/', () => {

    beforeEach(() => {
        reportingService = createReportingServiceStub();
    });

    describe('address submission', () => {

        it('returns json', () => {

            const app = createApp(reportingService);
            return request(app)
                .get('/api/addressSubmission/:bookingId')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.msg).to.eql('hello');
                });
        });

        it('returns json if no booking id', () => {

            const app = createApp(reportingService);
            return request(app)
                .get('/api/addressSubmission/')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.msg).to.eql('hello');
                });
        });
    });

    describe('assessmentComplete submission', () => {

        it('returns json', () => {

            const app = createApp(reportingService);
            return request(app)
                .get('/api/assessmentComplete/:bookingId')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.assessment).to.eql('complete');
                });
        });

        it('returns json if no booking id', () => {

            const app = createApp(reportingService);
            return request(app)
                .get('/api/assessmentComplete/')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    expect(response.body.assessment).to.eql('complete');
                });
        });
    });

    describe('unknown report', () => {
        it('returns 404', () => {

            const app = createApp(reportingService);
            return request(app)
                .get('/api/somethingElse/')
                .expect('Content-Type', /json/)
                .expect(404);
        });
    });

});

function createApp(service = reportingService) {
    const route = createApiRoute({reportingService: service});

    const app = express();
    app.use('/api/', route);

    return app;
}

const createReportingServiceStub = () => ({
    getAddressSubmission: sinon.stub().resolves({msg: 'hello'}),
    getAssessmentComplete: sinon.stub().resolves({assessment: 'complete'})
});
