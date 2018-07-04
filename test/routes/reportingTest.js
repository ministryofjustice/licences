const request = require('supertest');

const {
    createLicenceServiceStub,
    formConfig,
    createApp
} = require('../supertestSetup');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'CA'
};

describe('/hdc/reporting', () => {
    describe('routes', () => {
        const routes = [
            {url: '/reporting/reportingInstructions/1', content: 'Reporting instructions'}
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

    describe('POST /hdc/licenceConditions/:section/:nomisId', () => {
        const routes = [
            {
                url: '/reporting/reportingInstructions/1',
                body: {nomisId: 1},
                section: 'reportingInstructions',
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
                            licence: {key: 'value'},
                            nomisId: '1',
                            fieldMap: formConfig[route.section].fields,
                            userInput: route.body,
                            licenceSection: 'reporting',
                            formName: route.section
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });
        });
    });
});
