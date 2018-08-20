const request = require('supertest');

const {
    createLicenceServiceStub,
    createApp,
    formConfig,
    testFormPageGets
} = require('../supertestSetup');

describe('/hdc/curfew', () => {
    describe('curfew routes', () => {
        const licenceService = createLicenceServiceStub();
        licenceService.getLicence = sinon.stub().resolves({
            licence: {
               proposedAddress: {
                   curfewAddress: {
                       addresses: []
                   }
               }
            }
        });
        const app = createApp({licenceService}, 'roUser');

        const routes = [
            {url: '/hdc/curfew/curfewAddressReview/1', content: 'Proposed curfew address'},
            {url: '/hdc/curfew/addressSafety/1', content: 'Could this offender be managed safely at this address?'},
            {url: '/hdc/curfew/curfewHours/1', content: 'Curfew hours'}
        ];

        testFormPageGets(app, routes, licenceService);
    });

    describe('address withdrawal routes', () => {
        const licenceService = createLicenceServiceStub();
        licenceService.getLicence = sinon.stub().resolves({
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addresses: []
                    }
                }
            }
        });
        const app = createApp({licenceService}, 'caUser');

        const routes = [
            {url: '/hdc/curfew/addressWithdrawn/1', content: 'Prisoner has withdrawn the address', user: 'caUser'},
            {
                url: '/hdc/curfew/consentWithdrawn/1',
                content: 'The landlord/homeowner has withdrawn consent',
                user: 'caUser'
            }
        ];

        testFormPageGets(app, routes, licenceService);
    });

    describe('POST /hdc/curfew/:form/:bookingId', () => {
        const routes = [
            {
                url: '/curfew/curfewHours/1',
                body: {bookingId: 1},
                section: 'curfewHours',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/hdc/curfew/addressWithdrawn/1',
                body: {decision: 'Yes'},
                section: 'addressWithdrawn',
                nextPath: '/hdc/proposedAddress/curfewAddress/1',
                user: 'caUser'
            },
            {
                url: '/hdc/curfew/addressWithdrawn/1',
                body: {decision: 'No'},
                section: 'addressWithdrawn',
                nextPath: '/hdc/taskList/1',
                user: 'caUser'
            },
            {
                url: '/hdc/curfew/consentWithdrawn/1',
                body: {decision: 'Yes'},
                section: 'consentWithdrawn',
                nextPath: '/hdc/proposedAddress/curfewAddress/1',
                user: 'caUser'
            },
            {
                url: '/hdc/curfew/consentWithdrawn/1',
                body: {decision: 'No'},
                section: 'consentWithdrawn',
                nextPath: '/hdc/taskList/1',
                user: 'caUser'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceService}, route.user || 'roUser');
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            bookingId: '1',
                            config: formConfig[route.section],
                            userInput: route.body,
                            licenceSection: 'curfew',
                            formName: route.section
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });
        });
    });

    describe('/hdc/curfew/curfewAddressReview/1', () => {
        const licence = {
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [{}, {}, {}, {}, {}, {}]
                    }
                }
            }
        };

        const routes = [
            {
                url: '/curfew/curfewAddressReview/1',
                body: {bookingId: 1, consent: 'No'},
                section: 'curfewAddressReview',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/curfew/curfewAddressReview/1',
                body: {bookingId: 1, consent: 'Yes', electricity: 'No'},
                section: 'curfewAddressReview',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/curfew/curfewAddressReview/1',
                body: {bookingId: 1, consent: 'Yes'},
                section: 'curfewAddressReview',
                nextPath: '/hdc/curfew/addressSafety/1',
                nextPathCa: '/hdc/taskList/1'
            },
            {
                url: '/curfew/addressSafety/1',
                body: {bookingId: 1, deemedSafe: 'No'},
                section: 'addressSafety',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/curfew/addressSafety/1',
                body: {bookingId: 1, deemedSafe: 'Yes'},
                section: 'addressSafety',
                nextPath: '/hdc/taskList/1'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves(licence);
                const app = createApp({licenceService}, 'roUser');
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.updateAddress).to.be.calledOnce();
                        expect(licenceService.updateAddress).to.be.calledWith({
                            rawLicence: licence,
                            nomisId: '1',
                            fieldMap: formConfig[route.section].fields,
                            userInput: route.body,
                            index: 5
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });

            it(`renders the correct path '${route.nextPath}' page when ca in post approval`, () => {

                const licence = {
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [{}, {}, {}, {}, {}, {}]
                            }
                        }
                    },
                    stage: 'MODIFIED'
                };

                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves(licence);
                const app = createApp({licenceService}, 'caUser');
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.updateAddress).to.be.calledOnce();
                        expect(licenceService.updateAddress).to.be.calledWith({
                            rawLicence: licence,
                            nomisId: '1',
                            fieldMap: formConfig[route.section].fields,
                            userInput: route.body,
                            index: 5
                        });

                        expect(res.header.location).to.equal(route.nextPathCa || route.nextPath);
                    });
            });

            it(`throws when posting to '${route.nextPath}' when ca in non-post approval`, () => {

                const licence = {
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [{}, {}, {}, {}, {}, {}]
                            }
                        }
                    },
                    stage: 'PROCESSING_CA'
                };

                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves(licence);
                const app = createApp({licenceService}, 'caUser');
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(403);

            });
        });
    });

    describe('address withdrawal posts', () => {
        const licence = {
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [{}, {}, {}, {}, {}, {}]
                    }
                }
            }
        };

        const routes = [
            {
                url: '/hdc/curfew/withdrawAddress/1',
                body: {withdrawAddress: 'Yes'},
                section: 'withdrawAddress',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/hdc/curfew/reinstateAddress/1',
                body: {withdrawAddress: 'No', withdrawConsent: 'No'},
                section: 'reinstateAddress',
                nextPath: '/hdc/taskList/1'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves(licence);
                const app = createApp({licenceService}, 'caUser');
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.updateAddress).to.be.calledOnce();
                        expect(licenceService.updateAddress).to.be.calledWith({
                            rawLicence: licence,
                            bookingId: '1',
                            fieldMap: formConfig[route.section].fields,
                            userInput: route.body,
                            index: 5
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });


            it(`throws when posting to '${route.nextPath}' when not a  ca`, () => {

                const licence = {
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [{}, {}, {}, {}, {}, {}]
                            }
                        }
                    },
                    stage: 'PROCESSING_CA'
                };

                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves(licence);
                const app = createApp({licenceService}, 'roUser');
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(403);

            });
        });
    });
});
