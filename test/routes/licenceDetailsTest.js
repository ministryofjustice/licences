const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createLicenceDetailsRoute = require('../../server/routes/licenceDetails');

const loggerStub = {
    debug: sandbox.stub()
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves([{}])
};

const app = appSetup(createLicenceDetailsRoute({licenceService: licenceServiceStub, logger: loggerStub}));

describe('GET /licenceDetails/:prisonNumber', () => {
    it('calls getLicenceDetails from licenceDetailsService', () => {
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(licenceServiceStub.getLicence.callCount).to.equal(1);
            });

    });
});

