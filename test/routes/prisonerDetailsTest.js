const {
    request,
    sinon,
    expect,
    appSetup
} = require('../supertestSetup');

const createPrisonerDetailsRoute = require('../../server/routes/details');

const loggerStub = {
    debug: sinon.stub()
};
const serviceStub = {
    getPrisonerDetails: sinon.stub()
};

const app = appSetup(createPrisonerDetailsRoute({prisonerDetailsService: serviceStub, logger: loggerStub}));

describe('GET /licenceDetails/:prisonNumber', () => {
    it('calls getLicenceDetails from licenceDetailsService', () => {
        return request(app)
            .get('/123')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(serviceStub.getPrisonerDetails).to.be.calledOnce();
                expect(serviceStub.getPrisonerDetails).to.be.calledWith('123');
            });

    });
});

