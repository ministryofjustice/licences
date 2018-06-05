const {
    request,
    sandbox,
    expect,
    licenceServiceStub,
    prisonerServiceStub,
    hdcRoute,
    appSetup
} = require('../supertestSetup');

const {roles} = require('../../server/models/roles');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: roles.CA
};

const app = appSetup(hdcRoute, testUser);

describe('/review/', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('/curfewAddress/', () => {

        beforeEach(() => {

            prisonerServiceStub.getPrisonerDetails.resolves({});

            licenceServiceStub.getLicence.resolves({
                licence: {
                    eligibility: {
                        proposedAddress: {
                            addressLine1: 'line1'
                        }
                    }
                },
                stage: 'ELIGIBILITY'
            });
        });

        it('shows a link to the send page if there are no errors', () => {

            licenceServiceStub.getValidationErrorsForReview.returns({});

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

            licenceServiceStub.getValidationErrorsForReview.returns({a: 'b'});

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
});
