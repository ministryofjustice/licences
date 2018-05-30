const {
    request,
    expect,
    loggerStub,
    licenceServiceStub,
    prisonerServiceStub,
    authenticationMiddleware,
    appSetup
} = require('../supertestSetup');

const createSendRoute = require('../../server/routes/send');


describe('Send:', () => {

    beforeEach(() => {
        licenceServiceStub.getLicence.resolves({});
        prisonerServiceStub.getEstablishmentForPrisoner.resolves({premise: 'HMP Blah'});
        prisonerServiceStub.getComForPrisoner.resolves({com: 'Something'});
    });

    describe('When role is CA', () => {

        describe('GET /send', () => {

            const testUser = {
                staffId: 'my-staff-id',
                username: 'my-username',
                role: 'CA'
            };

            const app = appSetup(createSendRoute({
                licenceService: licenceServiceStub,
                prisonerService: prisonerServiceStub,
                logger: loggerStub,
                authenticationMiddleware
            }), testUser);

            it('renders and HTML output', () => {
                return request(app)
                    .get('/123')
                    .expect(200)
                    .expect('Content-Type', /html/);
            });

            describe('POST /send', () => {
                it('calls markForHandover via licenceService', () => {
                    return request(app)
                        .post('/123')
                        .send({nomisId: 123, sender: 'from', receiver: 'to'})
                        .expect(() => {
                            expect(licenceServiceStub.markForHandover).to.be.calledOnce();
                            expect(licenceServiceStub.markForHandover).to.be.calledWith(123, 'from', 'to');
                        });

                });

                it('shows sent confirmation', () => {
                    return request(app)
                        .post('/123')
                        .send({nomisId: 123, sender: 'from', receiver: 'to'})
                        .expect(302)
                        .expect(res => {
                            expect(res.header['location']).to.eql('/hdc/sent/123');
                        });

                });
            });

            it('gets com details when submission is CA to RO', () => {

                licenceServiceStub.getLicence.resolves({stage: 'ELIGIBILITY'});

                return request(app)
                    .get('/123')
                    .expect(() => {
                        expect(prisonerServiceStub.getComForPrisoner).to.be.calledOnce();
                        expect(prisonerServiceStub.getComForPrisoner).to.be.calledWith('123', {tokenId: 'my-username'});
                        expect(prisonerServiceStub.getEstablishmentForPrisoner).not.to.be.called();
                    });
            });
        });
    });


    describe('When role is RO', () => {

        const testUser = {
            staffId: 'my-staff-id',
            username: 'my-username',
            role: 'RO'
        };

        const app = appSetup(createSendRoute({
            licenceService: licenceServiceStub,
            prisonerService: prisonerServiceStub,
            logger: loggerStub,
            authenticationMiddleware
        }), testUser);

        it('gets establishment details when submission is RO to CA', () => {

            licenceServiceStub.getLicence.resolves({stage: 'PROCESSING_RO'});

            return request(app)
                .get('/123')
                .expect(() => {
                    expect(prisonerServiceStub.getEstablishmentForPrisoner).to.be.calledOnce();
                    expect(prisonerServiceStub.getEstablishmentForPrisoner).to.be.calledWith(
                        '123', {tokenId: 'my-username'});
                    expect(prisonerServiceStub.getComForPrisoner).not.to.be.called();
                });
        });
    });

});

