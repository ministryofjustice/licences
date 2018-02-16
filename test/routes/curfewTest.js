const {
    request,
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

describe('/hdc/curfew', () => {

    describe('routes', () => {
        const pages = [
            {route: '/curfew/curfewAddressReview/1', content: 'Proposed curfew address'},
            {route: '/curfew/curfewHours/1', content: 'Curfew hours'}
        ];

        pages.forEach(get => {
            it(`renders the ${get.route} page`, () => {
                return request(app)
                    .get(get.route)
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.contain(get.content);
                    });
            });
        });
    });

    describe('POST /hdc/curfew/:form/:nomisId', () => {
        const routes = [
            {
                url: '/curfew/curfewAddressReview/1',
                body: {nomisId: 1},
                section: 'curfewAddressReview',
                nextPath: '/hdc/curfew/curfewHours/1'
            },
            {
                url: '/curfew/curfewAddressReview/1',
                body: {nomisId: 1, deemedSafe: 'No'},
                section: 'curfewAddressReview',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/curfew/curfewAddressReview/1',
                body: {nomisId: 1, safetyDetails: 'No'},
                section: 'curfewAddressReview',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/curfew/curfewHours/1',
                body: {nomisId: 1},
                section: 'curfewHours',
                nextPath: '/hdc/licenceConditions/standard/1'
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
                            fieldMap: formConfig[route.section].fields,
                            userInput: route.body,
                            licenceSection: 'curfew',
                            formName: route.section
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });
        });
    });
});
