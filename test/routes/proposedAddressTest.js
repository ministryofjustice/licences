const {
    request,
    expect,
    licenceServiceStub,
    hdcRoute,
    formConfig,
    appSetup,
    testFormPageGets
} = require('../supertestSetup');

const testUser = {
    staffId: 'my-staff-id',
    token: 'my-token',
    roleCode: 'CA'
};

const app = appSetup(hdcRoute, testUser);

describe('/hdc/proposedAddress', () => {

    describe('proposed address routes', () => {
        const routes = [
            {url: '/proposedAddress/optOut/1', content: 'decided to opt out'},
            {url: '/proposedAddress/addressProposed/1', content: 'proposed a curfew address?'},
            {url: '/proposedAddress/bassReferral/1', content: 'BASS referral'},
            {url: '/proposedAddress/curfewAddress/1', content: 'Proposed curfew address'},
            {url: '/proposedAddress/confirmAddress/1', content: 'Confirm address details'},
            {url: '/proposedAddress/confirmAddress/1', content: 'href="/hdc/send/1'}
        ];

        testFormPageGets(app, routes);
    });

    describe('POST /hdc/proposedAddress/:section/:nomisId', () => {
        const routes = [
            {
                url: '/proposedAddress/optOut/1',
                body: {nomisId: 1, decision: 'Yes'},
                section: 'optOut',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/proposedAddress/optOut/1',
                body: {nomisId: 1, decision: 'No'},
                section: 'optOut',
                nextPath: '/hdc/proposedAddress/addressProposed/1'
            },
            {
                url: '/proposedAddress/addressProposed/1',
                body: {nomisId: 1, decision: 'Yes'},
                section: 'addressProposed',
                nextPath: '/hdc/proposedAddress/curfewAddress/1'
            },
            {
                url: '/proposedAddress/addressProposed/1',
                body: {nomisId: 1, decision: 'No'},
                section: 'addressProposed',
                nextPath: '/hdc/proposedAddress/bassReferral/1'
            },
            {
                url: '/proposedAddress/bassReferral/1',
                body: {nomisId: 1},
                section: 'bassReferral',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/proposedAddress/curfewAddress/1',
                body: {nomisId: 1},
                section: 'curfewAddress',
                nextPath: '/hdc/proposedAddress/confirmAddress/1'
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
                            licenceSection: 'proposedAddress',
                            formName: route.section
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });
        });
    });
});
