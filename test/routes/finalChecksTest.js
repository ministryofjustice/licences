const {
    request,
    sandbox,
    expect,
    licenceServiceStub,
    hdcRoute,
    formConfig,
    appSetup
} = require('../supertestSetup');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'CA'
};

const app = appSetup(hdcRoute, testUser);

describe('/hdc/finalChecks', () => {

    afterEach(() => {
        sandbox.reset();
    });

    describe('routes', () => {
        const routes = [
            {url: '/finalChecks/seriousOffence/1', content: 'serious offence'}
        ];

        routes.forEach(route => {
            it(`renders the ${route.url} page`, () => {
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
                url: '/finalChecks/refuse/1',
                body: {nomisId: 1, decision: 'No'},
                fieldMap: formConfig.refuse.fields,
                sectionName: 'approval',
                formName: 'release',
                nextPath: '/hdc/finalChecks/refusal/1'
            },
            {
                url: '/finalChecks/refuse/1',
                body: {nomisId: 1, decision: 'Yes'},
                fieldMap: formConfig.refuse.fields,
                sectionName: 'approval',
                formName: 'release',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/finalChecks/refusal/1',
                body: {nomisId: 1, reason: 'something', outOfTimeReasons: []},
                fieldMap: formConfig.refusal.fields,
                sectionName: 'approval',
                formName: 'release',
                nextPath: '/hdc/taskList/1'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceServiceStub.update).to.be.calledOnce();
                        expect(licenceServiceStub.update).to.be.calledWith({
                            licence: {key: 'value'},
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
    });
});
