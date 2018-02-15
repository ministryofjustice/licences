const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createLicenceConditionsRoute = require('../../server/routes/hdc');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;
const formConfig = require('../../server/routes/config/licenceConditions');

const loggerStub = {
    debug: sandbox.stub()
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves({licence: {key: 'value'}}),
    update: sandbox.stub().returnsPromise().resolves(),
    updateLicenceConditions: sandbox.stub().returnsPromise().resolves()
};

const conditionsServiceStub = {
    getStandardConditions: sandbox.stub().returnsPromise().resolves([{TEXT: {value: 'Not commit any offence'}}]),
    getAdditionalConditions: sandbox.stub().returnsPromise().resolves({
        base: {
            base: [{TEXT: {value: 'hi'}, ID: {value: 'ho'}, USER_INPUT: {}}]
        }
    }),
    validateConditionInputs: sandbox.stub().returnsPromise().resolves({validates: true}),
    getAdditionalConditionsWithErrors: sandbox.stub().returnsPromise().resolves({})
};

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'CA'
};

const app = appSetup(createLicenceConditionsRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    conditionsService: conditionsServiceStub,
    authenticationMiddleware
}), testUser);

describe('/hdc/licenceConditions', () => {

    afterEach(() => {
        sandbox.reset();
    });
    describe('routes', () => {
        const routes = [
            {url: '/licenceConditions/standard/1', content: 'Not commit any offence'},
            {url: '/licenceConditions/additionalConditions/1', content: 'Additional conditions</h1>'},
            {url: '/licenceConditions/conditionsSummary/1', content: 'Add another condition'},
            {url: '/reporting/reportingInstructions/1', content: 'Reporting instructions'}
        ];

        routes.forEach(route => {
            it(`renders the ${route.url} page`, () => {
                return request(app)
                    .get(route.url)
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.contain(route.content);
                    });
            });
        });
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
                nextPath: '/hdc/risk/riskManagement/1',
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


    describe('POST /additionalConditions/:nomisId', () => {

        const formResponse = {
            nomisId: '123',
            additionalConditions: ['mentalHealthName'],
            mentalHealthName: 'response',
            bespokeConditions: [{text: '', approved: ''}]
        };


        it('renders conditions page if it does not validate', () => {
            conditionsServiceStub.validateConditionInputs.resolves({validates: false});

            return request(app)
                .post('/licenceConditions/additionalConditions/1')
                .send(formResponse)
                .expect(200)
                .expect(res => {
                    expect(res.text).to.include('Additional conditions</h1>');
                });

        });

        it('renders an error message if it does not validate', () => {
            conditionsServiceStub.validateConditionInputs.resolves({validates: false});

            return request(app)
                .post('/licenceConditions/additionalConditions/1')
                .send(formResponse)
                .expect(200)
                .expect(res => {
                    expect(res.text).to.include('id="submissionError"');
                });

        });

        it('renders an error message on the condition if it is missing an input', () => {
            conditionsServiceStub.validateConditionInputs.resolves({validates: false});
            conditionsServiceStub.getAdditionalConditionsWithErrors.resolves({base: {base: [
                {
                    ID: {value: 'b'},
                    TEXT: {value: 'v'},
                    USER_INPUT: {value: 'appointmentDetails'},
                    GROUP_NAME: {value: 'g1'},
                    SUBGROUP_NAME: {value: 's1'},
                    FIELD_POSITION: {value: {address3: '0', address4: '1'}},
                    SELECTED: true,
                    USER_SUBMISSION: {address3: 'Birmingham'},
                    ERRORS: ['MISSING_INPUT']
                }
            ]}});


            return request(app)
                .post('/licenceConditions/additionalConditions/1')
                .send(formResponse)
                .expect(200)
                .expect(res => {
                    expect(res.text).to.include('missing-b');
                });
        });

        it('updates with empty objects if nothing returned', () => {

            const formResponse2 = {
                nomisId: '123',
                additionalConditions: undefined,
                bespokeConditions: [{text: '', approved: ''}]
            };

            conditionsServiceStub.validateConditionInputs.resolves({validates: false});

            return request(app)
                .post('/licenceConditions/additionalConditions/1')
                .send(formResponse2)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.updateLicenceConditions).to.be.calledWith('123', {}, []);
                });

        });

        it('updates with bespoke objects if no additional conditions', () => {

            const formResponse2 = {
                nomisId: '123',
                additionalConditions: undefined,
                bespokeConditions: [{text: 'bespoke', approved: ''}]
            };

            conditionsServiceStub.validateConditionInputs.resolves({validates: false});

            return request(app)
                .post('/licenceConditions/additionalConditions/1')
                .send(formResponse2)
                .expect(302)
                .expect(res => {
                    expect(licenceServiceStub.updateLicenceConditions).to.be.calledWith(
                        '123', {}, [{text: 'bespoke', approved: ''}]
                    );
                });

        });
    });
});
