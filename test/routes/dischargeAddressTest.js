const {
    request,
    sinon,
    expect,
    appSetup
} = require('./supertestSetup');

const createDischargeAddressRoute = require('../../server/routes/dischargeAddress');

const loggerStub = {
    debug: sinon.stub()
};

const serviceStub = {
    getDischargeAddress: sinon.stub()
};

const app = appSetup(createDischargeAddressRoute({dischargeAddressService: serviceStub, logger: loggerStub}));

describe('GET /dischargeAddress/:prisonNumber', () => {
    it('calls getDischargeAddress from dischargeAddressService', () => {
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(serviceStub.getDischargeAddress.callCount).to.equal(1);
            });

    });
});

describe('POST /dischargeAddress/:prisonNumber', () => {
    it('redirects to additional conditions', () => {
        return request(app)
            .post('/1')
            .expect(302)
            .expect(res => {
                expect(res.header['location']).to.include('/additionalConditions');
            });

    });
});
