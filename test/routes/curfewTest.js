const request = require('supertest');

const {
    createPrisonerServiceStub,
    createLicenceServiceStub,
    authenticationMiddleware,
    auditStub,
    appSetup,
    testFormPageGets
} = require('../supertestSetup');

const standardRouter = require('../../server/routes/routeWorkers/standardRouter');
const createRoute = require('../../server/routes/curfew');
const formConfig = require('../../server/routes/config/curfew');

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
        const app = createApp({licenceServiceStub: licenceService}, 'roUser');

        const routes = [
            {url: '/hdc/curfew/curfewAddressReview/1', content: 'Proposed curfew address'},
            {url: '/hdc/curfew/addressSafety/1', content: 'Could this offender be managed safely at this address?'},
            {url: '/hdc/curfew/curfewHours/1', content: 'HDC curfew hours'}
        ];

        testFormPageGets(app, routes, licenceService);
    });

    describe('first night route', () => {
        const licenceService = createLicenceServiceStub();
        licenceService.getLicence = sinon.stub().resolves({
            licence: {
                curfew: {firstNight: {firstNightFrom: '10:06'}}
            }
        });

        const app = createApp({licenceServiceStub: licenceService}, 'caUser');

        const routes = [
            {url: '/hdc/curfew/firstNight/1', content: 'id="firstNightFrom" value="10:06"'}
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
        const app = createApp({licenceServiceStub: licenceService}, 'caUser');

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
                url: '/hdc/curfew/curfewHours/1',
                body: {bookingId: 1},
                section: 'curfewHours',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/hdc/curfew/addressWithdrawn/1',
                body: {decision: 'Yes'},
                section: 'addressWithdrawn',
                nextPath: '/hdc/proposedAddress/curfewAddress/add/1',
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
                nextPath: '/hdc/proposedAddress/curfewAddress/add/1',
                user: 'caUser'
            },
            {
                url: '/hdc/curfew/consentWithdrawn/1',
                body: {decision: 'No'},
                section: 'consentWithdrawn',
                nextPath: '/hdc/taskList/1',
                user: 'caUser'
            },
            {
                url: '/hdc/curfew/firstNight/licence_type/1',
                body: {bookingId: 1, path: 'licence_type'},
                section: 'firstNight',
                nextPath: '/hdc/pdf/taskList/licence_type/1',
                user: 'caUser'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceServiceStub: licenceService}, route.user || 'roUser');
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            bookingId: '1',
                            originalLicence: {licence: {key: 'value'}},
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
                url: '/hdc/curfew/curfewAddressReview/1',
                body: {bookingId: 1, consent: 'No'},
                section: 'curfewAddressReview',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/hdc/curfew/curfewAddressReview/1',
                body: {bookingId: 1, consent: 'Yes', electricity: 'No'},
                section: 'curfewAddressReview',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/hdc/curfew/curfewAddressReview/1',
                body: {bookingId: 1, consent: 'Yes'},
                section: 'curfewAddressReview',
                nextPath: '/hdc/curfew/addressSafety/1',
                nextPathCa: '/hdc/taskList/1'
            },
            {
                url: '/hdc/curfew/addressSafety/1',
                body: {bookingId: 1, deemedSafe: 'No'},
                section: 'addressSafety',
                nextPath: '/hdc/taskList/1'
            },
            {
                url: '/hdc/curfew/addressSafety/1',
                body: {bookingId: 1, deemedSafe: 'Yes'},
                section: 'addressSafety',
                nextPath: '/hdc/taskList/1'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves(licence);
                const app = createApp({licenceServiceStub: licenceService}, 'roUser');
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
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');
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

                        expect(res.header.location).to.equal(route.nextPathCa || route.nextPath);
                    });
            });

            it(`throws when posting to '${route.nextPath}' when ca except post-approval or final checks`, () => {

                const licence = {
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [{}, {}, {}, {}, {}, {}]
                            }
                        }
                    },
                    stage: 'ELIGIBILITY'
                };

                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves(licence);
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(403);

            });
        });

        describe('curfewAddressReview', () => {
            it('shows three questions if main occupier is not the offender', () => {
                const licence = {
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [{}]
                            }
                        }
                    },
                    stage: 'PROCESSING_RO'
                };

                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves(licence);
                const app = createApp({licenceServiceStub: licenceService}, 'roUser');
                return request(app)
                    .get('/hdc/curfew/curfewAddressReview/1')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.contain('Does the main occupier consent to HDC?');
                        expect(res.text).to.contain('Is there an electricity supply?');
                        expect(res.text).to.contain('Did you do a home visit?');
                    });


            });

            it('shows two questions if main occupier is the offender', () => {
                const licence = {
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [{occupier: {isOffender: 'Yes'}}]
                            }
                        }
                    },
                    stage: 'PROCESSING_RO'
                };

                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves(licence);
                const app = createApp({licenceServiceStub: licenceService}, 'roUser');
                return request(app)
                    .get('/hdc/curfew/curfewAddressReview/1')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.contain('Does the main occupier consent to HDC?');
                        expect(res.text).to.contain('Is there an electricity supply?');
                        expect(res.text).to.contain('Did you do a home visit?');
                    });

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
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');
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
                const app = createApp({licenceServiceStub: licenceService}, 'roUser');
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(403);

            });
        });
    });

    describe('curfew hours posts', () => {

        const body = {
            daySpecificInputs: 'No',
            allFrom: '15:00',
            allUntil: '06:00',
            mondayFrom: '17:00',
            mondayUntil: '09:00',
            tuesdayFrom: '17:00',
            tuesdayUntil: '09:00',
            wednesdayFrom: '17:00',
            wednesdayUntil: '09:00',
            thursdayFrom: '17:00',
            thursdayUntil: '09:00',
            fridayFrom: '17:00',
            fridayUntil: '09:00',
            saturdayFrom: '17:00',
            saturdayUntil: '09:00',
            sundayFrom: '17:00',
            sundayUntil: '09:00'
        };

        context('when daySpecificInputs input is No', () => {
            it('should use the times from allFrom and allUntil for each day', () => {

                const expectedUserInput = {
                    daySpecificInputs: 'No',
                    allFrom: '15:00',
                    allUntil: '06:00',
                    mondayFrom: '15:00',
                    mondayUntil: '06:00',
                    tuesdayFrom: '15:00',
                    tuesdayUntil: '06:00',
                    wednesdayFrom: '15:00',
                    wednesdayUntil: '06:00',
                    thursdayFrom: '15:00',
                    thursdayUntil: '06:00',
                    fridayFrom: '15:00',
                    fridayUntil: '06:00',
                    saturdayFrom: '15:00',
                    saturdayUntil: '06:00',
                    sundayFrom: '15:00',
                    sundayUntil: '06:00'
                };

                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceServiceStub: licenceService}, 'roUser');
                return request(app)
                    .post('/hdc/curfew/curfewHours/1')
                    .send(body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledWith({
                            bookingId: '1',
                            originalLicence: {licence: {key: 'value'}},
                            config: formConfig.curfewHours,
                            userInput: expectedUserInput,
                            licenceSection: 'curfew',
                            formName: 'curfewHours'
                        });
                    });

            });
        });

        context('when daySpecificInputs input is Yes', () => {

            const daySpecificBody = {...body, daySpecificInputs: 'Yes'};

            it('should use the specific times provided for each day', () => {

                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceServiceStub: licenceService}, 'roUser');
                return request(app)
                    .post('/hdc/curfew/curfewHours/1')
                    .send(daySpecificBody)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledWith({
                            bookingId: '1',
                            originalLicence: {licence: {key: 'value'}},
                            config: formConfig.curfewHours,
                            userInput: daySpecificBody,
                            licenceSection: 'curfew',
                            formName: 'curfewHours'
                        });
                    });

            });
        });
    });
});

function createApp({licenceServiceStub}, user) {
    const prisonerService = createPrisonerServiceStub();
    const licenceService = licenceServiceStub || createLicenceServiceStub();

    const baseRouter = standardRouter({licenceService, prisonerService, authenticationMiddleware, audit: auditStub});
    const route = baseRouter(createRoute({licenceService}));

    return appSetup(route, user, '/hdc');
}
