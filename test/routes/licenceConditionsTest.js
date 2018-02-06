const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createLicenceConditionsRoute = require('../../server/routes/licenceConditions');
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
    roleCode: 'OM'
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

    describe('GET /licenceConditions/standardConditions/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/standardConditions/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders standard conditions page', () => {
            return request(app)
                .get('/standardConditions/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('Not commit any offence');
                });
        });
    });

    describe('GET /licenceConditions/riskManagement/:nomisId', () => {
        it('renders out out page', () => {
            return request(app)
                .get('/riskManagement/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('Risk management and victim liaison');
                });
        });
    });


    describe('GET /licenceConditions/curfewAddressReview/:nomisId', () => {
        it('renders curfew address page', () => {
            return request(app)
                .get('/curfewAddressReview/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('Proposed curfew address');
                });
        });
    });

    describe('POST /additionalConditions/:nomisId', () => {

        const formResponse = {
            nomisId: '123',
            additionalConditions: ['mentalHealthName'],
            mentalHealthName: 'response'
        };

        it('redirects to review page if no validation errors', () => {
            return request(app)
                .post('/additionalConditions/1')
                .send(formResponse)
                .expect(302)
                .expect(res => {
                    expect(res.header['location']).to.include('/hdc/licenceConditions/conditionsReview/123');
                });

        });

        it('renders conditions page if it does not validate', () => {
            conditionsServiceStub.validateConditionInputs.resolves({validates: false});

            return request(app)
                .post('/additionalConditions/1')
                .send(formResponse)
                .expect(200)
                .expect(res => {
                    expect(res.text).to.include('Additional conditions</h1>');
                });

        });

        it('renders an error message if it does not validate', () => {
            conditionsServiceStub.validateConditionInputs.resolves({validates: false});

            return request(app)
                .post('/additionalConditions/1')
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
                .post('/additionalConditions/1')
                .send(formResponse)
                .expect(200)
                .expect(res => {
                    expect(res.text).to.include('missing-b');
                });

        });
    });

    describe('GET /licenceConditions/conditionsReview/:nomisId', () => {

        it('returns html', () => {
            return request(app)
                .get('/conditionsReview/1')
                .expect(200)
                .expect('Content-Type', /html/);
        });

        it('renders risk conditions review page', () => {
            return request(app)
                .get('/conditionsReview/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('Additional conditions');
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
                    .post('/riskManagement/1')
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
});
