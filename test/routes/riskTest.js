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

describe('/hdc/risk', () => {

    describe('risk routes', () => {
        const routes = [
            {url: '/risk/riskManagement/1', content: 'Risk management and victim liaison'}
        ];

        testFormPageGets(app, routes);
    });


    describe('POST /risk/:formName/:nomisId', () => {
        context('When page contains form fields', () => {
            it('calls updateLicence from licenceService', () => {

                const formResponse = {
                    nomisId: '1',
                    planningActions: 'Yes',
                    planningActionsDetails: 'details'
                };

                return request(app)
                    .post('/risk/riskManagement/1')
                    .send(formResponse)
                    .expect(302)
                    .expect(res => {
                        expect(licenceServiceStub.update).to.be.calledOnce();
                        expect(licenceServiceStub.update).to.be.calledWith({
                            licence: {key: 'value'},
                            nomisId: '1',
                            fieldMap: formConfig.riskManagement.fields,
                            userInput: formResponse,
                            licenceSection: 'risk',
                            formName: 'riskManagement'
                        });
                    });
            });
        });
    });
});
