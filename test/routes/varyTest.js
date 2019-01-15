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
const createRoute = require('../../server/routes/vary');
const formConfig = require('../../server/routes/config/vary');

describe('/hdc/vary', () => {

    describe('vary routes', () => {
        const licenceService = createLicenceServiceStub();
        licenceService.getLicence = sinon.stub().resolves({});
        const app = createApp({licenceServiceStub: licenceService}, 'roUser');

        const routes = [
            {url: '/hdc/vary/evidence/1', content: 'Provide evidence'},
            {url: '/hdc/vary/licenceDetails/1', content: 'Enter licence details'}
        ];

        testFormPageGets(app, routes, licenceService);
    });


    describe('POST /hdc/vary/evidence/', () => {
        it('submits and redirects to /hdc/vary/licenceDetails/1', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.update.resolves({curfew: {firstNight: {}}});

            const app = createApp({licenceServiceStub: licenceService}, 'roUser');
            return request(app)
                .post('/hdc/vary/evidence/1')
                .send({bookingId: 1, evidence: 'a'})
                .expect(302)
                .expect(res => {
                    expect(licenceService.update).to.be.calledOnce();
                    expect(licenceService.update).to.be.calledWith({
                        bookingId: '1',
                        originalLicence: {licence: {key: 'value'}},
                        config: formConfig.evidence,
                        userInput: {bookingId: 1, evidence: 'a'},
                        licenceSection: 'vary',
                        formName: 'evidence'
                    });

                    expect(res.header.location).to.equal('/hdc/vary/licenceDetails/1');
                });
        });
    });

    describe('POST /hdc/vary/licenceDetails/', () => {
        it('submits and redirects to additional conditions page if radio selected', () => {
            const licenceService = createLicenceServiceStub();
            const app = createApp({licenceServiceStub: licenceService}, 'roUser');
            return request(app)
                .post('/hdc/vary/licenceDetails/1')
                .send({bookingId: 1, additionalConditions: 'Yes'})
                .expect(302)
                .expect(res => {
                    expect(licenceService.createLicenceFromFlatInput).to.be.calledOnce();
                    expect(licenceService.createLicenceFromFlatInput).to.be.calledWith(
                        {bookingId: 1, additionalConditions: 'Yes'}, 1, {key: 'value'});

                    expect(res.header.location).to.equal('/hdc/licenceConditions/additionalConditions/1');
                });
        });

        it('submits and redirects to tasklist if radio not selected', () => {
            const licenceService = createLicenceServiceStub();
            const app = createApp({licenceServiceStub: licenceService}, 'roUser');
            return request(app)
                .post('/hdc/vary/licenceDetails/1')
                .send({bookingId: 1, additionalConditions: 'No'})
                .expect(302)
                .expect(res => {
                    expect(licenceService.createLicenceFromFlatInput).to.be.calledOnce();
                    expect(licenceService.createLicenceFromFlatInput).to.be.calledWith(
                        {bookingId: 1, additionalConditions: 'No'}, 1, {key: 'value'});

                    expect(res.header.location).to.equal('/hdc/taskList/1');
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

    return appSetup(route, user, '/hdc');
}
