const {
    request,
    expect,
    licenceServiceStub,
    hdcRoute,
    formConfig,
    appSetup,
    testFormPageGets
} = require('../supertestSetup');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'CA'
};

const app = appSetup(hdcRoute, testUser);

describe('/hdc/proposedAddress', () => {

    describe('proposed address routes', () => {
        const routes = [
            {url: '/proposedAddress/optOut/1', content: 'HDC opt out decision'},
            {url: '/proposedAddress/bassReferral/1', content: 'BASS referral'},
            {url: '/proposedAddress/curfewAddress/1', content: 'Proposed curfew address'},
            {url: '/proposedAddress/confirmAddress/1', content: 'Confirm address details'},
            {url: '/proposedAddress/confirmAddress/1', content: 'href="/hdc/send/1'}
        ];

        testFormPageGets(app, routes);
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
