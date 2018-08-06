const request = require('supertest');

const {
    createLicenceServiceStub,
    createApp,
    formConfig,
    testFormPageGets
} = require('../supertestSetup');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'CA'
};

describe('/hdc/risk', () => {
    describe('risk routes', () => {
        const routes = [
            {url: '/risk/riskManagement/1', content: 'Risk management and victim liaison'}
        ];
        const licenceService = createLicenceServiceStub();
        const app = createApp({licenceService}, testUser);

        testFormPageGets(app, routes, licenceService);
    });


    describe('POST /risk/:formName/:nomisId', () => {
        context('When page contains form fields', () => {
            it('calls updateLicence from licenceService', () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceService}, testUser);

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
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            nomisId: '1',
                            config: formConfig.riskManagement,
                            userInput: formResponse,
                            licenceSection: 'risk',
                            formName: 'riskManagement'
                        });
                    });
            });
        });
    });
});
