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
const createRoute = require('../../server/routes/approval');
const formConfig = require('../../server/routes/config/approval');

const prisonerInfoResponse = {
    bookingId: 1,
    facialImageId: 2,
    dateOfBirth: '23/12/1971',
    firstName: 'F',
    middleName: 'M',
    lastName: 'L',
    offenderNo: 'noms',
    aliases: 'Alias',
    assignedLivingUnitDesc: 'Loc',
    physicalAttributes: {gender: 'Male'},
    imageId: 'imgId',
    captureDate: '23/11/1971',
    sentenceExpiryDate: '03/12/1985'
};

describe('/hdc/approval', () => {
    let app;
    let licenceServiceStub;

    beforeEach(() => {
        licenceServiceStub = createLicenceServiceStub();
        app = createApp({licenceServiceStub}, 'dmUser');
        licenceServiceStub.update.resolves({approval: {release: {decision: 'Yes'}}});
    });

    describe('approval routes', () => {
        const service = createLicenceServiceStub();
        service.getLicence.resolves({
            stage: 'APPROVAL',
            licence: {
                proposedAddress: {curfewAddress: {addressLine1: 'line1'}},
                curfew: {curfewAddressReview: {consent: 'No'}}
            }});
        const app = createApp({licenceServiceStub: service}, 'dmUser');
        const routes = [
           // {url: '/hdc/approval/release/1', content: 'Do you approve HDC release for this offender?'},
            {url: '/hdc/approval/refuseReason/1', content: 'HDC refused because there is no suitable curfew address'}
        ];

        testFormPageGets(app, routes, service);
    });

    describe('GET /approval/routes/:bookingId', () => {
        it('should display the offender details - release', () => {
            return request(app)
                .get('/hdc/approval/release/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('23/12/1971');

                });
        });
        it('should display the offender details - refuseReason', () => {
            return request(app)
                .get('/hdc/approval/refuseReason/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('23/12/1971');

                });
        });

        it('should throw if requested by non-DM user', () => {

            const caApp = createApp({licenceServiceStub}, 'caUser');

            return request(caApp)
                .get('/hdc/approval/release/1')
                .expect(403);
        });
    });

    describe('POST /hdc/approval/:form/:bookingId', () => {
        const routes = [
            {
                url: '/hdc/approval/release/1',
                body: {decision: 'Yes'},
                section: 'release',
                nextPath: '/hdc/send/decided/1',
                formName: 'release'
            },
            {
                url: '/hdc/approval/release/1',
                body: {decision: 'No'},
                section: 'release',
                nextPath: '/hdc/send/decided/1',
                formName: 'release'
            },
            {
                url: '/hdc/approval/refuseReason/1',
                body: {decision: 'No'},
                section: 'release',
                nextPath: '/hdc/send/decided/1',
                formName: 'refuseReason'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceServiceStub.update).to.be.calledOnce();
                        expect(licenceServiceStub.update).to.be.calledWith({
                            bookingId: '1',
                            originalLicence: {licence: {key: 'value'}},
                            config: formConfig[route.formName],
                            userInput: route.body,
                            licenceSection: 'approval',
                            formName: route.section
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });
        });

        it('should redirect to same page if errors on input', () => {
            licenceServiceStub.validateForm.returns({decision: 'Error 1'});

            return request(app)
                .post('/hdc/approval/release/1')
                .send({})
                .expect(302)
                .expect('Location', '/hdc/approval/release/1');
        });

        it('should throw if submitted by non-DM user', () => {

            const caApp = createApp({licenceServiceStub}, 'caUser');

            return request(caApp)
                .post('/hdc/approval/release/1')
                .send({decision: 'Yes'})
                .expect(403);
        });

        it('should throw if submitted by non-DM user case insensitively', () => {

            const caApp = createApp({licenceServiceStub}, 'caUser');

            return request(caApp)
                .post('/hdc/Approval/release/1')
                .send({decision: 'Yes'})
                .expect(403);
        });
    });
});

function createApp({licenceServiceStub}, user) {
    const prisonerService = createPrisonerServiceStub();
    prisonerService.getPrisonerDetails = sinon.stub().resolves(prisonerInfoResponse);
    const licenceService = licenceServiceStub || createLicenceServiceStub();
    const signInService = signInServiceStub;

    const baseRouter = standardRouter({licenceService, prisonerService, authenticationMiddleware, audit: auditStub, signInService});
    const route = baseRouter(createRoute({licenceService, prisonerService}));

    return appSetup(route, user, '/hdc/approval');
}
