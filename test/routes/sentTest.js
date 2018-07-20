const request = require('supertest');

const {
    licenceServiceStub,
    loggerStub,
    authenticationMiddleware,
    appSetup
} = require('../supertestSetup');

const createSendRoute = require('../../server/routes/sent');

const app = appSetup(createSendRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}));

describe('GET sent', () => {
    it('renders the sent page for CAtoRO', () => {
        return request(app)
            .get('/caToRo')
            .expect(200)
            .expect(res => {
                expect(res.text).to.include('Curfew address submitted');
            });
    });

    it('renders the sent page for CAtoDM', () => {
        return request(app)
            .get('/caToDm')
            .expect(200)
            .expect(res => {
                expect(res.text).to.include('Submitted for approval');
            });
    });

    it('renders the sent page for ROtoCA', () => {
        return request(app)
            .get('/roToCa')
            .expect(200)
            .expect(res => {
                expect(res.text).to.include('Licence information sent');
            });
    });

    it('renders the sent page for DMtoCA', () => {
        return request(app)
            .get('/dmToCa')
            .expect(200)
            .expect(res => {
                expect(res.text).to.include('Submitted to the prison case admin');
            });
    });

    it('renders the sent page for CAtoDMRefusal', () => {
        return request(app)
            .get('/caToDmRefusal')
            .expect(200)
            .expect(res => {
                expect(res.text).to.include('Submitted for refusal');
            });
    });

    it('errors when an invalid transition type is provided', () => {
        return request(app)
            .get('/foobar')
            .expect(500);
    });
});

