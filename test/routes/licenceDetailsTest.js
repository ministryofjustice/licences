const {
    request,
    sinon,
    expect,
    appSetup
} = require('../supertestSetup');

const createLicenceDetailsRoute = require('../../server/routes/licenceDetails');

const loggerStub = {
    debug: sinon.stub()
};
const serviceStub = {
    getLicence: sinon.stub()
};

const app = appSetup(createLicenceDetailsRoute({licenceService: serviceStub, logger: loggerStub}));

describe('GET /licenceDetails/:prisonNumber', () => {
    it('calls getLicenceDetails from licenceDetailsService', () => {
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(serviceStub.getLicence.callCount).to.equal(1);
            });

    });
});

