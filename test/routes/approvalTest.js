const request = require('supertest');

const {
    createPrisonerServiceStub,
    createLicenceServiceStub,
    createHdcRoute,
    formConfig,
    appSetup,
    testFormPageGets
} = require('../supertestSetup');

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
    });

    describe('approval routes', () => {
        const service = createLicenceServiceStub();
        const app = createApp({licenceServiceStub: service}, 'dmUser');
        const routes = [
            {url: '/hdc/approval/release/1', content: 'Do you approve HDC release for this offender?'},
            {url: '/hdc/approval/crdRefuse/1', content: 'HDC refused because there is not enough time'}
        ];

        testFormPageGets(app, routes, service);
    });

    describe('GET /approval/routes/:nomisId', () => {
        it('should display the offender details - release', () => {
            return request(app)
                .get('/hdc/approval/release/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('23/12/1971');

                });
        });
        it('should display the offender details - crdRefuse', () => {
            return request(app)
                .get('/hdc/approval/crdRefuse/1')
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

    describe('POST /hdc/approval/:form/:nomisId', () => {
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
                url: '/hdc/approval/crdRefuse/1',
                body: {decision: 'No'},
                section: 'release',
                nextPath: '/hdc/send/decided/1',
                formName: 'crdRefuse'
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
                            nomisId: '1',
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
            licenceServiceStub.getValidationErrorsForPage.returns({
                approval: {
                    release: {
                        decision: 'Error 1'
                    }
                }
            });

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
    });
});

function createApp({licenceServiceStub}, user) {
    const prisonerServiceStub = createPrisonerServiceStub();
    prisonerServiceStub.getPrisonerDetails = sinon.stub().resolves(prisonerInfoResponse);
    licenceServiceStub = licenceServiceStub || createLicenceServiceStub();

    const hdcRoute = createHdcRoute({
        licenceService: licenceServiceStub,
        prisonerService: prisonerServiceStub
    });

    return appSetup(hdcRoute, user, '/hdc/');
}
