const request = require('supertest');

const {
    createPrisonerServiceStub,
    createLicenceServiceStub,
    authenticationMiddleware,
    auditStub,
    appSetup,
    testFormPageGets,
    signInServiceStub
} = require('../supertestSetup');

const standardRouter = require('../../server/routes/routeWorkers/standardRouter');
const createRoute = require('../../server/routes/bassReferral');
const formConfig = require('../../server/routes/config/bassReferral');

describe('/hdc/bassReferral', () => {

    context('CA', () => {

        describe('bass referral routes', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getLicence = sinon.stub().resolves({
                licence: {},
                stage: 'ELIGIBILITY'
            });

            const app = createApp({licenceServiceStub: licenceService}, 'caUser');

            const routes = [
                {url: '/hdc/bassReferral/bassRequest/1', content: 'Does the offender have a preferred BASS area'},
                {url: '/hdc/bassReferral/bassOffer/1', content: 'BASS address'},
                {url: '/hdc/bassReferral/rejected/1', content: 'BASS area rejected'},
                {url: '/hdc/bassReferral/unsuitable/1', content: 'Unsuitable for BASS'},
                {url: '/hdc/bassReferral/bassWithdrawn/1', content: 'BASS withdrawn'}
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
                },
                {
                    url: '/hdc/bassReferral/bassOffer/1',
                    body: {bookingId: 1, bassAccepted: 'Yes'},
                    form: 'bassOffer',
                    nextPath: '/hdc/taskList/1',
                    user: 'caUser'
                }
            ];

            routes.forEach(route => {
                it(`renders the correct path '${route.nextPath}' page`, () => {
                    const licenceService = createLicenceServiceStub();
                    const app = createApp({licenceServiceStub: licenceService}, route.user);
                    licenceService.update = sinon.stub().resolves({
                        bassReferral: {bassOffer: {}}
                    });
                    return request(app)
                        .post(route.url)
                        .send(route.body)
                        .expect(302)
                        .expect(res => {
                            expect(licenceService.update).to.be.calledOnce();
                            expect(licenceService.update).to.be.calledWith({
                                bookingId: '1',
                                originalLicence: {licence: {key: 'value'}},
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

                it('throws an error if logged in as ro', () => {
                    const licenceService = createLicenceServiceStub();
                    const app = createApp({licenceServiceStub: licenceService}, 'roUser');

                    return request(app)
                        .post(route.url)
                        .send(route.body)
                        .expect(403);
                });
            });
        });

        describe('POST /hdc/bassReferral/rejected/:bookingId', () => {

            it('rejects the bass request', () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');
                licenceService.rejectBass = sinon.stub().resolves({
                    bassReferral: {bassOffer: {}}
                });
                return request(app)
                    .post('/hdc/bassReferral/rejected/1')
                    .send({enterAlternative: 'Yes'})
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.rejectBass).to.be.calledOnce();
                        expect(licenceService.rejectBass).to.be.calledWith({key: 'value'}, '1', 'Yes', 'area');

                        expect(res.header.location).to.equal('/hdc/bassReferral/bassRequest/rejected/1');
                    });
            });
        });

        describe('POST /hdc/bassReferral/unsuitable/:bookingId', () => {

            it('rejects the bass request', () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');
                licenceService.rejectBass = sinon.stub().resolves({
                    bassReferral: {bassOffer: {}}
                });
                return request(app)
                    .post('/hdc/bassReferral/unsuitable/1')
                    .send({enterAlternative: 'Yes'})
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.rejectBass).to.be.calledOnce();
                        expect(licenceService.rejectBass).to.be.calledWith({key: 'value'}, '1', 'Yes', 'offender');

                        expect(res.header.location).to.equal('/hdc/bassReferral/bassRequest/unsuitable/1');
                    });
            });
        });

        describe('POST /hdc/bassReferral/bassOffer/withdraw/:bookingId', () => {

            it('withdraws the bass request', () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');
                licenceService.withdrawBass = sinon.stub().resolves({
                    bassReferral: {bassOffer: {}}
                });
                return request(app)
                    .post('/hdc/bassReferral/bassOffer/withdraw/1')
                    .send({withdrawalType: 'Offer'})
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.withdrawBass).to.be.calledOnce();
                        expect(licenceService.withdrawBass).to.be.calledWith({key: 'value'}, '1', 'Offer'
                        );

                        expect(res.header.location).to.equal('/hdc/bassReferral/bassWithdrawn/1');
                    });
            });
        });

        describe('POST /hdc/bassReferral/bassOffer/reinstate/:bookingId', () => {

            it('reinstates the bass request', () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');
                licenceService.reinstateBass = sinon.stub().resolves({
                    bassReferral: {bassOffer: {}}
                });
                return request(app)
                    .post('/hdc/bassReferral/bassOffer/reinstate/1')
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.reinstateBass).to.be.calledOnce();
                        expect(licenceService.reinstateBass).to.be.calledWith({key: 'value'}, '1'
                        );

                        expect(res.header.location).to.equal('/hdc/taskList/1');
                    });
            });
        });

    });

    context('RO', () => {

        describe('bass referral routes', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getLicence = sinon.stub().resolves({
                licence: {},
                stage: 'PROCESSING_RO'
            });

            const app = createApp({licenceServiceStub: licenceService}, 'roUser');

            const routes = [
                {url: '/hdc/bassReferral/bassAreaCheck/1', content: 'BASS area check'}
            ];

            testFormPageGets(app, routes, licenceService);
        });

        describe('POST /hdc/bassReferral/:form/:bookingId', () => {
            const routes = [
                {
                    url: '/hdc/bassReferral/bassAreaCheck/1',
                    body: {bookingId: 1},
                    form: 'bassAreaCheck',
                    nextPath: '/hdc/taskList/1',
                    user: 'roUser'
                }
            ];

            routes.forEach(route => {
                it(`renders the correct path '${route.nextPath}' page`, () => {
                    const licenceService = createLicenceServiceStub();
                    licenceService.update = sinon.stub().resolves({
                        bassReferral: {bassAreaCheck: {}}
                    });
                    const app = createApp({licenceServiceStub: licenceService}, route.user);
                    return request(app)
                        .post(route.url)
                        .send(route.body)
                        .expect(302)
                        .expect(res => {
                            expect(licenceService.update).to.be.calledOnce();
                            expect(licenceService.update).to.be.calledWith({
                                bookingId: '1',
                                originalLicence: {licence: {key: 'value'}},
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

                it('throws an error if logged in as ca', () => {
                    const licenceService = createLicenceServiceStub();
                    const app = createApp({licenceServiceStub: licenceService}, 'caUser');

                    return request(app)
                        .post(route.url)
                        .send(route.body)
                        .expect(403);

                });
            });
        });
    });
});

function createApp({licenceServiceStub}, user) {
    const prisonerService = createPrisonerServiceStub();
    const licenceService = licenceServiceStub || createLicenceServiceStub();
    const signInService = signInServiceStub;

    const baseRouter = standardRouter({licenceService, prisonerService, authenticationMiddleware, audit: auditStub, signInService});
    const route = baseRouter(createRoute({licenceService, prisonerService}));

    return appSetup(route, user, '/hdc/bassReferral');
}
