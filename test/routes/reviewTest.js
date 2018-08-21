const request = require('supertest');

const {
    createLicenceServiceStub,
    createPrisonerServiceStub,
    createApp
} = require('../supertestSetup');

describe('/review/', () => {
    const prisonerService = createPrisonerServiceStub();
    prisonerService.getPrisonerDetails = sinon.stub().resolves({});

    describe('/curfewAddress/', () => {
        let licenceService;
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

        beforeEach(() => {
            licenceService = createLicenceServiceStub();
            licenceService.getLicence = sinon.stub().resolves(licence);
        });

        it('shows a link to the send page if there are no errors', () => {
            licenceService.getValidationErrorsForReview = sinon.stub().returns({});
            const app = createApp({licenceService, prisonerService});

            return request(app)
                .get('/hdc/review/curfewAddress/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('href="/hdc/send/');
                    expect(res.text).to.not.contain('class="error-summary"');
                });
        });

        it('shows a link to the address page if there are errors', () => {
            licenceService.getValidationErrorsForReview = sinon.stub().returns({a: 'b'});
            const app = createApp({licenceService, prisonerService});

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
        let licenceService;
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

        beforeEach(() => {
            licenceService = createLicenceServiceStub();
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
            const app = createApp({licenceService, prisonerService}, 'roUser');

            return request(app)
                .get('/hdc/review/licenceDetails/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('href="/hdc/send/optedOut/1');
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
            const app = createApp({licenceService, prisonerService}, 'roUser');

            return request(app)
                .get('/hdc/review/licenceDetails/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('href="/hdc/send/addressRejected/1');
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
            const app = createApp({licenceService, prisonerService}, 'roUser');

            return request(app)
                .get('/hdc/review/licenceDetails/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('href="/hdc/send/finalChecks/1');
                });
        });

    });

    describe('/address/', () => {
        let licenceService;

        beforeEach(() => {
            licenceService = createLicenceServiceStub();
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
            const app = createApp({licenceService, prisonerService});

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
            const app = createApp({licenceService, prisonerService});

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
