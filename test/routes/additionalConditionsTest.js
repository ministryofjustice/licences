const {
    request,
    sinon,
    appSetup
} = require('../supertestSetup');

const createAdditionalConditionsRoute = require('../../server/routes/additionalConditions');

const loggerStub = {
    debug: sinon.stub()
};

const app = appSetup(createAdditionalConditionsRoute({logger: loggerStub}));

describe('GET /additionalConditions/:prisonNumber', () => {
    it('renders and HTML output', () => {
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/);
    });
});
