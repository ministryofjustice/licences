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

describe('send', () => {

    let prisonerService;
    let licenceService;

    beforeEach(() => {
        prisonerService = createPrisonerServiceStub();
        licenceService = createLicenceServiceStub();

        prisonerService.getLicence = sinon.stub().resolves({});
        prisonerService.getEstablishmentForPrisoner = sinon.stub().resolves({premise: 'HMP Blah'});
        prisonerService.getComForPrisoner = sinon.stub().resolves({com: 'Something'});

        auditStub.record.reset();
    });

    describe('Get send/:destination/:nomisId', () => {

        it('renders caToRo form when addressReview is destination', () => {
            const app = createApp({licenceService, prisonerService});
            return request(app)
                .get('/addressReview/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToRo">');
                });
        });

        it('renders roToCa form when finalChecks is destination', () => {
            const app = createApp({licenceService, prisonerService});
            return request(app)
                .get('/finalChecks/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input type="hidden" name="transitionType" value="roToCa">');
                });
        });

        it('renders caToDm form when approval is destination', () => {
            const app = createApp({licenceService, prisonerService});
            return request(app)
                .get('/approval/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToDm">');
                });
        });

        it('renders dmToCa form when decided is destination', () => {
            const app = createApp({licenceService, prisonerService});
            return request(app)
                .get('/decided/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input type="hidden" name="transitionType" value="dmToCa">');
                });
        });

        it('renders caToDmRefusal form when refusal is destination', () => {
            const app = createApp({licenceService, prisonerService});
            return request(app)
                .get('/refusal/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToDmRefusal">');
                });
        });

        it('renders dmToCaReturn form when return is destination', () => {
            const app = createApp({licenceService, prisonerService});
            return request(app)
                .get('/return/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input type="hidden" name="transitionType" value="dmToCaReturn">');
                });
        });

        it('gets a submission target for caToRo', () => {
            const app = createApp({licenceService, prisonerService});
            return request(app)
                .get('/addressReview/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('name="submissionTarget" value="Something"');
                });
        });

        it('gets a submission target for roToCa', () => {
            const app = createApp({licenceService, prisonerService});
            return request(app)
                .get('/finalChecks/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('name="submissionTarget" value="HMP Blah"');
                });
        });
    });

    describe('POST /send', () => {
        it('calls markForHandover via licenceService', () => {
            const app = createApp({licenceService, prisonerService});

            return request(app)
                .post('/')
                .send({nomisId: 123, sender: 'from', receiver: 'to', transitionType: 'caToRo'})
                .expect(() => {
                    expect(licenceService.markForHandover).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledWith(
                        123, 'from', 'to', {licence: {key: 'value'}}, 'caToRo'
                    );
                });

        });

        it('audits the send event', () => {
            const app = createApp({licenceService, prisonerService});

            return request(app)
                .post('/')
                .send({
                    nomisId: 123,
                    sender: 'from',
                    receiver: 'to',
                    transitionType: 'type',
                    submissionTarget: 'target'
                })
                .expect(() => {
                    expect(auditStub.record).to.be.calledOnce();
                    expect(auditStub.record).to.be.calledWith('SEND', 'my-staff-id',
                        {
                            nomisId: 123,
                            receiver: 'to',
                            sender: 'from',
                            transitionType: 'type',
                            submissionTarget: 'target'
                        });
                });

        });

        it('shows sent confirmation', () => {
            const app = createApp({licenceService, prisonerService});

            return request(app)
                .post('/')
                .send({nomisId: 123, sender: 'from', receiver: 'to', transitionType: 'foobar'})
                .expect(302)
                .expect(res => {
                    expect(res.header['location']).to.eql('/hdc/sent/foobar');
                });

        });
    });
});

const caUser = {
    staffId: 'my-staff-id',
    username: 'my-username',
    email: 'user@email',
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
