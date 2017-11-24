const {
    request,
    sandbox,
    appSetup,
    expect
} = require('../supertestSetup');

const createAdditionalConditionsRoute = require('../../server/routes/additionalConditions');

const loggerStub = {
    debug: sandbox.stub()
};

const conditionsServiceStub = {
    getStandardConditions: sandbox.stub().returnsPromise().resolves([{TEXT: {value: 'hi'}}]),
    getAdditionalConditions: sandbox.stub().returnsPromise().resolves({
        base: {
            base: [{TEXT: {value: 'hi'}, ID: {value: 'ho'}, USER_INPUT: {}}]
        }
    }),
    validateConditionInputs: sandbox.stub().returnsPromise().resolves({validates: true}),
    getAdditionalConditionsWithErrors: sandbox.stub().returnsPromise().resolves({})
};

const licenceServiceStub = {
    updateLicenceConditions: sandbox.stub().returnsPromise().resolves(),
    getLicence: sandbox.stub().returnsPromise().resolves(null)
};

const app = appSetup(createAdditionalConditionsRoute({
    logger: loggerStub,
    conditionsService: conditionsServiceStub,
    licenceService: licenceServiceStub
}));

describe('GET /additionalConditions/:prisonNumber', () => {

    afterEach(() => {
        sandbox.reset();
    });

    it('renders and HTML output', () => {
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(conditionsServiceStub.getAdditionalConditions).to.be.calledOnce();
                expect(conditionsServiceStub.getStandardConditions).to.not.be.calledOnce();
            });
    });

    it('passes the licence into getAdditionalConditions if one exists', () => {
        licenceServiceStub.getLicence.resolves({licence: {additionalConditions: {a: '1'}}});
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(conditionsServiceStub.getAdditionalConditions).to.be.calledOnce();
                expect(conditionsServiceStub.getAdditionalConditions).to.be.calledWith(
                    {additionalConditions: {a: '1'}});
            });
    });
});

describe('GET /additionalConditions/standard/:prisonNumber', () => {
    it('renders and HTML output', () => {
        return request(app)
            .get('/standard/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(conditionsServiceStub.getStandardConditions).to.be.calledOnce();
            });

    });
});

describe('POST /additionalConditions/:prisonNumber', () => {

    const formResponse = {
        nomisId: '123',
        additionalConditions: ['mentalHealthName'],
        mentalHealthName: 'response'
    };

    it('redirects to reporting page if no validation errors', () => {
        return request(app)
            .post('/1')
            .send(formResponse)
            .expect(302)
            .expect(res => {
                expect(res.header['location']).to.include('reporting');
            });

    });

    it('renders conditions page if it does not validate', () => {
        conditionsServiceStub.validateConditionInputs.resolves({validates: false});

        return request(app)
            .post('/1')
            .send(formResponse)
            .expect(200)
            .expect(res => {
                expect(res.text).to.include('Additional conditions</h1>');
            });

    });

    it('renders an error message if it does not validate', () => {
        conditionsServiceStub.validateConditionInputs.resolves({validates: false});

        return request(app)
            .post('/1')
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
            .post('/1')
            .send(formResponse)
            .expect(200)
            .expect(res => {
                expect(res.text).to.include('missing-b');
            });

    });
});
