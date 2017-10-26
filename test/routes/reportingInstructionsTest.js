const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createReportingInstructionRoute = require('../../server/routes/reportingInstructions');

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves([{}]),
    updateAddress: sandbox.stub().returnsPromise().resolves(),
    updateReportingInstructions: sandbox.stub().returnsPromise().resolves()
};

const loggerStub = {
    debug: sandbox.stub()
};

const app = appSetup(createReportingInstructionRoute({licenceService: licenceServiceStub, logger: loggerStub}));

describe('GET /reporting/:prisonNumber', () => {
    it('load html', () => {
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/);
    });
});

describe('POST /dischargeAddress/:prisonNumber', () => {
    afterEach(() => {
        sandbox.reset();
    });

    const formResponse = {
        address1: '123',
        address2: '456',
        postCode: 'pc',
        time: '15:33',
        date: '23 October'
    };

    it('calls updateReportingInstructions from licenceService and redirects to licence details', () => {
        return request(app)
            .post('/1')
            .send(formResponse)
            .expect(302)
            .expect(res => {
                expect(licenceServiceStub.updateReportingInstructions).to.be.calledOnce();
                expect(licenceServiceStub.updateReportingInstructions).to.be.calledWith(formResponse);
                expect(res.header['location']).to.include('/licenceDetails');
            });

    });

    it('does redirects to prisoner details if no licence exists', () => {
        licenceServiceStub.getLicence.resolves([]);
        return request(app)
            .post('/1')
            .send(formResponse)
            .expect(302)
            .expect(res => {
                expect(licenceServiceStub.updateReportingInstructions).to.not.be.called();
                expect(res.header['location']).to.include('/details/');
            });

    });
});
