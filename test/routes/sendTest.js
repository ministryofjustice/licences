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

        auditStub.record.reset();
    });

    describe('When role is CA', () => {

        const eligibilityCompleteLicence = {
            eligibility: {
                excluded: {
                    decision: 'No'
                },
                suitability: {
                    decision: 'No'
                },
                crdTime: {
                    decision: 'No'
                }
            },
            proposedAddress: {
                optOut: {
                    decision: 'No'
                },
                bassReferral: {
                    decision: 'No'
                },
                curfewAddress: {
                    addresses: [{
                        addressLine1: 'Street',
                        addressTown: 'Town',
                        postCode: 'AB1 1AB',
                        telephone: '0123 456789',
                        cautionedAgainstResident: 'No',
                        occupier: {
                            name: 'Main Occupier',
                            age: '21',
                            relationship: 'Brother'
                        }
                    }]
                }
            }
        };

        describe('GET /send', () => {
            it('renders and HTML output', () => {
                licenceService.getLicence.resolves({stage: 'ELIGIBILITY', licence: eligibilityCompleteLicence});
                const app = createApp({licenceService, prisonerService});
                return request(app)
                    .get('/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.contain('name="submissionTarget" value="Something"');
                    });
            });

            it('gets com details when submission is CA to RO in Eligibility stage', () => {
                licenceService.getLicence.resolves({stage: 'ELIGIBILITY', licence: eligibilityCompleteLicence});
                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/123')
                    .expect(() => {
                        expect(prisonerService.getComForPrisoner).to.be.calledOnce();
                        expect(prisonerService.getComForPrisoner).to.be.calledWith('123', 'my-username');
                        expect(prisonerService.getEstablishmentForPrisoner).not.to.be.called();
                    });
            });

            it('gets com details when submission is CA to RO in Final Checks stage', () => {
                licenceService.getLicence.resolves({
                    stage: 'PROCESSING_CA', licence: {
                        proposedAddress: {curfewAddress: {addresses: [{}]}}
                    }
                });
                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/123')
                    .expect(() => {
                        expect(prisonerService.getComForPrisoner).to.be.calledOnce();
                        expect(prisonerService.getComForPrisoner).to.be.calledWith('123', 'my-username');
                        expect(prisonerService.getEstablishmentForPrisoner).not.to.be.called();
                    });
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

            it('audits the send event', () => {
                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .post('/123')
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
            licenceService.getLicence.resolves({
                stage: 'PROCESSING_RO', licence: {
                    proposedAddress: {
                        curfewAddress: {
                            addresses: [{
                                consent: 'No'
                            }]
                        }
                    }
                }
            });

            const app = createApp({licenceService, prisonerService}, roUser);

            return request(app)
                .get('/123')
                .expect(res => {
                    expect(res.text).to.contain('name="submissionTarget" value="HMP Blah"');
                    expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce();
                    expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith('123', 'my-username');
                    expect(prisonerService.getComForPrisoner).not.to.be.called();
                });
        });
    });
})
;


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
