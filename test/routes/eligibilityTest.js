const {
    request,
    sandbox,
    expect,
    licenceServiceStub,
    hdcRoute,
    formConfig,
    appSetup,
    testFormPageGets
} = require('../supertestSetup');

const {roles} = require('../../server/models/roles');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: roles.CA
};

const app = appSetup(hdcRoute, testUser);

describe('/hdc/eligibility', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('eligibility routes', () => {
        const routes = [
            {url: '/eligibility/excluded/1', content: 'statutorily excluded'},
            {url: '/eligibility/suitability/1', content: 'presumed unsuitable'},
            {url: '/eligibility/crdTime/1', content: '4 weeks until'}
        ];

        testFormPageGets(app, routes);
    });

    describe('GET /eligibility/excluded/:nomisId', () => {

        it('does not pre-populates input if it does not exist on licence', () => {
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
            licenceServiceStub.getLicence.resolves({
                licence: {
                    eligibility: {
                        excluded: {
                            decision: 'Yes',
                            reason: ['sexOffenderRegister', 'convictedSexOffences']
                        }
                    }
                }
            });

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
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect('Location', route.nextPath)
                    .expect(res => {
                        expect(licenceServiceStub.update).to.be.calledOnce();
                        expect(licenceServiceStub.update).to.be.calledWith({
                            licence: {key: 'value'},
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
            licenceServiceStub.getLicenceErrors.returns({eligibility: {excluded: {reason: 'error'}}});

            return request(app)
                .post('/eligibility/excluded/1')
                .send({})
                .expect(302)
                .expect('Location', '/hdc/eligibility/excluded/1');

        });

        it('should not redirect back to excluded page if there is an error in a different part of licence', () => {
            licenceServiceStub.getLicenceErrors.returns({eligibility: {suitability: {reason: 'error'}}});

            return request(app)
                .post('/eligibility/excluded/1')
                .send({decision: 'No'})
                .expect(302)
                .expect('Location', '/hdc/eligibility/suitability/1');

        });
    });
});

