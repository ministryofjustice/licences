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

describe('/hdc/curfew', () => {

    describe('curfew routes', () => {

        beforeEach(() => {
            licenceServiceStub.getLicence.resolves({
                    licence: {
                       proposedAddress: {
                           curfewAddress: {
                               addresses: []
                           }
                       }
                    }
                }
            );
        });

        const routes = [
            {url: '/curfew/curfewAddressReview/1', content: 'Proposed curfew address'},
            {url: '/curfew/addressSafety/1', content: 'Could this offender be managed safely at this address?'},
            {url: '/curfew/curfewHours/1', content: 'Curfew hours'}
        ];

        testFormPageGets(app, routes);
    });

    describe('POST /hdc/curfew/:form/:nomisId', () => {
        const routes = [
            {
                url: '/curfew/curfewHours/1',
                body: {nomisId: 1},
                section: 'curfewHours',
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

    describe('/curfew/curfewAddressReview/1', () => {

        const routes = [
            {
                url: '/curfew/curfewAddressReview/1',
                body: {nomisId: 1, addressIndex: 5, consent: 'No'},
                section: 'curfewAddressReview',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/curfew/curfewAddressReview/1',
                body: {nomisId: 1, addressIndex: 5, consent: 'Yes', electricity: 'No'},
                section: 'curfewAddressReview',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/curfew/curfewAddressReview/1',
                body: {nomisId: 1, addressIndex: 5, consent: 'Yes'},
                section: 'curfewAddressReview',
                nextPath: '/hdc/curfew/addressSafety/1'
            },
            {
                url: '/curfew/addressSafety/1',
                body: {nomisId: 1, addressIndex: 5, deemedSafe: 'No'},
                section: 'addressSafety',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/curfew/addressSafety/1',
                body: {nomisId: 1, addressIndex: 5, deemedSafe: 'Yes'},
                section: 'addressSafety',
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
                        expect(licenceServiceStub.updateAddress).to.be.calledOnce();
                        expect(licenceServiceStub.updateAddress).to.be.calledWith({
                            licence: {key: 'value'},
                            nomisId: '1',
                            fieldMap: formConfig[route.section].fields,
                            userInput: route.body,
                            index: 5
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });
        });
    });
});
