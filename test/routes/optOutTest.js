const {
    request,
    expect,
    licenceServiceStub,
    hdcRoute,
    appSetup
} = require('../supertestSetup');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'CA'
};

const app = appSetup(hdcRoute, testUser);

describe('/hdc/optOut', () => {

   describe('POST /optOut/:nomisId', () => {
        context('When page contains form fields', () => {
            it('calls updateLicence from licenceService and updates the proposedAddress optOut section', () => {

                const formResponse = {
                    nomisId: '1',
                    decision: 'Yes'
                };

                return request(app)
                    .post('/optOut/1')
                    .send(formResponse)
                    .expect(302)
                    .expect(res => {
                        expect(licenceServiceStub.update).to.be.calledOnce();
                        expect(licenceServiceStub.update).to.be.calledWith({
                            licence: {key: 'value'},
                            nomisId: '1',
                            fieldMap: [{decision: {}}],
                            userInput: formResponse,
                            licenceSection: 'proposedAddress',
                            formName: 'optOut'
                        });
                        expect(res.header.location).to.equal('/hdc/taskList/1');
                    });
            });
        });
    });
});
