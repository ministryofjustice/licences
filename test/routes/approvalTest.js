const {
    request,
    prisonerServiceStub,
    expect,
    licenceServiceStub,
    hdcRoute,
    formConfig,
    appSetup,
    testFormPageGets
} = require('../supertestSetup');

const {roles} = require('../../server/models/roles');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: roles.DM
};

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

const app = appSetup(hdcRoute, testUser);

describe('/hdc/approval', () => {

    beforeEach(() => {
        prisonerServiceStub.getPrisonerDetails.resolves(prisonerInfoResponse);
    });

    describe('approval routes', () => {
        const routes = [
            {url: '/approval/release/1', content: 'I approve HDC release'}
        ];

        testFormPageGets(app, routes);
    });

    describe('GET /approval/routes/:nomisId', () => {

        it('should display the offender details', () => {
            return request(app)
                .get('/approval/release/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('23/12/1971');

                });
        });
    });

    describe('POST /hdc/eligibility/:form/:nomisId', () => {
        const routes = [
            {
                url: '/approval/release/1',
                body: {decision: 'Yes'},
                section: 'release',
                nextPath: '/hdc/send/1'
            },
            {
                url: '/approval/release/1',
                body: {decision: 'No'},
                section: 'release',
                nextPath: '/hdc/send/1'
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
                            licence: {key: 'value'},
                            nomisId: '1',
                            fieldMap: formConfig.release.fields,
                            userInput: route.body,
                            licenceSection: 'approval',
                            formName: route.section
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });
        });
    });
});

