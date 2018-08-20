const request = require('supertest');

const {
    createLicenceServiceStub,
    createApp,
    formConfig,
    testFormPageGets
} = require('../supertestSetup');

describe('/hdc/risk', () => {
    describe('risk routes', () => {
        const routes = [
            {url: '/hdc/risk/riskManagement/1', content: 'Risk management and victim liaison'}
        ];
        const licenceService = createLicenceServiceStub();
        const app = createApp({licenceService}, 'roUser');

        testFormPageGets(app, routes, licenceService);
    });


    describe('POST /risk/:formName/:bookingId', () => {

        const formResponse = {
            bookingId: '1',
            planningActions: 'Yes',
            planningActionsDetails: 'details'
        };

        context('When page contains form fields', () => {
            it('calls updateLicence from licenceService', () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceService}, 'roUser');
                return request(app)
                    .post('/hdc/risk/riskManagement/1')
                    .send(formResponse)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            bookingId: '1',
                            config: formConfig.riskManagement,
                            userInput: formResponse,
                            licenceSection: 'risk',
                            formName: 'riskManagement'
                        });
                    });
            });

            it('calls updateLicence from licenceService when ca in post approval', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence.resolves({stage: 'DECIDED', licence: {key: 'value'}});
                const app = createApp({licenceService}, 'caUser');
                return request(app)
                    .post('/hdc/risk/riskManagement/1')
                    .send(formResponse)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            bookingId: '1',
                            config: formConfig.riskManagement,
                            userInput: formResponse,
                            licenceSection: 'risk',
                            formName: 'riskManagement'
                        });
                    });
            });

            it('throws when ca not in post approval', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence.resolves({stage: 'ELIGIBILITY', licence: {key: 'value'}});
                const app = createApp({licenceService}, 'caUser');
                return request(app)
                    .post('/hdc/risk/riskManagement/1')
                    .send(formResponse)
                    .expect(403);

            });
        });
    });
});
