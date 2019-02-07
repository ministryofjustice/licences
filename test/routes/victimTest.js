const request = require('supertest');

const {
    createPrisonerServiceStub,
    createLicenceServiceStub,
    authenticationMiddleware,
    auditStub,
    appSetup,
    testFormPageGets,
    createSignInServiceStub
} = require('../supertestSetup');

const standardRouter = require('../../server/routes/routeWorkers/standardRouter');
const createRoute = require('../../server/routes/victim');
const formConfig = require('../../server/routes/config/victim');

describe('/hdc/victim', () => {

    let licenceService;

    beforeEach(() => {
        licenceService = createLicenceServiceStub();
        auditStub.record.reset();
    });

    describe('victim liaison routes', () => {
        const routes = [
            {url: '/hdc/victim/victimLiaison/1', content: 'Is this a Victim Contact Service '}
        ];
        const licenceService = createLicenceServiceStub();
        const app = createApp({licenceService}, 'roUser');

        testFormPageGets(app, routes, licenceService);
    });


    describe('POST /victim/:formName/:bookingId', () => {
        const formResponse = {
            bookingId: '1',
            decision: 'Yes'
        };

        context('When page contains form fields', () => {
            it('calls updateLicence from licenceService', () => {
                const app = createApp({licenceService}, 'roUser');
                return request(app)
                    .post('/hdc/victim/victimLiaison/1')
                    .send(formResponse)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            bookingId: '1',
                            originalLicence: {licence: {key: 'value'}},
                            config: formConfig.victimLiaison,
                            userInput: formResponse,
                            licenceSection: 'victim',
                            formName: 'victimLiaison',
                            postRelease: false
                        });
                    });
            });

            it('calls updateLicence from licenceService when ca in post approval', () => {
                licenceService.getLicence.resolves({stage: 'DECIDED', licence: {key: 'value'}});
                const app = createApp({licenceService}, 'caUser');
                return request(app)
                    .post('/hdc/victim/victimLiaison/1')
                    .send(formResponse)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            bookingId: '1',
                            originalLicence: {licence: {key: 'value'}, stage: 'DECIDED'},
                            config: formConfig.victimLiaison,
                            userInput: formResponse,
                            licenceSection: 'victim',
                            formName: 'victimLiaison',
                            postRelease: false
                        });
                    });
            });

            it('audits the update event', () => {
                const app = createApp({licenceService}, 'roUser');

                return request(app)
                    .post('/hdc/victim/victimLiaison/1')
                    .send(formResponse)
                    .expect(() => {
                        expect(auditStub.record).to.be.calledOnce();
                        expect(auditStub.record).to.be.calledWith('UPDATE_SECTION', 'id',
                            {
                                path: '/hdc/victim/victimLiaison/1',
                                bookingId: '1',
                                userInput: {
                                    decision: 'Yes'
                                }
                            });
                    });
            });

            it('throws when ca not in final checks or post approval', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence.resolves({stage: 'ELIGIBILITY', licence: {key: 'value'}});
                const app = createApp({licenceService}, 'caUser');
                return request(app)
                    .post('/hdc/victim/victimLiaison/1')
                    .send(formResponse)
                    .expect(403);

            });
        });
    });
});

function createApp({licenceService}, user) {
    const prisonerService = createPrisonerServiceStub();
    licenceService = licenceService || createLicenceServiceStub();
    const signInService = createSignInServiceStub();

    const baseRouter = standardRouter({licenceService, prisonerService, authenticationMiddleware, audit: auditStub, signInService});
    const route = baseRouter(createRoute({licenceService}));

    return appSetup(route, user, '/hdc/victim');
}
