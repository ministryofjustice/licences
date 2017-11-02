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
    getAdditionalConditions: sandbox.stub().returnsPromise().resolves([
        {
            TEXT: {value: 'hi'},
            ID: {value: 'ho'},
            USER_INPUT: {}
        }
    ])
};

const app = appSetup(createAdditionalConditionsRoute({logger: loggerStub, conditionsService: conditionsServiceStub}));

describe('GET /additionalConditions/:prisonNumber', () => {
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
