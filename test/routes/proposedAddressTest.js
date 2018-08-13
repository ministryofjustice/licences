const request = require('supertest');

const {
    createLicenceServiceStub,
    createApp,
    formConfig,
    testFormPageGets
} = require('../supertestSetup');

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

        const app = createApp({licenceService});

        const routes = [
            {url: '/proposedAddress/optOut/1', content: 'decided to opt out'},
            {url: '/proposedAddress/addressProposed/1', content: 'proposed a curfew address?'},
            {url: '/proposedAddress/bassReferral/1', content: 'BASS referral'},
            {url: '/proposedAddress/curfewAddress/1', content: 'Proposed curfew address'}
        ];

        testFormPageGets(app, routes, licenceService);
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
                nextPath: '/hdc/taskList/1'
            }
        ];

        routes.forEach(route => {
            it(`renders the correct path '${route.nextPath}' page`, () => {
                const licenceService = createLicenceServiceStub();
                const app = createApp({licenceService});

                return request(app)
                    .post(route.url)
                    .send(route.body)
                    .expect(302)
                    .expect(res => {
                        expect(licenceService.update).to.be.calledOnce();
                        expect(licenceService.update).to.be.calledWith({
                            nomisId: '1',
                            config: formConfig[route.section],
                            userInput: route.body,
                            licenceSection: 'proposedAddress',
                            formName: route.section
                        });

                        expect(res.header.location).to.equal(route.nextPath);
                    });
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
            const app = createApp({licenceService});

            return request(app)
                .post('/proposedAddress/optOut/1')
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
                const app = createApp({licenceService});

                return request(app)
                    .get('/proposedAddress/curfewAddress/1')
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

                const app = createApp({licenceService});

                return request(app)
                    .get('/proposedAddress/curfewAddress/1')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('<form method="post">');
                        expect(res.text).to.include('name="[addresses][0][addressLine1]"/>');
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
                const app = createApp({licenceService});

                return request(app)
                    .get('/proposedAddress/curfewAddress/1')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/proposedAddress/curfewAddress/add');
                        expect(res.text).to.include('name="[addresses][0][addressLine1]"/>');
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
                const app = createApp({licenceService});

                return request(app)
                    .get('/proposedAddress/curfewAddress/1')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include(
                            '<form method="post" action="/hdc/proposedAddress/curfewAddress/update/">');
                        expect(res.text).to.include('name="[addresses][0][addressLine1]" value="address1"/>');
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
            const app = createApp({licenceService});

            return request(app)
                .get('/proposedAddress/rejected/1')
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
            const app = createApp({licenceService});

            return request(app)
                .get('/proposedAddress/rejected/1')
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

            const app = createApp({licenceService});

            return request(app)
                .post('/proposedAddress/curfewAddress/add')
                .send({nomisId: '1', addresses: [{addressLine1: 'something'}]})
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

            const app = createApp({licenceService});

            return request(app)
                .post('/proposedAddress/curfewAddress/add')
                .send({nomisId: '1', addresses: [{addressLine1: '', postCode: '', addressLine2: ''}]})
                .expect(302)
                .expect('Location', '/hdc/proposedAddress/curfewAddress/1');

        });
    });
});
