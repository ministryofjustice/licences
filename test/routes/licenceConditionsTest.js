const request = require('supertest');

const {
    createLicenceServiceStub,
    createConditionsServiceStub,
    createApp,
    formConfig,
    testFormPageGets
} = require('../supertestSetup');

describe('/hdc/licenceConditions', () => {
    let conditionsService;

    beforeEach(() => {
        conditionsService = createConditionsServiceStub();
        conditionsService.getStandardConditions = sinon.stub().resolves([{text: 'Not commit any offence'}]);
        conditionsService.getAdditionalConditions = sinon.stub().resolves({
            base: {
                base: [{text: 'hi', id: 'ho', user_input: {}}]
            }
        });
        conditionsService.populateLicenceWithConditions = sinon.stub().resolves({licence: {}});
    });

    describe('licenceConditions routes', () => {
        const licenceService = createLicenceServiceStub();
        const conditionsServiceStub = createConditionsServiceStub();
        conditionsServiceStub.getStandardConditions = sinon.stub().resolves([{text: 'Not commit any offence'}]);
        conditionsServiceStub.getAdditionalConditions = sinon.stub().resolves({
            base: {
                base: [{text: 'hi', id: 'ho', user_input: {}}]
            }
        });

        conditionsServiceStub.populateLicenceWithConditions = sinon.stub().resolves({licence: {}});
        const app = createApp({licenceService, conditionsService: conditionsServiceStub}, 'roUser');
        const routes = [
            {url: '/hdc/licenceConditions/standard/1', content: 'Not commit any offence'},
            {url: '/hdc/licenceConditions/additionalConditions/1', content: 'Select additional conditions</h1>'},
            {url: '/hdc/licenceConditions/conditionsSummary/1', content: 'Add additional condition'},
            {url: '/hdc/reporting/reportingInstructions/1', content: 'Reporting instructions'}
        ];

        testFormPageGets(app, routes, licenceService);
    });

    describe('POST /hdc/licenceConditions/:section/:bookingId', () => {
        const routes = [
            {
                url: '/licenceConditions/standard/1',
                body: {additionalConditionsRequired: 'Yes', bookingId: 1},
                nextPath: '/hdc/licenceConditions/additionalConditions/1',
                formName: 'standard'
            },
            {
                url: '/licenceConditions/standard/1',
                body: {additionalConditionsRequired: 'No', bookingId: 1},
                nextPath: '/hdc/taskList/1',
                formName: 'standard'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceService, conditionsService}, 'roUser');

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            bookingId: '1',
                            config: formConfig[route.formName],
                            userInput: route.body,
                            licenceSection: 'licenceConditions',
                            formName: route.formName
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });

            it(`renders the correct path '${route.nextPath}' page when ca in post approval`, () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence.resolves({stage: 'DECIDED', licence: {key: 'value'}});
                const app = createApp({licenceService, conditionsService}, 'caUser');

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            nomisId: '1',
                            config: formConfig[route.formName],
                            userInput: route.body,
                            licenceSection: 'licenceConditions',
                            formName: route.formName
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });

            it(`throws when posting to '${route.nextPath}' when ca in non-post approval`, () => {

                const licenceService = createLicenceServiceStub();
                licenceService.getLicence.resolves({stage: 'PROCESSING_RO', licence: {key: 'value'}});
                const app = createApp({licenceService, conditionsService}, 'caUser');

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(403);

            });
        });
    });

    describe('POST /additionalConditions/:bookingId/delete/:conditionId', () => {

        const formResponse = {
            bookingId: '123',
            conditionId: 'ABC'
        };

        it('calls licence service delete and returns to summary page', () => {
            const licenceService = createLicenceServiceStub();
            const app = createApp({licenceService, conditionsService}, 'roUser');

            return request(app)
                .post('/hdc/licenceConditions/additionalConditions/1/delete/ABC')
                .send(formResponse)
                .expect(302)
                .expect(res => {
                    expect(licenceService.deleteLicenceCondition).to.be.calledWith('123', 'ABC');
                    expect(res.header.location).to.equal('/hdc/licenceConditions/conditionsSummary/123');
                });

        });
    });

    describe('GET /additionalConditions/conditionsSummary:bookingId', () => {
        it('should validate the conditions', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getConditionsErrors = sinon.stub().returns({error: 'object'});
            const app = createApp({licenceService, conditionsService}, 'roUser');

            return request(app)
                .get('/hdc/licenceConditions/conditionsSummary/1')
                .expect(200)
                .expect(res => {
                    expect(licenceService.getConditionsErrors).to.be.calledWith({key: 'value'});
                    expect(conditionsService.populateLicenceWithConditions).to.be.calledWith(
                        {key: 'value'}, {error: 'object'});
                });

        });
    });
});
