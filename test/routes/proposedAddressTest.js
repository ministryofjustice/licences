const request = require('supertest');

const {
    createPrisonerServiceStub,
    createLicenceServiceStub,
    authenticationMiddleware,
    auditStub,
    appSetup,
    testFormPageGets,
    loggerStub
} = require('../supertestSetup');

const createRoute = require('../../server/routes/address');
const formConfig = require('../../server/routes/config/proposedAddress');

describe('/hdc/proposedAddress', () => {

    describe('proposed address routes', () => {
        const licenceService = createLicenceServiceStub();
        licenceService.getLicence = sinon.stub().resolves({
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {
                                addressLine1: 'line1',
                                consent: 'No'
                            },
                            {
                                addressLine1: 'line2',
                                consent: 'Yes',
                                electricity: 'Yes',
                                deemedSafe: 'No'
                            },
                            {
                                addressLine1: 'line3'
                            }
                        ]
                    }
                }
            },
            stage: 'ELIGIBILITY'
        });

        const app = createApp({licenceServiceStub: licenceService}, 'caUser');

        const routes = [
            {url: '/hdc/proposedAddress/optOut/1', content: 'decided to opt out'},
            {url: '/hdc/proposedAddress/addressProposed/1', content: 'proposed a curfew address?'},
            {url: '/hdc/proposedAddress/bassReferral/1', content: 'BASS referral'},
            {url: '/hdc/proposedAddress/curfewAddress/1', content: 'Proposed curfew address'}
        ];

        testFormPageGets(app, routes, licenceService);
    });

    describe('POST /hdc/proposedAddress/:section/:bookingId', () => {
        const routes = [
            {
                url: '/hdc/proposedAddress/optOut/1',
                body: {bookingId: 1, decision: 'Yes'},
                section: 'optOut',
                nextPath: '/hdc/taskList/1',
                user: 'caUser'
            },
            {
                url: '/hdc/proposedAddress/optOut/1',
                body: {bookingId: 1, decision: 'No'},
                section: 'optOut',
                nextPath: '/hdc/proposedAddress/addressProposed/1',
                user: 'caUser'
            },
            {
                url: '/hdc/proposedAddress/addressProposed/1',
                body: {bookingId: 1, decision: 'Yes'},
                section: 'addressProposed',
                nextPath: '/hdc/proposedAddress/curfewAddress/1',
                user: 'caUser'
            },
            {
                url: '/hdc/proposedAddress/addressProposed/1',
                body: {bookingId: 1, decision: 'No'},
                section: 'addressProposed',
                nextPath: '/hdc/proposedAddress/bassReferral/1',
                user: 'caUser'
            },
            {
                url: '/hdc/proposedAddress/bassReferral/1',
                body: {bookingId: 1},
                section: 'bassReferral',
                nextPath: '/hdc/taskList/1',
                user: 'caUser'
            },
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
                const app = createApp({licenceServiceStub: licenceService}, 'caUser');
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
                            licenceSection: 'proposedAddress',
                            formName: route.section
                        });

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

            it('throws an error if logged in as ro except for curfew address', () => {
                const licenceService = createLicenceServiceStub();
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

        it('should redirect back to optOut page if there is an error in the submission', () => {
            const licenceService = createLicenceServiceStub();
            licenceService.getValidationErrorsForPage = sinon.stub().returns({
                proposedAddress: {
                    optOut: {
                        reason: 'error'
                    }
                }
            });
            const app = createApp({licenceServiceStub: licenceService}, 'caUser');

            return request(app)
                .post('/hdc/proposedAddress/optOut/1')
                .send({})
                .expect(302)
                .expect('Location', '/hdc/proposedAddress/optOut/1');

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
                        expect(res.text).to.include('/proposedAddress/curfewAddress/update/');
                        expect(res.text).to.include('name="[addresses][0][addressLine1]" value="address2"');
                    });

            });
        });

        context('there are no addresses saved', () => {
            it('should post to standard route', () => {
                const licenceService = createLicenceServiceStub();
                licenceService.getLicence = sinon.stub().resolves({
                    licence: { }
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
            it('should display no address and post to add', () => {
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
                        expect(res.text).to.include('/proposedAddress/curfewAddress/add');
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
                        expect(res.text).to.include(
                            '<form method="post" action="/hdc/proposedAddress/curfewAddress/update/1">');
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
    const prisonerServiceStub = createPrisonerServiceStub();
    licenceServiceStub = licenceServiceStub || createLicenceServiceStub();

    const route = createRoute({
        logger: loggerStub,
        licenceService: licenceServiceStub,
        prisonerService: prisonerServiceStub,
        authenticationMiddleware,
        audit: auditStub
    });

    return appSetup(route, user, '/hdc');
}
