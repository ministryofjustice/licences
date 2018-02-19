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

describe('/hdc/risk', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('routes', () => {
        const pages = [
            {route: '/risk/riskManagement/1', content: 'Risk management and victim liaison'}
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
