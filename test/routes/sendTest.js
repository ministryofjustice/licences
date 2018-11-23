const request = require('supertest');

const {
    createLicenceServiceStub,
    createPrisonerServiceStub,
    appSetup,
    auditStub
} = require('../supertestSetup');

const standardRouter = require('../../server/routes/routeWorkers/standardRouter');
const createRoute = require('../../server/routes/send');

describe('send', () => {

    let prisonerService;
    let licenceService;

    beforeEach(() => {
        licenceService = createLicenceServiceStub();
        prisonerService = createPrisonerServiceStub();
        prisonerService.getOrganisationContactDetails = sinon.stub().resolves({premise: 'HMP Blah', com: {name: 'Something'}});

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

        it('renders caToRo form when bassReview is destination', () => {
            const app = createApp({licenceService, prisonerService}, 'caUser');
            return request(app)
                .get('/hdc/send/bassReview/123')
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
                .expect(() => {
                    expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce();
                    expect(prisonerService.getOrganisationContactDetails).to.be.calledWith('RO', '123', 'token');
                    expect(licenceService.markForHandover).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledWith(
                        '123', 'caToRo'
                    );
                });
        });

        it('calls markForHandover via licenceService for finalChecks', () => {
            const app = createApp({licenceService, prisonerService}, 'roUser');

            return request(app)
                .post('/hdc/send/finalChecks/123')
                .expect(() => {
                    expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledWith(
                        '123', 'roToCa'
                    );
                });
        });

        it('calls markForHandover via licenceService for approval', () => {
            const app = createApp({licenceService, prisonerService}, 'caUser');

            return request(app)
                .post('/hdc/send/approval/123')
                .expect(() => {
                    expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledWith(
                        '123', 'caToDm'
                    );
                });
        });

        it('calls markForHandover via licenceService for decided', () => {
            const app = createApp({licenceService, prisonerService}, 'dmUser');

            return request(app)
                .post('/hdc/send/decided/123')
                .expect(() => {
                    expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledWith(
                        '123', 'dmToCa'
                    );
                });
        });

        it('does not removeDecision when sending to decided', () => {
            const app = createApp({licenceService, prisonerService}, 'dmUser');

            return request(app)
                .post('/hdc/send/decided/123')
                .expect(() => {
                    expect(licenceService.removeDecision).to.not.be.called();
                });
        });

        it('calls markForHandover via licenceService for refusal', () => {
            const app = createApp({licenceService, prisonerService}, 'caUser');

            return request(app)
                .post('/hdc/send/refusal/123')
                .expect(() => {
                    expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledWith(
                        '123', 'caToDmRefusal'
                    );
                });
        });

        it('calls markForHandover via licenceService for return', () => {
            const app = createApp({licenceService, prisonerService}, 'dmUser');

            return request(app)
                .post('/hdc/send/return/123')
                .expect(() => {
                    expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledOnce();
                    expect(licenceService.markForHandover).to.be.calledWith(
                        '123', 'dmToCaReturn'
                    );
                });
        });

        it('calls removeDecision via licenceService for return', () => {
            const app = createApp({licenceService, prisonerService}, 'dmUser');

            return request(app)
                .post('/hdc/send/return/123')
                .expect(() => {
                    expect(licenceService.removeDecision).to.be.calledOnce();
                    expect(licenceService.removeDecision).to.be.calledWith(
                        '123', {licence: {key: 'value'}}
                    );
                });
        });


        it('audits the send event', () => {
            const app = createApp({licenceService, prisonerService}, 'dmUser');

            return request(app)
                .post('/hdc/send/return/123')
                .expect(() => {
                    expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce();
                    expect(auditStub.record).to.be.calledOnce();
                    expect(auditStub.record).to.be.calledWith('SEND', 'id',
                        {
                            bookingId: '123',
                            transitionType: 'dmToCaReturn',
                            submissionTarget: {com: {name: 'Something'}, premise: 'HMP Blah'}
                        });
                });
        });

        it('shows sent confirmation', () => {
            const app = createApp({licenceService, prisonerService}, 'dmUser');

            return request(app)
                .post('/hdc/send/return/123')
                .expect(302)
                .expect(res => {
                    expect(res.header['location']).to.eql('/hdc/sent/CA/dmToCaReturn/123');
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
    prisonerService = prisonerService || createPrisonerServiceStub();
    licenceService = licenceService || createLicenceServiceStub();

    const baseRouter = standardRouter({licenceService, prisonerService, audit: auditStub});
    const route = baseRouter(createRoute({
        licenceService,
        prisonerService,
        audit: auditStub}), 'USER_MANAGEMENT');

    return appSetup(route, user, '/hdc/send/');
}
