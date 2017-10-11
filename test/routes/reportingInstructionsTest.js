const {
    request,
    sinon,
    expect,
    appSetup
} = require('../supertestSetup');

const createReportingInstructionRoute = require('../../server/routes/reportingInstructions');

const serviceStub = {
    getExistingInputs: sinon.stub()
};

const app = appSetup(createReportingInstructionRoute({reportingInstructionService: serviceStub}));

describe('GET /reporting/:prisonNumber', () => {
    it('getExistingInputs from reportingInstructionsService', () => {
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(serviceStub.getExistingInputs.callCount).to.equal(1);
            });

    });
});
