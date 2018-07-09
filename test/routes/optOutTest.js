const request = require('supertest');

const {
    createLicenceServiceStub,
    createApp
} = require('../supertestSetup');

describe('/hdc/optOut', () => {
   describe('POST /optOut/:nomisId', () => {
        context('When page contains form fields', () => {
            it('calls updateLicence from licenceService and updates the proposedAddress optOut section', () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceService});

                const formResponse = {
                    nomisId: '1',
                    decision: 'Yes'
                };

                return request(app)
                    .post('/optOut/1')
                    .send(formResponse)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
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
