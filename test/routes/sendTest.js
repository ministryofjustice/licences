const request = require('supertest');

const {
    loggerStub,
    createLicenceServiceStub,
    createPrisonerServiceStub,
    authenticationMiddleware,
    appSetup,
    auditStub
} = require('../supertestSetup');

const createSendRoute = require('../../server/routes/send');


describe('Send:', () => {
    let prisonerService;
    let licenceService;

    beforeEach(() => {
        prisonerService = createPrisonerServiceStub();
        licenceService = createLicenceServiceStub();

        prisonerService.getLicence = sinon.stub().resolves({});
        prisonerService.getEstablishmentForPrisoner = sinon.stub().resolves({premise: 'HMP Blah'});
        prisonerService.getComForPrisoner = sinon.stub().resolves({com: 'Something'});
    });

    describe('When role is CA', () => {
        describe('GET /send', () => {
            it('renders and HTML output', () => {
                const app = createApp({licenceService, prisonerService});
                return request(app)
                    .get('/123')
                    .expect(200)
                    .expect('Content-Type', /html/);
            });

            it('gets com details when submission is CA to RO', () => {
                licenceService.getLicence.resolves({stage: 'ELIGIBILITY'});
                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/123')
                    .expect(() => {
                        expect(prisonerService.getComForPrisoner).to.be.calledOnce();
                        expect(prisonerService.getComForPrisoner).to.be.calledWith('123', 'my-username');
                    });
                expect(prisonerService.getEstablishmentForPrisoner).not.to.be.called();
            });
        });

        describe('POST /send', () => {
            it('calls markForHandover via licenceService', () => {
                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .post('/123')
                    .send({nomisId: 123, sender: 'from', receiver: 'to'})
                    .expect(() => {
                        expect(licenceService.markForHandover).to.be.calledOnce();
                        expect(licenceService.markForHandover).to.be.calledWith(123, 'from', 'to');
                    });

            });

            it('shows sent confirmation', () => {
                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .post('/123')
                    .send({nomisId: 123, sender: 'from', receiver: 'to', transitionType: 'foobar'})
                    .expect(302)
                    .expect(res => {
                        expect(res.header['location']).to.eql('/hdc/sent/foobar');
                    });

            });
        });

    });

    describe('When role is RO', () => {
        const roUser = {
            staffId: 'my-staff-id',
            username: 'my-username',
            role: 'RO'
        };

        it('gets establishment details when submission is RO to CA', () => {
            licenceService.getLicence.resolves({stage: 'PROCESSING_RO'});

            const app = createApp({licenceService, prisonerService}, roUser);

            return request(app)
                .get('/123')
                .expect(() => {
                    expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce();
                    expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith('123', 'my-username');
                    expect(prisonerService.getComForPrisoner).not.to.be.called();
                });
        });
    });
});


const caUser = {
    staffId: 'my-staff-id',
    username: 'my-username',
    role: 'CA'
};

function createApp({licenceService, prisonerService}, user = caUser) {
    return appSetup(createSendRoute({
        licenceService,
        prisonerService,
        logger: loggerStub,
        authenticationMiddleware,
        audit: auditStub
    }), user);
}
