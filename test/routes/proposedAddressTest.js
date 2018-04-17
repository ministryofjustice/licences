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

        beforeEach(() => {
            licenceServiceStub.getLicence.resolves({
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
                }
            });
        });

        const routes = [
            {url: '/proposedAddress/optOut/1', content: 'decided to opt out'},
            {url: '/proposedAddress/addressProposed/1', content: 'proposed a curfew address?'},
            {url: '/proposedAddress/bassReferral/1', content: 'BASS referral'},
            {url: '/proposedAddress/curfewAddress/1', content: 'Proposed curfew address'},
            {url: '/proposedAddress/confirmAddress/1', content: 'Confirm address details'},
            {url: '/proposedAddress/confirmAddress/1', content: 'href="/hdc/send/1'},
            {url: '/proposedAddress/confirmAddress/1', content: 'line3'}
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

    describe('curfewAddress', () => {
        context('there is a rejected address and active', () => {
            it('should display the active and post to update', () => {
                licenceServiceStub.getLicence.resolves({
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
                licenceServiceStub.getLicence.resolves({
                    licence: { }
                });
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
                licenceServiceStub.getLicence.resolves({
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
                licenceServiceStub.getLicence.resolves({
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
            licenceServiceStub.getLicence.resolves({
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
            return request(app)
                .get('/proposedAddress/rejected/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('id="rejectedLine1">address1</p>');
                });

        });

        it('should show the form to enter new address', () => {
            licenceServiceStub.getLicence.resolves({
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
            return request(app)
                .get('/proposedAddress/rejected/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.include('<form id="enterAlternativeForm" method="post">');
                });
        });
    });
});
