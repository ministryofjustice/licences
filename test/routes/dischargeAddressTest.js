const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createDischargeAddressRoute = require('../../server/routes/dischargeAddress');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;

const loggerStub = {
    debug: sandbox.stub()
};

const serviceStub = {
    getDischargeAddress: sandbox.stub().returnsPromise().resolves([{}])
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves([{}]),
    updateAddress: sandbox.stub().returnsPromise().resolves()
};

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token'
};

const app = appSetup(createDischargeAddressRoute({
    dischargeAddressService: serviceStub,
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware}), testUser);

describe('GET /dischargeAddress/:prisonNumber', () => {

    afterEach(() => {
        sandbox.reset();
    });

    it('calls getLicence from licenceService', () => {
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(licenceServiceStub.getLicence).to.be.calledOnce();
                expect(licenceServiceStub.getLicence).to.be.calledWith('1');
            });

    });

    it.skip('calls getDischargeAddress from dischargeAddressService if a licence is returned', () => {
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(serviceStub.getDischargeAddress).to.be.calledOnce();
                expect(serviceStub.getDischargeAddress).to.be.calledWith('1', 'my-token');
            });

    });

    it.skip('does not call getDischargeAddress from dischargeAddressService if a licence is not returned', () => {
        licenceServiceStub.getLicence.resolves([]);

        return request(app)
            .get('/1')
            .expect(302)
            .expect(res => {
                expect(res.header['location']).to.include('/details/1');
                expect(serviceStub.getDischargeAddress).to.not.be.called();
            });

    });

});

describe('POST /dischargeAddress/:prisonNumber', () => {

    const formResponse = {
        nomisId: '123',
        address1: 'add1',
        address2: 'add2',
        postCode: 'pc'
    };

    it('calls updateAddress from licenceService', () => {
        return request(app)
            .post('/1')
            .send(formResponse)
            .expect(() => {
                expect(licenceServiceStub.updateAddress).to.be.calledOnce();
                expect(licenceServiceStub.updateAddress).to.be.calledWith(formResponse);
            });

    });

    it('redirects to additional conditions', () => {
        return request(app)
            .post('/1')
            .expect(302)
            .expect(res => {
                expect(res.header['location']).to.include('/additionalConditions');
            });

    });
});
