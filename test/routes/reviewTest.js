const request = require('supertest');

const {
    createLicenceServiceStub,
    createPrisonerServiceStub,
    createApp
} = require('../supertestSetup');

const {roles} = require('../../server/models/roles');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: roles.CA
};

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
            const app = createApp({licenceService, prisonerService}, testUser);

            return request(app)
                .get('/review/curfewAddress/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('href="/hdc/send/');
                    expect(res.text).to.not.contain('class="error-summary"');
                });
        });

        it('shows a link to the address page if there are errors', () => {
            licenceService.getValidationErrorsForReview = sinon.stub().returns({a: 'b'});
            const app = createApp({licenceService, prisonerService}, testUser);

            return request(app)
                .get('/review/curfewAddress/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.not.contain('href="/hdc/send/');
                    expect(res.text).to.contain('errors before continuing');
                    expect(res.text).to.contain('class="error-summary"');
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
            const app = createApp({licenceService, prisonerService}, testUser);

            return request(app)
                .get('/review/address/1')
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
            const app = createApp({licenceService, prisonerService}, testUser);

            return request(app)
                .get('/review/address/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.not.contain('id="withdrawAddress"');
                });
        });
    });
});
