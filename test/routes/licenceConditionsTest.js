const {
    request,
    expect,
    licenceServiceStub,
    conditionsServiceStub,
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

describe('/hdc/licenceConditions', () => {

    beforeEach(() => {
        conditionsServiceStub.getStandardConditions.resolves([{text: 'Not commit any offence'}]);
        conditionsServiceStub.getAdditionalConditions.resolves({
            base: {
                base: [{text: 'hi', id: 'ho', user_input: {}}]
            }
        });
        conditionsServiceStub.populateLicenceWithConditions.resolves({licence: {}});
    });

    describe('licenceConditions routes', () => {
        const routes = [
            {url: '/licenceConditions/standard/1', content: 'Not commit any offence'},
            {url: '/licenceConditions/additionalConditions/1', content: 'Additional conditions</h1>'},
            {url: '/licenceConditions/conditionsSummary/1', content: 'Add additional condition'},
            {url: '/reporting/reportingInstructions/1', content: 'Reporting instructions'}
        ];

        testFormPageGets(app, routes);
    });

    describe('POST /hdc/licenceConditions/:section/:nomisId', () => {
        const routes = [
            {
                url: '/licenceConditions/standard/1',
                body: {additionalConditionsRequired: 'Yes', nomisId: 1},
                nextPath: '/hdc/licenceConditions/additionalConditions/1',
                formName: 'standard'
            },
            {
                url: '/licenceConditions/standard/1',
                body: {additionalConditionsRequired: 'No', nomisId: 1},
                nextPath: '/hdc/taskList/1',
                formName: 'standard'
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
                            fieldMap: formConfig[route.formName].fields,
                            userInput: route.body,
                            licenceSection: 'licenceConditions',
                            formName: route.formName
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });
        });
    });

    describe('POST /additionalConditions/:nomisId/delete/:conditionId', () => {

        const formResponse = {
            nomisId: '123',
            conditionId: 'ABC'
        };

        it('calls licence service delete and returns to cummary page', () => {

            return request(app)
                .post('/licenceConditions/additionalConditions/1/delete/ABC')
                .send(formResponse)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.deleteLicenceCondition).to.be.calledWith('123', 'ABC');
                    expect(res.header.location).to.equal('/hdc/licenceConditions/conditionsSummary/123');
                });

        });
    });

    describe('GET /additionalConditions/conditionsSummary:nomisId', () => {
        it('should validate the conditions', () => {
            licenceServiceStub.getConditionsErrors.returns({error: 'object'});

            return request(app)
                .get('/licenceConditions/conditionsSummary/1')
                .expect(200)
                .expect(res => {
                    expect(licenceServiceStub.getConditionsErrors).to.be.calledWith({key: 'value'});
                    expect(conditionsServiceStub.populateLicenceWithConditions).to.be.calledWith(
                        {key: 'value'}, {error: 'object'});
                });

        });
    });
});
