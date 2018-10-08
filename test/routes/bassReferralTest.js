const request = require('supertest');

const {
    createPrisonerServiceStub,
    createLicenceServiceStub,
    authenticationMiddleware,
    auditStub,
    appSetup,
    testFormPageGets,
    loggerStub
} = require('../supertestSetup');

const createRoute = require('../../server/routes/bassReferral');
const formConfig = require('../../server/routes/config/bassReferral');

describe('/hdc/bassReferral', () => {

    describe('bass referral routes', () => {
        const licenceService = createLicenceServiceStub();
        licenceService.getLicence = sinon.stub().resolves({
            licence: {},
            stage: 'ELIGIBILITY'
        });

        const app = createApp({licenceServiceStub: licenceService}, 'caUser');

        const routes = [
            {url: '/hdc/bassReferral/bassRequest/1', content: 'BASS referral'}
        ];

        testFormPageGets(app, routes, licenceService);
    });

    describe('POST /hdc/bassReferral/:form/:bookingId', () => {
        const routes = [
            {
                url: '/hdc/bassReferral/bassRequest/1',
                body: {bookingId: 1},
                form: 'bassRequest',
                nextPath: '/hdc/taskList/1',
                user: 'caUser'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            bookingId: '1',
                            config: formConfig[route.form],
                            userInput: route.body,
                            licenceSection: 'bassReferral',
                            formName: route.form
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });

            it('throws an error if logged in as dm', () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceServiceStub: licenceService}, 'dmUser');

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(403);

            });
        });
    });


});

function createApp({licenceServiceStub}, user) {
    const prisonerServiceStub = createPrisonerServiceStub();
    licenceServiceStub = licenceServiceStub || createLicenceServiceStub();

    const route = createRoute({
        logger: loggerStub,
        licenceService: licenceServiceStub,
        prisonerService: prisonerServiceStub,
        authenticationMiddleware,
        audit: auditStub
    });

    return appSetup(route, user, '/hdc');
}
