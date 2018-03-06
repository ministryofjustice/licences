const {
    request,
    expect,
    licenceServiceStub,
    prisonerServiceStub,
    hdcRoute,
    appSetup
} = require('../supertestSetup');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'CA'
};

const app = appSetup(hdcRoute, testUser);

describe('GET /licenceDetails/:prisonNumber', () => {

    beforeEach(() => {
        licenceServiceStub.getLicence.resolves({
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        preferred: {
                            addressLine1: 'Address 1'
                        }
                    }
                },
                licenceConditions: [{content: [{text: 'Condition1'}]}],
                risk: {riskManagement: {planningActions: 'Yes'}}
            }
        });

        prisonerServiceStub.getPrisonerDetails.resolves({});
    });

    it('renders html and displays licence detail', () => {
        return request(app)
            .get('/licenceDetails/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(res.text).to.include('Address 1');
                expect(res.text).to.include('Condition1');
                expect(res.text).to.include('Yes');
            });

    });

    it('renders html and displays licence details if sections are missing', () => {
        licenceServiceStub.getLicence.resolves({
            licence: {
                licenceConditions: [{content: [{text: 'Condition1'}]}]
            }
        });
        return request(app)
            .get('/licenceDetails/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(res.text).to.not.include('Address 1');
                expect(res.text).to.include('Condition1');
                expect(res.text).to.not.include('Yes');
            });

    });
});

