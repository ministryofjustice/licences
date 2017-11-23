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
    getLicence: sandbox.stub().returnsPromise().resolves({licence: {}}),
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

    it('renders discharge address page if licence exists', () => {

        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(res.text).to.contain('Planned discharge address</h1\>');
            });
    });

    it('doesnt pre-populates input if it doesnt exist on licence', () => {

        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(res.text).to.contain(
                    'name="address1" type="text">');
                expect(res.text).to.not.contain(
                    'name="address1" type="text" value="sbc">');
            });
    });

    it('pre-populates input if it exists on licence', () => {

        licenceServiceStub.getLicence.resolves({licence: {dischargeAddress: {address1: 'sbc'}}});

        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(res.text).to.contain(
                    'name="address1" type="text" value="sbc">');
            });
    });

    it('redirects to details page if no licence exits', () => {

        licenceServiceStub.getLicence.resolves(null);

        return request(app)
            .get('/1')
            .expect(302)
            .expect(res => {
                expect(res.header['location']).to.include('/details/');
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
