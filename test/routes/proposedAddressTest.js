const {
    request,
    sandbox,
    expect,
    licenceServiceStub,
    hdcRoute,
    formConfig,
    appSetup
} = require('../supertestSetup');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'CA'
};

const app = appSetup(hdcRoute, testUser);

describe('/hdc/proposedAddress', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('routes', () => {
        const pages = [
            {route: '/proposedAddress/optOut/1', content: 'HDC opt out decision'},
            {route: '/proposedAddress/bassReferral/1', content: 'BASS referral'},
            {route: '/proposedAddress/curfewAddress/1', content: 'Proposed curfew address'},
            {route: '/proposedAddress/confirmAddress/1', content: 'Confirm address details'},
            {route: '/proposedAddress/confirmAddress/1', content: 'href="/hdc/send/1'}
        ];

        pages.forEach(get => {
            it(`renders the ${get.route} page`, () => {
                return request(app)
                    .get(get.route)
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.contain(get.content);
                    });
            });
        });
    });

    describe('POST /proposedAddress/:formName/:nomisId', () => {
        context('When page contains form fields', () => {
            it('calls updateLicence from licenceService', () => {

                const formResponse = {
                    nomisId: '1',
                    decision: 'Yes',
                    reason: 'sexOffenderRegister'
                };

                return request(app)
                    .post('/proposedAddress/optOut/1')
                    .send(formResponse)
                    .expect(302)
                    .expect(res => {
                        expect(licenceServiceStub.update).to.be.calledOnce();
                        expect(licenceServiceStub.update).to.be.calledWith({
                            licence: {key: 'value'},
                            nomisId: '1',
                            fieldMap: formConfig.optOut.fields,
                            userInput: formResponse,
                            licenceSection: 'proposedAddress',
                            formName: 'optOut'
                        });
                    });
            });
        });
    });
});
