const request = require('supertest');

const {
    createPrisonerServiceStub,
    createLicenceServiceStub,
    authenticationMiddleware,
    auditStub,
    appSetup,
    createSignInServiceStub,
    createNomisPushServiceStub
} = require('../supertestSetup');

const standardRouter = require('../../server/routes/routeWorkers/standardRouter');
const createRoute = require('../../server/routes/finalChecks');
const formConfig = require('../../server/routes/config/finalChecks');

describe('/hdc/finalChecks', () => {
    describe('routes', () => {
        const routes = [
            {url: '/hdc/finalChecks/seriousOffence/1', content: 'Has the offender committed an offence'},
            {url: '/hdc/finalChecks/onRemand/1', content: 'Is the offender currently on remand '},
            {url: '/hdc/finalChecks/confiscationOrder/1', content: 'Is the offender subject to a confiscation order?'},
            {url: '/hdc/finalChecks/postpone/1', content: 'Postpone'}
        ];

        routes.forEach(route => {
            it(`renders the ${route.url} page`, () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceService});

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

    describe('POST /hdc/finalChecks/:section/:bookingId', () => {
        const routes = [
            {
                url: '/hdc/finalChecks/seriousOffence/1',
                body: {bookingId: 1},
                formName: 'seriousOffence',
                nextPath: '/hdc/finalChecks/onRemand/1'
            },
            {
                url: '/hdc/finalChecks/onRemand/1',
                body: {bookingId: 1},
                formName: 'onRemand',
                nextPath: '/hdc/finalChecks/confiscationOrder/1'
            },
            {
                url: '/hdc/finalChecks/confiscationOrder/1',
                body: {bookingId: 1},
                formName: 'confiscationOrder',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/hdc/finalChecks/refuse/1',
                body: {bookingId: 1, decision: 'Yes'},
                fieldMap: formConfig.refuse,
                formName: 'refusal',
                nextPath: '/hdc/finalChecks/refusal/1'
            },
            {
                url: '/hdc/finalChecks/refuse/1',
                body: {bookingId: 1, decision: 'No'},
                fieldMap: formConfig.refuse,
                formName: 'refusal',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/hdc/finalChecks/refusal/1',
                body: {bookingId: 1, reason: 'something', outOfTimeReasons: []},
                fieldMap: formConfig.refusal,
                formName: 'refusal',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/hdc/finalChecks/postpone/1',
                body: {bookingId: 1, decision: 'Yes', postponeReason: 'something'},
                fieldMap: formConfig.postpone,
                formName: 'postpone',
                nextPath: '/hdc/taskList/1'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                const licenceService = createLicenceServiceStub();
                licenceService.update.resolves({finalChecks: {[route.formName]: {}}});
                const app = createApp({licenceService});

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            bookingId: '1',
                            originalLicence: {licence: {key: 'value'}},
                            config: route.fieldMap || formConfig[route.formName],
                            userInput: route.body,
                            licenceSection: route.sectionName || 'finalChecks',
                            formName: route.formName,
                            postRelease: false
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });

            it('throws an error if logged in as ro', () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceService}, 'roUser');

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(403);
            });
        });

        context('when there are errors', () => {
            it('should redirect back to seriousOffence page if there is an error', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.update.resolves({finalChecks: {seriousOffence: {}}});
                licenceService.validateForm = sinon.stub().returns({reason: 'error'});
                const app = createApp({licenceService});

                return request(app)
                    .post('/hdc/finalChecks/seriousOffence/1')
                    .send({})
                    .expect(302)
                    .expect('Location', '/hdc/finalChecks/seriousOffence/1');

            });

            it('should redirect back to onRemand page if there is an error', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.update.resolves({finalChecks: {onRemand: {}}});
                licenceService.validateForm = sinon.stub().returns({reason: 'error'});
                const app = createApp({licenceService});

                return request(app)
                    .post('/hdc/finalChecks/onRemand/1')
                    .send({})
                    .expect(302)
                    .expect('Location', '/hdc/finalChecks/onRemand/1');

            });

            it('should redirect back to confiscationOrder page if there is an error', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.update.resolves({finalChecks: {confiscationOrder: {}}});
                licenceService.validateForm = sinon.stub().returns({reason: 'error'});
                const app = createApp({licenceService});

                return request(app)
                    .post('/hdc/finalChecks/confiscationOrder/1')
                    .send({})
                    .expect(302)
                    .expect('Location', '/hdc/finalChecks/confiscationOrder/1');

            });
        });

        it('should push the postponement to nomis', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.update.resolves({finalChecks: {postpone: {decision: 'Yes', postponeReason: 'Something'}}});
            const signInService = createSignInServiceStub();
            signInService.getClientCredentialsTokens.resolves('new token');
            const nomisPushService = createNomisPushServiceStub();
            const app = createApp({licenceService, signInService, nomisPushService}, 'caUser', {pushToNomis: true});

            return request(app)
                .post('/hdc/finalChecks/postpone/1')
                .send({decision: 'Yes'})
                .expect(302)
                .expect(res => {
                    expect(signInService.getClientCredentialsTokens).to.be.calledOnce();
                    expect(nomisPushService.pushStatus).to.be.calledOnce();
                    expect(
                        nomisPushService.pushStatus).to.be.calledWith(
                            '1', {postpone: 'Yes', postponeReason: 'Something'}, 'new token');
                });
        });

        it('should not push the postponement to nomis if config variable is false', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.update.resolves({finalChecks: {postpone: {decision: 'Yes', postponeReason: 'Something'}}});
            const signInService = createSignInServiceStub();
            signInService.getClientCredentialsTokens.resolves('new token');
            const nomisPushService = createNomisPushServiceStub();
            const app = createApp({licenceService, signInService, nomisPushService}, 'caUser', {pushToNomis: false});

            return request(app)
                .post('/hdc/finalChecks/postpone/1')
                .send({decision: 'Yes'})
                .expect(302)
                .expect(res => {
                    expect(signInService.getClientCredentialsTokens).to.not.be.called();
                    expect(nomisPushService.pushStatus).to.not.be.called();
                });
        });
    });
});

function createApp({licenceService, signInService, nomisPushService}, user, config = {}) {
    const prisonerService = createPrisonerServiceStub();
    licenceService = licenceService || createLicenceServiceStub();
    signInService = signInService || createSignInServiceStub();
    signInService.getClientCredentialsTokens.resolves('new token');
    nomisPushService = nomisPushService || createNomisPushServiceStub();

    const baseRouter = standardRouter({licenceService, prisonerService, authenticationMiddleware, audit: auditStub, signInService, config});
    const route = baseRouter(createRoute({licenceService, signInService, nomisPushService}));

    return appSetup(route, user, '/hdc/finalChecks');
}
