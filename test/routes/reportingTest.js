const request = require('supertest');

const {
    createPrisonerServiceStub,
    createLicenceServiceStub,
    authenticationMiddleware,
    auditStub,
    appSetup
} = require('../supertestSetup');

const standardRouter = require('../../server/routes/routeWorkers/standardRouter');
const createRoute = require('../../server/routes/reporting');
const formConfig = require('../../server/routes/config/reporting');

describe('/hdc/reporting', () => {
    describe('routes', () => {
        const routes = [
            {url: '/hdc/reporting/reportingInstructions/1', content: 'Reporting instructions'},
            {url: '/hdc/reporting/reportingDate/1', content: 'Enter reporting date and time'}
        ];

        routes.forEach(route => {
            it(`renders the ${route.url} page`, () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceService}, 'roUser');

                return request(app)
                    .get(route.url)
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.contain(route.content);
                    });
            });
        });
    });

    describe('POST /hdc/reporting/reportingInstructions/:bookingId', () => {
        const routes = [
            {
                url: '/hdc/reporting/reportingInstructions/1',
                body: {bookingId: 1},
                section: 'reportingInstructions',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/hdc/reporting/reportingDate/1',
                body: {bookingId: 1},
                section: 'reportingDate',
                nextPath: '/hdc/pdf/taskList/1'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceService}, 'roUser');

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            bookingId: '1',
                            config: formConfig[route.section],
                            userInput: route.body,
                            licenceSection: 'reporting',
                            formName: route.section
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });

            it(`renders the correct path '${route.nextPath}' page when ca in post approval`, () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence.resolves({stage: 'DECIDED', licence: {key: 'value'}});
                const app = createApp({licenceService}, 'caUser');

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            bookingId: '1',
                            config: formConfig[route.section],
                            userInput: route.body,
                            licenceSection: 'reporting',
                            formName: route.section
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });

            it(`throws when posting to '${route.nextPath}' when ca in non-post approval`, () => {

                const licenceService = createLicenceServiceStub();
                licenceService.getLicence.resolves({stage: 'PROCESSING_RO', licence: {key: 'value'}});
                const app = createApp({licenceService}, 'caUser');

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(403);

            });
        });
    });
});

function createApp({licenceService}, user) {
    const prisonerService = createPrisonerServiceStub();
    licenceService = licenceService || createLicenceServiceStub();

    const baseRouter = standardRouter({licenceService, prisonerService, authenticationMiddleware, audit: auditStub});
    const route = baseRouter(createRoute({licenceService}));

    return appSetup(route, user, '/hdc');
}
