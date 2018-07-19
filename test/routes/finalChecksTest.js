const request = require('supertest');

const {
    createLicenceServiceStub,
    createApp,
    formConfig
} = require('../supertestSetup');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'CA'
};

describe('/hdc/finalChecks', () => {
    describe('routes', () => {
        const routes = [
            {url: '/finalChecks/seriousOffence/1', content: 'Has the offender committed an offence'},
            {url: '/finalChecks/onRemand/1', content: 'Is the offender currently on remand '},
            {url: '/finalChecks/confiscationOrder/1', content: 'Is the offender subject to a confiscation order?'}
        ];

        routes.forEach(route => {
            it(`renders the ${route.url} page`, () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceService}, testUser);

                return request(app)
                    .get(route.url)
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.contain(route.content);
                    });
            });
        });
    });

    describe('POST /hdc/finalChecks/:section/:nomisId', () => {
        const routes = [
            {
                url: '/finalChecks/seriousOffence/1',
                body: {nomisId: 1},
                formName: 'seriousOffence',
                nextPath: '/hdc/finalChecks/onRemand/1'
            },
            {
                url: '/finalChecks/onRemand/1',
                body: {nomisId: 1},
                formName: 'onRemand',
                nextPath: '/hdc/finalChecks/confiscationOrder/1'
            },
            {
                url: '/finalChecks/confiscationOrder/1',
                body: {nomisId: 1},
                formName: 'confiscationOrder',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/finalChecks/refuse/1',
                body: {nomisId: 1, decision: 'Yes'},
                fieldMap: formConfig.refuse.fields,
                formName: 'refusal',
                nextPath: '/hdc/finalChecks/refusal/1'
            },
            {
                url: '/finalChecks/refuse/1',
                body: {nomisId: 1, decision: 'No'},
                fieldMap: formConfig.refuse.fields,
                formName: 'refusal',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/finalChecks/refusal/1',
                body: {nomisId: 1, reason: 'something', outOfTimeReasons: []},
                fieldMap: formConfig.refusal.fields,
                formName: 'refusal',
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
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            nomisId: '1',
                            fieldMap: route.fieldMap || formConfig[route.formName].fields,
                            userInput: route.body,
                            licenceSection: route.sectionName || 'finalChecks',
                            formName: route.formName
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });
        });

        context('when there are errors', () => {
            it('should redirect back to seriousOffence page if there is an error', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getValidationErrorsForPage = sinon.stub().returns({
                    finalChecks: {
                        seriousOffence: {
                            reason: 'error'
                        }
                    }
                });
                const app = createApp({licenceService}, testUser);

                return request(app)
                    .post('/finalChecks/seriousOffence/1')
                    .send({})
                    .expect(302)
                    .expect('Location', '/hdc/finalChecks/seriousOffence/1');

            });

            it('should redirect back to onRemand page if there is an error', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getValidationErrorsForPage = sinon.stub().returns({
                    finalChecks: {
                        onRemand: {
                            reason: 'error'
                        }
                    }
                });
                const app = createApp({licenceService}, testUser);

                return request(app)
                    .post('/finalChecks/onRemand/1')
                    .send({})
                    .expect(302)
                    .expect('Location', '/hdc/finalChecks/onRemand/1');

            });

            it('should redirect back to confiscationOrder page if there is an error', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getValidationErrorsForPage = sinon.stub().returns({
                    finalChecks: {
                        confiscationOrder: {
                            reason: 'error'
                        }
                    }
                });
                const app = createApp({licenceService}, testUser);

                return request(app)
                    .post('/finalChecks/confiscationOrder/1')
                    .send({})
                    .expect(302)
                    .expect('Location', '/hdc/finalChecks/confiscationOrder/1');

            });
        });
    });
});
