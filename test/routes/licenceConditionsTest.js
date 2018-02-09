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
        const pages = [
            {route: '/licenceConditions/standardConditions/1', content: 'Not commit any offence'},
            {route: '/licenceConditions/riskManagement/1', content: 'Risk management and victim liaison'},
            {route: '/licenceConditions/curfewAddressReview/1', content: 'Proposed curfew address'},
            {route: '/licenceConditions/additionalConditions/1', content: 'Additional conditions</h1>'},
            {route: '/licenceConditions/conditionsSummary/1', content: 'Add another condition'},
            {route: '/licenceConditions/curfewHours/1', content: 'Curfew hours'}
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


    describe('POST /additionalConditions/:nomisId', () => {

        const formResponse = {
            nomisId: '123',
            additionalConditions: ['mentalHealthName'],
            mentalHealthName: 'response'
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
    });

    describe('POST /licenceConditions/:formName/:nomisId', () => {
        context('When page contains form fields', () => {
            it('calls updateLicence from licenceService', () => {

                const formResponse = {
                    nomisId: '1',
                    planningActions: 'Yes',
                    planningActionsDetails: 'details'
                };

                return request(app)
                    .post('/licenceConditions/riskManagement/1')
                    .send(formResponse)
                    .expect(302)
                    .expect(res => {
                        expect(licenceServiceStub.update).to.be.calledOnce();
                        expect(licenceServiceStub.update).to.be.calledWith({
                            licence: {key: 'value'},
                            nomisId: '1',
                            fieldMap: formConfig.riskManagement.fields,
                            userInput: formResponse,
                            licenceSection: 'licenceConditions',
                            formName: 'riskManagement'
                        });
                    });
            });
        });
    });

    describe('POST /licenceConditions/curfewAddressReview/:nomisId', () => {
        context('When page contains form fields', () => {
            it('calls updateLicence from licenceService', () => {

                const formResponse = {
                    nomisId: '1',
                    consent: 'Yes',
                    deemedSafe: 'No',
                    rejectionDetails: 'Reason'
                };

                return request(app)
                    .post('/licenceConditions/curfewAddressReview/1')
                    .send(formResponse)
                    .expect(302)
                    .expect(res => {
                        expect(licenceServiceStub.update).to.be.calledOnce();
                        expect(licenceServiceStub.update).to.be.calledWith({
                            licence: {key: 'value'},
                            nomisId: '1',
                            fieldMap: formConfig.curfewAddressReview.fields,
                            userInput: formResponse,
                            licenceSection: 'licenceConditions',
                            formName: 'curfewAddressReview'
                        });
                    });
            });
        });
    });
});
