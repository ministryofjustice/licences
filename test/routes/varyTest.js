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
        licenceService.getLicence.resolves({licence:
                {reporting: {reportingInstructions: {buildingAndStreet1: 'this'}}}
        });
        const app = createApp({licenceServiceStub: licenceService}, 'roUser');

        const routes = [
            {url: '/hdc/vary/evidence/1', content: 'Provide evidence'},
            {url: '/hdc/vary/licenceDetails/1', content: 'Enter licence details'},
            {url: '/hdc/vary/address/1', content: 'Curfew address'},
            {url: '/hdc/vary/reportingAddress/1', content: 'name="reportingAddressLine1" value="this"'}
        ];

        testFormPageGets(app, routes, licenceService);
    });

    describe('GET /hdc/vary/licenceDetails', () => {
        it('renders page if licence doesnt exist', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getLicence.resolves({
                licence: {
                    vary: {evidence: {evidence: 'qfe'}},
                    variedFromLicenceNotInSystem: true
                },
                stage: 'VARY'
            });

            const app = createApp({licenceServiceStub: licenceService}, 'roUser');
            return request(app)
                .get('/hdc/vary/licenceDetails/1')
                .expect(200);
        });

        it('redirects to tasklist if licence exists', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getLicence.resolves({
                licence: {
                    vary: {evidence: {evidence: 'qfe'}},
                    variedFromLicenceNotInSystem: true,
                    proposedAddress: {curfewAddress: {addressLine1: 'this'}}
                },
                stage: 'VARY'
            });

            const app = createApp({licenceServiceStub: licenceService}, 'roUser');
            return request(app)
                .get('/hdc/vary/licenceDetails/1')
                .expect(302)
                .expect('Location', '/hdc/taskList/1');
        });
    });

    describe('POST /hdc/vary/evidence/', () => {
        it('submits and redirects to /hdc/vary/licenceDetails/1', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.update.resolves({vary: {evidence: {}}});

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
                        formName: 'evidence',
                        postRelease: false
                    });

                    expect(res.header.location).to.equal('/hdc/vary/licenceDetails/1');
                });
        });
    });

    describe('approval route', () => {
        const licenceService = createLicenceServiceStub();
        licenceService.getLicence = sinon.stub().resolves({
            licence: {
                vary: {approval: {name: 'name', jobTitle: 'title'}}
            }
        });

        const app = createApp({licenceServiceStub: licenceService}, 'roUser');

        const routes = [
            {url: '/hdc/vary/approval/1', content: 'name="name" value="name"'}
        ];

        testFormPageGets(app, routes, licenceService);
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
                        {bookingId: 1, additionalConditions: 'Yes'}, 1, {key: 'value'}, formConfig.licenceDetails);

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
                        {bookingId: 1, additionalConditions: 'No'}, 1, {key: 'value'}, formConfig.licenceDetails);

                    expect(res.header.location).to.equal('/hdc/taskList/1');
                });
        });

        it('calls validate and passes in appropriate form items', () => {
            const licenceService = createLicenceServiceStub();
            const app = createApp({licenceServiceStub: licenceService}, 'roUser');
            return request(app)
                .post('/hdc/vary/licenceDetails/1')
                .send({bookingId: 1, additionalConditions: 'No'})
                .expect(302)
                .expect(res => {
                    expect(licenceService.validateForm).to.be.calledOnce();
                    expect(licenceService.validateForm).to.be.calledWith({
                        formResponse: {additionalConditions: 'No'},
                        pageConfig: formConfig.licenceDetails
                    });
                });
        });


        it('redirects to get if errors found', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.validateForm.returns({error: 'this'});
            const app = createApp({licenceServiceStub: licenceService}, 'roUser');
            return request(app)
                .post('/hdc/vary/licenceDetails/1')
                .send({bookingId: 1, addressLine1: 'this'})
                .expect(302)
                .expect('Location', '/hdc/vary/licenceDetails/1');
        });
    });

    describe('POST /hdc/vary/address/', () => {
        it('submits and redirects to tasklist', () => {
            const licenceService = createLicenceServiceStub();
            const app = createApp({licenceServiceStub: licenceService}, 'roUser');
            return request(app)
                .post('/hdc/vary/address/1')
                .send({bookingId: 1, addressLine1: 'this'})
                .expect(302)
                .expect(res => {
                    expect(licenceService.createLicenceFromFlatInput).to.be.calledOnce();
                    expect(licenceService.createLicenceFromFlatInput).to.be.calledWith(
                        {bookingId: 1, addressLine1: 'this'}, 1, {key: 'value'}, formConfig.licenceDetails);

                    expect(res.header.location).to.equal('/hdc/taskList/1');
                });
        });

        it('redirects to get if errors found', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.validateForm.returns({error: 'this'});
            const app = createApp({licenceServiceStub: licenceService}, 'roUser');
            return request(app)
                .post('/hdc/vary/address/1')
                .send({bookingId: 1, addressLine1: 'this'})
                .expect(302)
                .expect('Location', '/hdc/vary/address/1');
        });
    });

    describe('POST /hdc/vary/reportingAddress/', () => {
        it('submits and redirects to tasklist', () => {
            const licenceService = createLicenceServiceStub();
            const app = createApp({licenceServiceStub: licenceService}, 'roUser');
            return request(app)
                .post('/hdc/vary/reportingAddress/1')
                .send({bookingId: 1, addressLine1: 'this'})
                .expect(302)
                .expect(res => {
                    expect(licenceService.createLicenceFromFlatInput).to.be.calledOnce();
                    expect(licenceService.createLicenceFromFlatInput).to.be.calledWith(
                        {bookingId: 1, addressLine1: 'this'}, 1, {key: 'value'}, formConfig.licenceDetails);

                    expect(res.header.location).to.equal('/hdc/taskList/1');
                });
        });

        it('redirects to get if errors found', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.validateForm.returns({error: 'this'});
            const app = createApp({licenceServiceStub: licenceService}, 'roUser');
            return request(app)
                .post('/hdc/vary/reportingAddress/1')
                .send({bookingId: 1, addressLine1: 'this'})
                .expect(302)
                .expect('Location', '/hdc/vary/reportingAddress/1');
        });
    });
});

function createApp({licenceServiceStub}, user) {
    const prisonerService = createPrisonerServiceStub();
    const licenceService = licenceServiceStub || createLicenceServiceStub();
    const signInService = signInServiceStub;

    const baseRouter = standardRouter({licenceService, prisonerService, authenticationMiddleware, audit: auditStub, signInService});
    const route = baseRouter(createRoute({licenceService, prisonerService}));

    return appSetup(route, user, '/hdc/vary');
}
