const request = require('supertest');

const {
    createPrisonerServiceStub,
    createLicenceServiceStub,
    authenticationMiddleware,
    auditStub,
    appSetup,
    testFormPageGets,
    signInServiceStub
} = require('../supertestSetup');

const standardRouter = require('../../server/routes/routeWorkers/standardRouter');
const createRoute = require('../../server/routes/address');
const formConfig = require('../../server/routes/config/proposedAddress');

describe('/hdc/proposedAddress', () => {

    describe('proposed address routes', () => {
        const licenceService = createLicenceServiceStub();
        licenceService.getLicence = sinon.stub().resolves({
            licence: {},
            stage: 'ELIGIBILITY'
        });

        const app = createApp({licenceServiceStub: licenceService}, 'caUser');

        const routes = [
            {url: '/hdc/proposedAddress/curfewAddressChoice/1', content: 'Has the offender provided a curfew address?'}
        ];

        testFormPageGets(app, routes, licenceService);
    });

    describe('POST /hdc/proposedAddress/:section/:bookingId', () => {
        const routes = [
            {
                url: '/hdc/proposedAddress/curfewAddress/1',
                body: {bookingId: 1},
                section: 'curfewAddress',
                nextPath: '/hdc/taskList/1',
                user: 'caUser'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                const licenceService = createLicenceServiceStub();
                licenceService.update.resolves({proposedAddress: {curfewAddress: {addresses: [{}]}}});
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');
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
                            licenceSection: 'proposedAddress',
                            formName: route.section
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });

            it('throws an error if logged in as dm', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.update.resolves({proposedAddress: {curfewAddress: {addresses: [{}]}}});
                const app = createApp({licenceServiceStub: licenceService}, 'dmUser');

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(403);

            });

            it('throws an error if logged in as ro except for curfew address', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.update.resolves({proposedAddress: {curfewAddress: {addresses: [{}]}}});
                const app = createApp({licenceServiceStub: licenceService}, 'roUser');

                if (route.url === '/hdc/proposedAddress/curfewAddress/1') {
                    return request(app)
                        .post(route.url)
                        .send(route.body)
                        .expect(302);
                }

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(403);

            });
        });

    });

    describe('POST /hdc/proposedAddress/curfewAddressChoice/:bookingId', () => {
        const routes = [
            {
                url: '/hdc/proposedAddress/curfewAddressChoice/1',
                body: {bookingId: 1, decision: 'OptOut'},
                nextPath: '/hdc/taskList/1',
                user: 'caUser',
                addressContent: {optOut: {decision: 'Yes'}, addressProposed: {decision: 'No'}, original: 'contents'},
                bassContent: {bassRequest: {bassRequested: 'No'}}
            },
            {
                url: '/hdc/proposedAddress/curfewAddressChoice/1',
                body: {bookingId: 1, decision: 'Address'},
                nextPath: '/hdc/proposedAddress/curfewAddress/1',
                user: 'caUser',
                addressContent: {optOut: {decision: 'No'}, addressProposed: {decision: 'Yes'}, original: 'contents'},
                bassContent: {bassRequest: {bassRequested: 'No'}}
            },
            {
                url: '/hdc/proposedAddress/curfewAddressChoice/1',
                body: {bookingId: 1, decision: 'Bass'},
                nextPath: '/hdc/bassReferral/bassRequest/1',
                user: 'caUser',
                addressContent: {optOut: {decision: 'No'}, addressProposed: {decision: 'No'}, original: 'contents'},
                bassContent: {bassRequest: {bassRequested: 'Yes'}}
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves({
                    licence: {
                        proposedAddress: {
                            original: 'contents',
                            addressProposed: 'replace'
                        }
                    },
                    stage: 'ELIGIBILITY'
                });
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');
                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.updateSection).to.be.calledTwice();
                        expect(licenceService.updateSection).to.be.calledWith('proposedAddress', '1', route.addressContent);
                        expect(licenceService.updateSection).to.be.calledWith('bassReferral', '1', route.bassContent);
                        expect(res.header.location).to.equal(route.nextPath);
                    });
            });

            it('throws an error if logged in as dm', () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceServiceStub: licenceService}, 'dmUser');

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(403);
            });

            it('throws an error if logged in as ro', () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceServiceStub: licenceService}, 'roUser');

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(403);
            });
        });
    });

    describe('curfewAddressChoice', () => {

        const routes = [
            {
                answer: 'none',
                licence: {},
                yes: [],
                no: [
                    'input id="optout" type="radio" checked',
                    'input id="address" type="radio" checked',
                    'input id="bass" type="radio" checked'
                ]
            },
            {
                answer: 'optout',
                licence: {proposedAddress: {optOut: {decision: 'Yes'}}},
                yes: ['input id="optout" type="radio" checked'],
                no: [
                    'input id="address" type="radio" checked',
                    'input id="bass" type="radio" checked'
                ]
            },
            {
                answer: 'bass',
                licence: {bassReferral: {bassRequest: {bassRequested: 'Yes'}}},
                yes: ['input id="bass" type="radio" checked'],
                no: [
                    'input id="optout" type="radio" checked',
                    'input id="address" type="radio" checked'
                ]
            },
            {
                answer: 'address',
                licence: {proposedAddress: {addressProposed: {decision: 'Yes'}}},
                yes: ['input id="address" type="radio" checked'],
                no: [
                    'input id="optout" type="radio" checked',
                    'input id="bass" type="radio" checked'
                ]
            }
        ];

        routes.forEach(route => {
            it(`should show ${route.answer} selected`, () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence.resolves({licence: route.licence});
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');

                return request(app)
                    .get('/hdc/proposedAddress/curfewAddressChoice/1')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        route.yes.forEach(content => {
                            expect(res.text).to.include(content);
                        });
                        route.no.forEach(content => {
                            expect(res.text).to.not.include(content);
                        });
                    });
            });
        });
    });

    describe('curfewAddress', () => {
        context('there is a rejected address and active', () => {
            it('should display the active and post to update', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence.resolves({
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [
                                    {addressLine1: 'address1', consent: 'No', electricity: 'No', deemedSafe: 'No'},
                                    {addressLine1: 'address2'}
                                ]
                            }
                        }
                    }
                });
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');

                return request(app)
                    .get('/hdc/proposedAddress/curfewAddress/1')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('name="[addresses][0][addressLine1]" value="address2"');
                    });

            });
        });

        context('there are no addresses saved', () => {
            it('should post to standard route', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves({
                    licence: {}
                });

                const app = createApp({licenceServiceStub: licenceService}, 'caUser');

                return request(app)
                    .get('/hdc/proposedAddress/curfewAddress/1')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('<form method="post">');
                        expect(res.text).to.include('name="[addresses][0][addressLine1]"');
                    });

            });
        });

        context('there are only rejected addresses', () => {
            it('should display no address', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves({
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [
                                    {addressLine1: 'address1', consent: 'No', electricity: 'No', deemedSafe: 'No'}
                                ]
                            }
                        }
                    }
                });
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');

                return request(app)
                    .get('/hdc/proposedAddress/curfewAddress/add/1')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('name="[addresses][0][addressLine1]"');
                    });

            });
        });

        context('there are only active addresses', () => {
            it('should display the active address', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves({
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [
                                    {addressLine1: 'address1'}
                                ]
                            }
                        }
                    }
                });
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');

                return request(app)
                    .get('/hdc/proposedAddress/curfewAddress/1')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('name="[addresses][0][addressLine1]" value="address1"');
                    });

            });
        });
    });

    describe('rejected', () => {
        it('should display the rejected address', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getLicence = sinon.stub().resolves({
                licence: {
                    proposedAddress: {
                        curfewAddress: {
                            addresses: [
                                {addressLine1: 'address1', consent: 'No'}
                            ]
                        }
                    }
                }
            });
            const app = createApp({licenceServiceStub: licenceService}, 'caUser');

            return request(app)
                .get('/hdc/proposedAddress/rejected/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('id="rejectedLine1">address1</p>');
                });

        });

        it('should show the form to enter new address', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getLicence.resolves({
                licence: {
                    proposedAddress: {
                        curfewAddress: {
                            addresses: [
                                {addressLine1: 'address1', consent: 'No'},
                                {addressLine1: 'alt1'}
                            ]
                        }
                    }
                }
            });
            const app = createApp({licenceServiceStub: licenceService}, 'caUser');

            return request(app)
                .get('/hdc/proposedAddress/rejected/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('<form id="enterAlternativeForm" method="post">');
                });
        });

        it('should redirect to task list if not in ELIGIBILITY stage', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getLicence.resolves({
                licence: {
                    proposedAddress: {
                        curfewAddress: {
                            addresses: [
                                {addressLine1: 'address1', consent: 'No'}
                            ]
                        }
                    }
                },
                stage: 'PROCESSING_CA'
            });

            const app = createApp({licenceServiceStub: licenceService}, 'caUser');

            return request(app)
                .post('/hdc/proposedAddress/curfewAddress/add/1')
                .send({bookingId: '1', addresses: [{addressLine1: 'something'}]})
                .expect(302)
                .expect('Location', '/hdc/taskList/1');

        });

        it('should redirect to form if empty address is passed in', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getLicence.resolves({
                licence: {
                    proposedAddress: {
                        curfewAddress: {
                            addresses: [
                                {addressLine1: 'address1', consent: 'No'}
                            ]
                        }
                    }
                },
                stage: 'PROCESSING_CA'
            });

            const app = createApp({licenceServiceStub: licenceService}, 'caUser');

            return request(app)
                .post('/hdc/proposedAddress/curfewAddress/add/1')
                .send({bookingId: '1', addresses: [{addressLine1: '', postCode: '', addressLine2: ''}]})
                .expect(302)
                .expect('Location', '/hdc/proposedAddress/curfewAddress/add/1');

        });
    });
});

function createApp({licenceServiceStub}, user) {
    const prisonerService = createPrisonerServiceStub();
    const licenceService = licenceServiceStub || createLicenceServiceStub();
    const signInService = signInServiceStub;

    const baseRouter = standardRouter({licenceService, prisonerService, authenticationMiddleware, audit: auditStub, signInService});
    const route = baseRouter(createRoute({licenceService}));

    return appSetup(route, user, '/hdc');
}
