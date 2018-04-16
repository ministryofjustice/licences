const {
    request,
    expect,
    licenceServiceStub,
    loggerStub,
    authenticationMiddleware,
    appSetup
} = require('../supertestSetup');

const createSendRoute = require('../../server/routes/sent');

const app = appSetup(createSendRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    authenticationMiddleware
}));

describe('GET sent', () => {

    beforeEach(() => {
        licenceServiceStub.getLicence.resolves({stage: 'PROCESSING_RO'});
    });

    it('renders the sent page', () => {
        return request(app)
            .get('/123')
            .expect(200)
            .expect(res => {
                expect(res.text).to.include('Address information submitted');
            });
    });
});

