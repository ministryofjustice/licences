const request = require('supertest');

const {
    createLicenceServiceStub,
    createPrisonerServiceStub,
    createConditionsServiceStub,
    authenticationMiddleware,
    appSetup,
    auditStub
} = require('../supertestSetup');

const standardRouter = require('../../server/routes/routeWorkers/standardRouter');
const createRoute = require('../../server/routes/review');

const prisonerService = createPrisonerServiceStub();
const licenceService = createLicenceServiceStub();
const conditionsService = createConditionsServiceStub();

let app;

describe('/review/', () => {
    const prisonerService = createPrisonerServiceStub();
    prisonerService.getPrisonerDetails = sinon.stub().resolves({});

    const licence = {
        licence: {
            eligibility: {
                proposedAddress: {
                    addressLine1: 'line1'
                }
            }
        },
        stage: 'ELIGIBILITY'
    };

    describe('/curfewAddress/', () => {

        beforeEach(() => {
            app = createApp('caUser');
            licenceService.getLicence = sinon.stub().resolves(licence);
        });

        it('shows a button to send the case if there are no errors', () => {
            licenceService.getValidationErrorsForReview = sinon.stub().returns({});

            return request(app)
                .get('/hdc/review/curfewAddress/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('The case is ready to send to the responsible officer for address checks');
                    expect(res.text).to.not.contain('class="error-summary"');
                });
        });

        it('shows a link to the address page if there are errors', () => {
            licenceService.getValidationErrorsForReview = sinon.stub().returns({a: 'b'});

            return request(app)
                .get('/hdc/review/curfewAddress/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.not.contain('href="/hdc/send/');
                    expect(res.text).to.contain('errors before continuing');
                    expect(res.text).to.contain('class="error-summary"');
                });
        });
    });

    describe('/licenceDetails/', () => {

        beforeEach(() => {
            app = createApp('roUser');
            licenceService.getLicence = sinon.stub().resolves(licence);
        });

        it('links to optedOut send page when opted out', () => {
            licenceService.getLicence = sinon.stub().resolves({
                licence: {
                    proposedAddress: {
                        optOut: {decision: 'Yes'}
                    }
                },
                stage: 'PROCESSING_RO'
            });

            return request(app)
                .get('/hdc/review/licenceDetails/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('/hdc/send/optedOut/1');
                });
        });

        it('links to addressRejected send page when opted out', () => {
            licenceService.getLicence = sinon.stub().resolves({
                licence: {
                    proposedAddress: {
                        curfewAddress: {
                            addresses: [
                                {consent: 'No'}
                            ]
                        }
                    }
                },
                stage: 'PROCESSING_RO'
            });

            return request(app)
                .get('/hdc/review/licenceDetails/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('/hdc/send/addressRejected/1');
                });
        });

        it('links to final checks send page when not opted out and address not rejected', () => {
            licenceService.getLicence = sinon.stub().resolves({
                licence: {
                    proposedAddress: {
                        curfewAddress: {
                            addresses: [
                                {consent: 'Yes'}
                            ]
                        }
                    }
                },
                stage: 'PROCESSING_RO'
            });

            return request(app)
                .get('/hdc/review/licenceDetails/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('/hdc/send/finalChecks/1');
                });
        });

    });

    describe('/address/', () => {

        beforeEach(() => {
            app = app = createApp('caUser');
        });

        it('shows an actions panel if in PROCESSING_CA stage', () => {
            licenceService.getLicence = sinon.stub().resolves({
                licence: {
                    eligibility: {
                        proposedAddress: {
                            addressLine1: 'line1'
                        }
                    }
                },
                stage: 'PROCESSING_CA'
            });

            return request(app)
                .get('/hdc/review/address/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('id="withdrawAddress"');
                });
        });

        it('does not show an actions panel if in ELIGIBILITY stage', () => {
            licenceService.getLicence = sinon.stub().resolves({
                licence: {
                    eligibility: {
                        proposedAddress: {
                            addressLine1: 'line1'
                        }
                    }
                },
                stage: 'ELIGIBILITY'
            });

            return request(app)
                .get('/hdc/review/address/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.not.contain('id="withdrawAddress"');
                });
        });
    });
});

function createApp(user) {

    const baseRouter = standardRouter({licenceService, prisonerService, authenticationMiddleware, audit: auditStub});
    const route = baseRouter(createRoute({licenceService, conditionsService, prisonerService}));

    return appSetup(route, user, '/hdc');
}

