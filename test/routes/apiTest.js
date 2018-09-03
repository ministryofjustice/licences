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
    });

});

function createApp(service = reportingService) {
    const route = createApiRoute({reportingService: service});

    const app = express();
    app.use('/api/', route);

    return app;
}

const createReportingServiceStub = () => ({
    getAddressSubmission: sinon.stub().resolves({msg: 'hello'})
});
