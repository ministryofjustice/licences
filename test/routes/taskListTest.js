const {
    request,
    sandbox,
    expect,
    appSetup
} = require('../supertestSetup');

const createTaskListRoute = require('../../server/routes/taskList');
const auth = require('../mockAuthentication');
const authenticationMiddleware = auth.authenticationMiddleware;

const prisonerInfoResponse = {
    bookingId: 1,
    facialImageId: 2,
    dateOfBirth: '23/12/1971',
    firstName: 'F',
    middleName: 'M',
    lastName: 'L',
    offenderNo: 'noms',
    aliases: 'Alias',
    assignedLivingUnitDesc: 'Loc',
    physicalAttributes: {gender: 'Male'},
    imageId: 'imgId',
    captureDate: '23/11/1971',
    sentenceExpiryDate: '03/12/1985'
};

const loggerStub = {
    debug: sandbox.stub()
};
const serviceStub = {
    getPrisonerDetails: sandbox.stub().returnsPromise().resolves(prisonerInfoResponse),
    getPrisonerImage: sandbox.stub().returnsPromise().resolves({image: 'image'})
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves(),
    createLicence: sandbox.stub().returnsPromise()
};

describe('GET /taskList/:prisonNumber', () => {

    afterEach(() => {
        sandbox.reset();
    });

    context('User is CA', () => {

        const testUser = {
            staffId: 'my-staff-id',
            token: 'my-token',
            role: 'CA'
        };

        const app = appSetup(createTaskListRoute({
            prisonerService: serviceStub,
            licenceService: licenceServiceStub,
            logger: loggerStub,
            authenticationMiddleware
        }), testUser);

        it('should call getPrisonerDetails from prisonerDetailsService', () => {
            return request(app)
                .get('/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(serviceStub.getPrisonerDetails).to.be.calledOnce();
                    expect(serviceStub.getPrisonerDetails).to.be.calledWith('123');
                });

        });

        it('should return the eligibility', () => {
            licenceServiceStub.getLicence.resolves({
                licence: {
                    eligibility: {
                        excluded: {
                            decision: 'No'
                        },
                        suitability: {
                            decision: 'No'
                        }
                    }
                }
            });
            return request(app)
                .get('/1233456')
                .expect(200)
                .expect(res => {
                    expect(res.text).to.not.include('id="eligibilityCheckStart"');
                });

        });

        it('should handle no eligibility', () => {
            licenceServiceStub.getLicence.resolves({licence: {}});
            return request(app)
                .get('/1233456')
                .expect(200)
                .expect(res => {
                    expect(res.text).to.include('id="eligibilityCheckStart"');
                });
        });

        context('when prisoner is not excluded', () => {
            it('should display opt out form link', () => {
                licenceServiceStub.getLicence.resolves({
                    licence: {
                        eligibility: {
                            excluded: {
                                decision: 'No'
                            },
                            suitability: {
                                decision: 'No'
                            }
                        }
                    }
                });

                return request(app)
                    .get('/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/proposedAddress/optOut/');
                    });
            });
        });

        context('when prisoner is ineligible', () => {
            it('should not display link to opt out when excluded', () => {
                licenceServiceStub.getLicence.resolves({
                    licence: {
                        eligibility: {
                            excluded: 'No',
                            unsuitable: 'Yes'
                        }
                    }
                });

                return request(app)
                    .get('/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('/hdc/optOut/');
                    });
            });

            it('should not display link to opt out when unsuitable', () => {
                licenceServiceStub.getLicence.resolves({
                    licence: {
                        eligibility: {
                            excluded: 'Yes',
                            unsuitable: 'No'
                        }
                    }
                });

                return request(app)
                    .get('/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('/hdc/optOut/');
                    });
            });

            it('should not display link to opt out when unsuitable and excluded', () => {
                licenceServiceStub.getLicence.resolves({
                    licence: {
                        eligibility: {
                            excluded: 'Yes',
                            unsuitable: 'Yes'
                        }
                    }
                });

                return request(app)
                    .get('/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('/hdc/optOut/');
                    });
            });
        });

        context('when prisoner has opted out', () => {
            it('should display that user has opted out', () => {
                licenceServiceStub.getLicence.resolves({
                    licence: {
                        proposedAddress: {
                            optOut: {decision: 'Yes'}
                        }
                    }
                });

                return request(app)
                    .get('/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Prisoner has opted out of HDC');
                    });
            });
        });

        context('when address has been submitted', () => {
            it('should display that it has been submitted', () => {
                licenceServiceStub.getLicence.resolves({
                    licence: {
                        proposedAddress: {
                            optOut: {licenceStatus: 'ADDRESS_SUBMITTED'}
                        }
                    }
                });

                return request(app)
                    .get('/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Proposed address information sent to RO');
                    });
            });
        });

        context('when bass has been requested', () => {
            it('should display that it has been requested', () => {
                licenceServiceStub.getLicence.resolves({
                    licence: {
                        proposedAddress: {
                            bassReferral: {decision: 'Yes'}
                        }
                    }
                });

                return request(app)
                    .get('/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Prisoner has opted in and requested BASS referral');
                    });
            });
        });

        describe('POST /eligibilityStart', () => {

            licenceServiceStub.getLicence.resolves({nomisId: '1'});
            licenceServiceStub.createLicence.resolves();

            afterEach(() => {
                sandbox.reset();
            });

            it('should redirect to eligibility section', () => {
                return request(app)
                    .post('/eligibilityStart')
                    .send({nomisId: '123'})
                    .expect(302)
                    .expect(res => {
                        expect(res.header['location']).to.include('/hdc/eligibility/excluded/123');
                    });
            });

            context('licence exists in db', () => {
                it('should not create a new licence', () => {
                    return request(app)
                        .post('/eligibilityStart')
                        .send({nomisId: '123'})
                        .expect(302)
                        .expect(res => {
                            expect(licenceServiceStub.createLicence).to.not.be.called();
                        });
                });
            });

            context('licence doesnt exist in db', () => {
                it('should create a new licence', () => {

                    licenceServiceStub.getLicence.resolves(undefined);
                    licenceServiceStub.createLicence.resolves();
                    return request(app)
                        .post('/eligibilityStart')
                        .send({nomisId: '123'})
                        .expect(302)
                        .expect(res => {
                            expect(licenceServiceStub.createLicence).to.be.called();
                            expect(licenceServiceStub.createLicence).to.be.calledWith('123');
                        });
                });
            });
        });

        describe('GET /image/:imageId', () => {

            it('should return an image', () => {
                return request(app)
                    .get('/image/123')
                    .expect(200)
                    .expect('Content-Type', /image/);
            });

            it('should return placeholder if no image returned from nomis', () => {
                serviceStub.getPrisonerImage.resolves(null);
                return request(app)
                    .get('/image/123')
                    .expect(302)
                    .expect('Content-Type', /image/);
            });
        });

    });

    context('User is RO', () => {

        const testUser = {
            staffId: 'my-staff-id',
            token: 'my-token',
            role: 'RO'
        };

        const app = appSetup(createTaskListRoute({
            prisonerService: serviceStub,
            licenceService: licenceServiceStub,
            logger: loggerStub,
            authenticationMiddleware
        }), testUser);

        context('curfew address not started', () => {
            it('should display a start button for curfew address', () => {
                return request(app)
                    .get('/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/curfew/curfewAddressReview/noms">Start');
                    });

            });
        });

        context('curfew address task started', () => {
            it('should display a view button for curfew address task', () => {
                licenceServiceStub.getLicence.resolves({
                    licence: {
                        curfew: {curfewAddressReview: {}}
                    }
                });
                return request(app)
                    .get('/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/curfew/curfewAddressReview/noms">View');
                    });

            });
        });

        context('additional condition task not started', () => {
            it('should display a start button for additional conditions task', () => {
                return request(app)
                    .get('/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/licenceConditions/standard/noms">Start');
                    });

            });
        });

        context('additional condition task started', () => {
            it('should display a view button for curfew address', () => {
                licenceServiceStub.getLicence.resolves({
                    licence: {
                        licenceConditions: {standard: {additionalConditionsRequired: 'No'}}
                    }
                });
                return request(app)
                    .get('/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/licenceConditions/standard/noms">View');
                    });

            });
        });

        context('risk management task not started', () => {
            it('should display a start button for additional conditions task', () => {
                return request(app)
                    .get('/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/risk/riskManagement/noms">Start');
                    });

            });
        });

        context('risk management task started', () => {
            it('should display a view button for curfew address', () => {
                licenceServiceStub.getLicence.resolves({
                    licence: {
                        risk: {riskManagement: {}}
                    }
                });
                return request(app)
                    .get('/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/risk/riskManagement/noms">View');
                    });

            });
        });

        context('all tasks done,', () => {
            it('should display a submit to OMU button', () => {
                licenceServiceStub.getLicence.resolves({
                    status: 'PROCESSING_RO',
                    licence: {
                        curfew: {
                            curfewAddressReview: {
                                consent: 'any',
                                deemedSafe: 'any'
                            },
                            curfewHours: 'any'
                        },
                        risk: {
                            riskManagement: {}
                        },
                        licenceConditions: {
                            standard: {additionalConditionsRequired: 'No'}
                        },
                        reporting: {
                            reportingInstructions: 'anything'
                        }
                    }
                });
                return request(app)
                    .get('/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/send/noms">Continue');
                    });

            });
        });
    });

});
