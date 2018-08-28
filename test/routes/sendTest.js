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
        prisonerService.getCom = sinon.stub().resolves({com: 'Something'});

        auditStub.record.reset();
    });

    describe('Get send/:destination/:bookingId', () => {

        it('renders caToRo form when addressReview is destination', () => {
            const app = createApp({licenceService, prisonerService}, 'caUser');
            return request(app)
                .get('/hdc/send/addressReview/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToRo">');
                });
        });

        it('renders roToCa form when finalChecks is destination', () => {
            const app = createApp({licenceService, prisonerService}, 'roUser');
            return request(app)
                .get('/hdc/send/finalChecks/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input type="hidden" name="transitionType" value="roToCa">');
                });
        });

        it('renders caToDm form when approval is destination', () => {
            const app = createApp({licenceService, prisonerService}, 'caUser');
            return request(app)
                .get('/hdc/send/approval/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToDm">');
                });
        });

        it('renders dmToCa form when decided is destination', () => {
            const app = createApp({licenceService, prisonerService}, 'dmUser');
            return request(app)
                .get('/hdc/send/decided/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input type="hidden" name="transitionType" value="dmToCa">');
                });
        });

        it('renders caToDmRefusal form when refusal is destination', () => {
            const app = createApp({licenceService, prisonerService}, 'caUser');
            return request(app)
                .get('/hdc/send/refusal/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToDmRefusal">');
                });
        });

        it('renders dmToCaReturn form when return is destination', () => {
            const app = createApp({licenceService, prisonerService}, 'dmUser');
            return request(app)
                .get('/hdc/send/return/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input type="hidden" name="transitionType" value="dmToCaReturn">');
                });
        });

        it('gets a submission target for caToRo', () => {
            const app = createApp({licenceService, prisonerService}, 'caUser');
            return request(app)
                .get('/hdc/send/addressReview/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('name="submissionTarget" value="Something"');
                });
        });

        it('gets a submission target for roToCa', () => {
            const app = createApp({licenceService, prisonerService}, 'roUser');
            return request(app)
                .get('/hdc/send/finalChecks/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('name="submissionTarget" value="HMP Blah"');
                });
        });

        it('should throw if get requested by wrong user', () => {

            const app = createApp({licenceService, prisonerService}, 'roUser');
            return request(app)
                .get('/hdc/send/refusal/123')
                .expect(403);

        });
    });

    describe('POST send/:destination/:bookingId', () => {

        it('calls markForHandover via licenceService for addressReview', () => {
            const app = createApp({licenceService, prisonerService});

            return request(app)
                .post('/hdc/send/addressReview/123')
                .send({bookingId: 123, transitionType: 'caToRo'})
                .expect(() => {
                    expect(licenceService.markForHandover).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledWith(
                        123, {licence: {key: 'value'}}, 'caToRo'
                    );
                });
        });

        it('calls markForHandover via licenceService for finalChecks', () => {
            const app = createApp({licenceService, prisonerService}, 'roUser');

            return request(app)
                .post('/hdc/send/finalChecks/123')
                .send({bookingId: 123, transitionType: 'roToCa'})
                .expect(() => {
                    expect(licenceService.markForHandover).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledWith(
                        123, {licence: {key: 'value'}}, 'roToCa'
                    );
                });
        });

        it('calls markForHandover via licenceService for approval', () => {
            const app = createApp({licenceService, prisonerService}, 'caUser');

            return request(app)
                .post('/hdc/send/approval/123')
                .send({bookingId: 123, transitionType: 'caToDm'})
                .expect(() => {
                    expect(licenceService.markForHandover).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledWith(
                        123, {licence: {key: 'value'}}, 'caToDm'
                    );
                });
        });

        it('calls markForHandover via licenceService for decided', () => {
            const app = createApp({licenceService, prisonerService}, 'dmUser');

            return request(app)
                .post('/hdc/send/decided/123')
                .send({bookingId: 123, transitionType: 'dmToCa'})
                .expect(() => {
                    expect(licenceService.markForHandover).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledWith(
                        123, {licence: {key: 'value'}}, 'dmToCa'
                    );
                });
        });

        it('calls markForHandover via licenceService for refusal', () => {
            const app = createApp({licenceService, prisonerService}, 'caUser');

            return request(app)
                .post('/hdc/send/refusal/123')
                .send({bookingId: 123, transitionType: 'caToDmRefusal'})
                .expect(() => {
                    expect(licenceService.markForHandover).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledWith(
                        123, {licence: {key: 'value'}}, 'caToDmRefusal'
                    );
                });
        });

        it('calls markForHandover via licenceService for return', () => {
            const app = createApp({licenceService, prisonerService}, 'dmUser');

            return request(app)
                .post('/hdc/send/return/123')
                .send({bookingId: 123, transitionType: 'dmToCaReturn'})
                .expect(() => {
                    expect(licenceService.markForHandover).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledWith(
                        123, {licence: {key: 'value'}}, 'dmToCaReturn'
                    );
                });
        });


        it('audits the send event', () => {
            const app = createApp({licenceService, prisonerService}, 'dmUser');

            return request(app)
                .post('/hdc/send/return/123')
                .send({
                    bookingId: '123',
                    transitionType: 'type',
                    submissionTarget: 'target'
                })
                .expect(() => {
                    expect(auditStub.record).to.be.calledOnce();
                    expect(auditStub.record).to.be.calledWith('SEND', 'id',
                        {
                            action: [],
                            bookingId: '123',
                            sectionName: 'return',
                            formName: undefined,
                            userInput: {
                                transitionType: 'type',
                                submissionTarget: 'target'
                            }
                        });
                });
        });

        it('shows sent confirmation', () => {
            const app = createApp({licenceService, prisonerService}, 'dmUser');

            return request(app)
                .post('/hdc/send/return/123')
                .send({bookingId: 123, sender: 'from', receiver: 'to', transitionType: 'foobar'})
                .expect(302)
                .expect(res => {
                    expect(res.header['location']).to.eql('/hdc/sent/foobar');
                });

        });

        it('should throw if post requested by wrong user', () => {

            const app = createApp({licenceService, prisonerService}, 'caUser');

            return request(app)
                .post('/hdc/send/return/123')
                .send({bookingId: 123, sender: 'from', receiver: 'to', transitionType: 'foobar'})
                .expect(403);

        });
    });
});

function createApp({licenceService, prisonerService}, user) {
    return appSetup(createSendRoute({
        licenceService,
        prisonerService,
        logger: loggerStub,
        authenticationMiddleware,
        audit: auditStub
    }), user, '/hdc/send/');
}
