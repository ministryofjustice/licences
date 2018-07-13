const request = require('supertest');

const {
    createLicenceServiceStub,
    formConfig,
    createApp,
    testFormPageGets
} = require('../supertestSetup');

const {roles} = require('../../server/models/roles');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: roles.CA
};

describe('/hdc/eligibility', () => {
    describe('eligibility routes', () => {
        const routes = [
            {url: '/eligibility/excluded/1', content: 'statutorily excluded'},
            {url: '/eligibility/suitability/1', content: 'presumed unsuitable'},
            {url: '/eligibility/crdTime/1', content: '4 weeks to the conditional release date?'}
        ];
        const licenceService = createLicenceServiceStub();
        const app = createApp({licenceService}, testUser);

        testFormPageGets(app, routes, licenceService);
    });

    describe('GET /eligibility/excluded/:nomisId', () => {
        it('does not pre-populates input if it does not exist on licence', () => {
            const licenceService = createLicenceServiceStub();
            const app = createApp({licenceService}, testUser);

            return request(app)
                .get('/eligibility/excluded/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('<input id="excludedYes" type="radio" name="decision" value="Yes">');
                    expect(res.text).to.not.contain(
                        '<input id="excludedYes" type="radio" checked name="decision" value="Yes">');
                });
        });

        it('pre-populates input if it exists on licence', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getLicence = sinon.stub().resolves({
                licence: {
                    eligibility: {
                        excluded: {
                            decision: 'Yes',
                            reason: ['sexOffenderRegister', 'convictedSexOffences']
                        }
                    }
                }
            });
            const app = createApp({licenceService}, testUser);

            return request(app)
                .get('/eligibility/excluded/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('value="sexOffenderRegister" checked');
                    expect(res.text).to.contain('value="convictedSexOffences" checked');
                });
        });
    });

    describe('POST /hdc/eligibility/:form/:nomisId', () => {
        const routes = [
            {
                url: '/eligibility/excluded/1',
                body: {decision: 'No'},
                section: 'excluded',
                nextPath: '/hdc/eligibility/suitability/1'
            },
            {
                url: '/eligibility/excluded/1',
                body: {decision: 'Yes'},
                section: 'excluded',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/eligibility/suitability/1',
                body: {decision: 'No'},
                section: 'suitability',
                nextPath: '/hdc/eligibility/crdTime/1'
            },
            {
                url: '/eligibility/suitability/1',
                body: {decision: 'Yes'},
                section: 'suitability',
                nextPath: '/hdc/eligibility/exceptionalCircumstances/1'
            },
            {
                url: '/eligibility/exceptionalCircumstances/1',
                body: {decision: 'Yes'},
                section: 'exceptionalCircumstances',
                nextPath: '/hdc/eligibility/crdTime/1'
            },
            {
                url: '/eligibility/exceptionalCircumstances/1',
                body: {decision: 'No'},
                section: 'exceptionalCircumstances',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/eligibility/crdTime/1',
                body: {decision: 'Yes'},
                section: 'crdTime',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/eligibility/crdTime/1',
                body: {decision: 'No'},
                section: 'crdTime',
                nextPath: '/hdc/taskList/1'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceService}, testUser);

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect('Location', route.nextPath)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            nomisId: '1',
                            fieldMap: formConfig[route.section].fields,
                            userInput: route.body,
                            licenceSection: 'eligibility',
                            formName: route.section
                        });
                    });
            });
        });

        it('should redirect back to excluded page if there is an error in the submission', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getValidationErrorsForPage = sinon.stub().returns({
                eligibility: {
                    excluded: {
                        reason: 'error'
                    }
                }
            });
            const app = createApp({licenceService}, testUser);

            return request(app)
                .post('/eligibility/excluded/1')
                .send({})
                .expect(302)
                .expect('Location', '/hdc/eligibility/excluded/1');

        });

        it('should not redirect back to excluded page if there is an error in a different part of licence', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getValidationErrorsForPage = sinon.stub().returns({
                eligibility: {
                    suitability: {
                        reason: 'error'
                    }
                }
            });
            const app = createApp({licenceService}, testUser);

            return request(app)
                .post('/eligibility/excluded/1')
                .send({decision: 'No'})
                .expect(302)
                .expect('Location', '/hdc/eligibility/suitability/1');

        });

        it('should redirect back to suitability page if there is an error in the submission', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getValidationErrorsForPage = sinon.stub().returns({
                eligibility: {
                    suitability: {
                        reason: 'error'
                    }
                }
            });
            const app = createApp({licenceService}, testUser);

            return request(app)
                .post('/eligibility/suitability/1')
                .send({})
                .expect(302)
                .expect('Location', '/hdc/eligibility/suitability/1');

        });

        it('should redirect back to crdtime page if there is an error in the submission', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getValidationErrorsForPage = sinon.stub().returns({
                eligibility: {
                    crdTime: {
                        reason: 'error'
                    }
                }
            });
            const app = createApp({licenceService}, testUser);

            return request(app)
                .post('/eligibility/crdTime/1')
                .send({})
                .expect(302)
                .expect('Location', '/hdc/eligibility/crdTime/1');

        });
    });
});
