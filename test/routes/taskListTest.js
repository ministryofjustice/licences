const request = require('supertest');

const {
    createPrisonerServiceStub,
    createLicenceServiceStub,
    caseListServiceStub,
    appSetup,
    auditStub,
    signInServiceStub
} = require('../supertestSetup');

const standardRouter = require('../../server/routes/routeWorkers/standardRouter');
const createRoute = require('../../server/routes/taskList');

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
    sentenceExpiryDate: '03/12/1985',
    sentenceDetail: {
        effectiveAutomaticReleaseDate: '01/01/2001'
    }
};

describe('GET /taskList/:prisonNumber', () => {
    let prisonerService;
    let licenceService;

    beforeEach(() => {
        licenceService = createLicenceServiceStub();
        prisonerService = createPrisonerServiceStub();
        prisonerService.getPrisonerDetails = sinon.stub().resolves(prisonerInfoResponse);
    });

    describe('User is CA', () => {
        it('should call getPrisonerDetails from prisonerDetailsService', () => {
            licenceService.getLicence.resolves({stage: 'ELIGIBILITY', licence: {}});
            const app = createApp({licenceService, prisonerService});
            return request(app)
                .get('/tasklist/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(prisonerService.getPrisonerDetails).to.be.calledOnce();
                    expect(prisonerService.getPrisonerDetails).to.be.calledWith('123', 'token');
                });
        });

        it('should should show ARD if no CRD', () => {
            licenceService.getLicence.resolves({stage: 'ELIGIBILITY', licence: {}});
            const app = createApp({licenceService, prisonerService});
            return request(app)
                .get('/tasklist/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.not.include('id="prisonerCrd"');
                    expect(res.text).to.include('id="prisonerArd"> 01/01/2001');
                });

        });

        it('should return the eligibility', () => {
            licenceService.getLicence.resolves({
                stage: 'ELIGIBILITY',
                licence: {
                    eligibility: {
                        excluded: {
                            decision: 'No'
                        },
                        suitability: {
                            decision: 'No'
                        },
                        crdTime: {
                            decision: 'No'
                        }
                    }
                }
            });

            const app = createApp({licenceService, prisonerService});

            return request(app)
                .get('/tasklist/1233456')
                .expect(200)
                .expect(res => {
                    expect(res.text).to.not.include('id="eligibilityCheckStart"');
                });

        });

        it('should handle no eligibility', () => {
            licenceService.getLicence.resolves({stage: 'ELIGIBILITY', licence: {}});

            const app = createApp({licenceService, prisonerService});

            return request(app)
                .get('/tasklist/1233456')
                .expect(200)
                .expect(res => {
                    expect(res.text).to.include('id="eligibilityCheckStart"');
                });
        });

        context('when offender is not excluded', () => {
            it('should not display curfewAddressChoice link if section is incomplete', () => {
                licenceService.getLicence.resolves({
                    stage: 'ELIGIBILITY',
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

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('/hdc/proposedAddress/curfewAddressChoice/');
                    });
            });

            it('should display curfewAddressChoice link if section is complete', () => {
                licenceService.getLicence.resolves({
                    stage: 'ELIGIBILITY',
                    licence: {
                        eligibility: {
                            excluded: {
                                decision: 'No'
                            },
                            suitability: {
                                decision: 'No'
                            },
                            crdTime: {
                                decision: 'No'
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/proposedAddress/curfewAddressChoice/');
                    });
            });
        });

        context('when offender is unsuitable and has been given exceptional circumstances', () => {
            it('should display opt out form link', () => {
                licenceService.getLicence.resolves({
                    stage: 'ELIGIBILITY',
                    licence: {
                        eligibility: {
                            excluded: {
                                decision: 'No'
                            },
                            suitability: {
                                decision: 'Yes'
                            },
                            exceptionalCircumstances: {
                                decision: 'Yes'
                            },
                            crdTime: {
                                decision: 'No'
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/proposedAddress/curfewAddressChoice/');
                    });
            });
        });

        context('when there is less 4 weeks for the offenders CRD but the DM approves to continue assessment', () => {
            it('should display curfewAddressChoice link', () => {
                licenceService.getLicence.resolves({
                    stage: 'ELIGIBILITY',
                    licence: {
                        eligibility: {
                            excluded: {
                                decision: 'No'
                            },
                            suitability: {
                                decision: 'No'
                            },
                            crdTime: {
                                decision: 'Yes',
                                dmApproval: 'Yes'
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/proposedAddress/curfewAddressChoice/');
                    });
            });
        });
        // eslint-disable-next-line max-len
        context('when there is less 4 weeks for the offenders CRD but the DM does not approves to continue assessment', () => {
            it('should display the submit decision button', () => {
                licenceService.getLicence.resolves({
                    stage: 'ELIGIBILITY',
                    licence: {
                        eligibility: {
                            excluded: {
                                decision: 'No'
                            },
                            suitability: {
                                decision: 'No'
                            },
                            crdTime: {
                                decision: 'Yes',
                                dmApproval: 'No'
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('/hdc/proposedAddress/optOut/');
                        expect(res.text).to.include('/hdc/send/refusal/1');
                    });
            });
        });

        context('when offender is ineligible', () => {
            it('should not display link to opt out when unsuitable', () => {
                licenceService.getLicence.resolves({
                    stage: 'ELIGIBILITY',
                    licence: {
                        eligibility: {
                            excluded: {
                                decision: 'No'
                            },
                            suitability: {
                                decision: 'Yes'
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('/hdc/proposedAddress/optOut/');
                    });
            });

            it('should not display link to opt out when no exceptional circumstances are given', () => {
                licenceService.getLicence.resolves({
                    stage: 'ELIGIBILITY',
                    licence: {
                        eligibility: {
                            excluded: {
                                decision: 'No'
                            },
                            suitability: {
                                decision: 'Yes'
                            },
                            exceptionalCircumstances: {
                                decision: 'No'
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('/hdc/proposedAddress/optOut/');
                        expect(res.text).to.include('The offender is presumed unsuitable for HDC release');
                    });
            });

            it('should not display link to opt out when excluded', () => {
                licenceService.getLicence.resolves({
                    stage: 'ELIGIBILITY',
                    licence: {
                        eligibility: {
                            excluded: {
                                decision: 'Yes'
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('/hdc/proposedAddress/optOut/');
                        expect(res.text).to.include('The offender is statutorily excluded from HDC');
                    });
            });

            it('should not display link to opt out when unsuitable and excluded', () => {
                licenceService.getLicence.resolves({
                    stage: 'ELIGIBILITY',
                    licence: {
                        eligibility: {
                            excluded: {
                                decision: 'Yes'
                            },
                            suitability: {
                                decision: 'Yes'
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('/hdc/proposedAddress/optOut/');
                        expect(res.text).to.include('The offender is statutorily excluded from HDC');
                    });
            });
        });

        context('when address has been submitted', () => {
            it('should display that it has been submitted', () => {
                licenceService.getLicence.resolves({
                    stage: 'ELIGIBILITY',
                    licence: {
                        proposedAddress: {
                            optOut: {licenceStatus: 'ADDRESS_SUBMITTED'}
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Proposed address information sent to RO');
                    });
            });
        });

        context('when bass has been requested', () => {
            it('should display that it has been requested', () => {
                licenceService.getLicence.resolves({
                    stage: 'ELIGIBILITY',
                    licence: {
                        proposedAddress: {
                            bassReferral: {decision: 'Yes'}
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Prisoner has opted in and requested BASS referral');
                    });
            });
        });

        context('PROCESSING_CA, replacing an address', () => {
            it('should display send to RO task if unstarted address review', () => {
                licenceService.getLicence.resolves({
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [
                                    {
                                        occupier: {
                                            name: 'James Green',
                                            relationship: 'UX guy'
                                        },
                                        postCode: 'LE17 4AX',
                                        residents: [],
                                        telephone: '00000000000',
                                        addressTown: 'Lutterworth',
                                        addressLine1: '18 Almond Way',
                                        addressLine2: '',
                                        cautionedAgainstResident: 'No'
                                    }
                                ]
                            }
                        }
                    },
                    stage: 'PROCESSING_CA'
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.include('Submit curfew address');
                    });
            });

            it('should display send to DM for refusal task if address is withdrawn', () => {
                licenceService.getLicence.resolves({
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [
                                    {
                                        addressWithdrawn: 'Yes'
                                    }
                                ]
                            }
                        }
                    },
                    stage: 'PROCESSING_CA'
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.include('Ready to submit for refusal');
                    });
            });

            it('should display send to DM for refusal task if consent is withdrawn', () => {
                licenceService.getLicence.resolves({
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [
                                    {
                                        consentWithdrawn: 'Yes'
                                    }
                                ]
                            }
                        }
                    },
                    stage: 'PROCESSING_CA'
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.include('Ready to submit for refusal');
                    });
            });


            it('should not display send to RO task if unstarted address review', () => {
                licenceService.getLicence.resolves({
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [
                                    {
                                        occupier: {
                                            name: 'James Green',
                                            relationship: 'UX guy'
                                        },
                                        postCode: 'LE17 4AX',
                                        residents: [],
                                        telephone: '00000000000',
                                        addressTown: 'Lutterworth',
                                        addressLine1: '18 Almond Way',
                                        addressLine2: '',
                                        cautionedAgainstResident: 'No',
                                        consent: 'Yes'
                                    }
                                ]
                            }
                        }
                    },
                    stage: 'PROCESSING_CA'
                });

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/1233456')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Submit to responsible officer');
                    });
            });

            context('when the is no licence in the db for the offender', () => {
                it('should still load the tasklist', () => {
                    licenceService.getLicence.resolves(null);
                    const app = createApp({licenceService, prisonerService});
                    return request(app)
                        .get('/tasklist/123')
                        .expect(200)
                        .expect('Content-Type', /html/)
                        .expect(res => {
                            expect(res.text).to.include('id="prisonerArd"> 01/01/2001');
                        });
                });
            });
        });

        describe('POST /eligibilityStart', () => {
            beforeEach(() => {
                licenceService.getLicence.resolves({bookingId: '1'});
                licenceService.createLicence.resolves();
            });

            it('should redirect to eligibility section', () => {
                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .post('/tasklist/eligibilityStart')
                    .send({bookingId: '123'})
                    .expect(302)
                    .expect(res => {
                        expect(res.header['location']).to.include('/hdc/eligibility/excluded/123');
                    });
            });

            context('licence exists in db', () => {
                it('should not create a new licence', () => {
                    const app = createApp({licenceService, prisonerService});

                    return request(app)
                        .post('/tasklist/eligibilityStart')
                        .send({bookingId: '123'})
                        .expect(302)
                        .expect(res => {
                            expect(licenceService.createLicence).to.not.be.called();
                        });
                });
            });

            context('licence does not exist in db', () => {
                it('should create a new licence', () => {
                    licenceService.getLicence.resolves(undefined);
                    licenceService.createLicence.resolves();

                    const app = createApp({licenceService, prisonerService});

                    return request(app)
                        .post('/tasklist/eligibilityStart')
                        .send({bookingId: '123'})
                        .expect(302)
                        .expect(res => {
                            expect(licenceService.createLicence).to.be.called();
                            expect(licenceService.createLicence).to.be.calledWith('123');
                        });
                });

                it('should include personal details', () => {
                    licenceService.getLicence.resolves(undefined);
                    licenceService.createLicence.resolves();

                    const app = createApp({licenceService, prisonerService});

                    return request(app)
                        .post('/tasklist/eligibilityStart')
                        .send({bookingId: '123', firstName: 'fn', lastName: 'ln', dateOfBirth: '13/01/1980'})
                        .expect(302)
                        .expect(res => {
                            expect(licenceService.createLicence).to.be.called();
                            expect(licenceService.createLicence).to.be.calledWith('123');
                        });
                });

                it('should audit the new licence creation event', () => {
                    licenceService.getLicence.resolves(undefined);
                    licenceService.createLicence.resolves();

                    const app = createApp({licenceService, prisonerService});

                    return request(app)
                        .post('/tasklist/eligibilityStart')
                        .send({bookingId: '123'})
                        .expect(302)
                        .expect(res => {
                            expect(auditStub.record).to.be.called();
                            expect(auditStub.record).to.be.calledWith(
                                'LICENCE_RECORD_STARTED', 'id', {bookingId: '123'});
                        });
                });
            });
        });

        describe('GET /image/:imageId', () => {
            it('should return an image', () => {
                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/image/123')
                    .expect(200)
                    .expect('Content-Type', /image/);
            });

            it('should return placeholder if no image returned from nomis', () => {
                prisonerService.getPrisonerImage.resolves(null);

                const app = createApp({licenceService, prisonerService});

                return request(app)
                    .get('/tasklist/image/123')
                    .expect(302)
                    .expect('Content-Type', /image/);
            });
        });

    });

    describe('User is RO', () => {

        it('should pass the client credential token not the user one', () => {
            licenceService.getLicence.resolves({stage: 'ELIGIBILITY', licence: {}});
            const app = createApp({licenceService, prisonerService}, 'roUser');
            return request(app)
                .get('/tasklist/123')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(prisonerService.getPrisonerDetails).to.be.calledOnce();
                    expect(prisonerService.getPrisonerDetails).to.be.calledWith('123', 'system-token');
                });
        });

        context('curfew address not started', () => {
            it('should display a start button for curfew address', () => {
                licenceService.getLicence.resolves({stage: 'PROCESSING_RO', licence: {}});

                const app = createApp({licenceService, prisonerService}, 'roUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/curfew/curfewAddressReview/1">Start');
                    });

            });
        });

        context('curfew address task started', () => {
            it('should display a continue button for curfew address task', () => {
                licenceService.getLicence.resolves({
                    stage: 'PROCESSING_RO',
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [
                                    {consent: 'Yes'}
                                ]
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService}, 'roUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/curfew/curfewAddressReview/1">Continue');
                    });

            });
        });

        context('curfew address task complete', () => {
            it('should display a change button for curfew address task', () => {
                licenceService.getLicence.resolves({
                    stage: 'PROCESSING_RO',
                    licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [{
                                    cautionedAgainstResident: 'No',
                                    consent: 'Yes',
                                    electricity: 'Yes',
                                    homeVisitConducted: 'Yes',
                                    deemedSafe: 'Yes'
                                }]
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService}, 'roUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/curfew/curfewAddressReview/1">Change');
                    });

            });
        });

        context('additional condition task not started', () => {
            it('should display a start button for additional conditions task', () => {
                licenceService.getLicence.resolves({stage: 'PROCESSING_RO', licence: {}});

                const app = createApp({licenceService, prisonerService}, 'roUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/licenceConditions/standard/1">Start');
                    });

            });
        });

        context('additional conditions task started', () => {
            it('should display a continue button for additional conditions', () => {

                licenceService.getLicence.resolves({
                    stage: 'PROCESSING_RO',
                    licence: {licenceConditions: {standard: {additionalConditionsRequired: 'Yes'}}}
                });

                const app = createApp({licenceService, prisonerService}, 'roUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/licenceConditions/standard/1">Continue');
                    });

            });
        });

        context('additional conditions task complete', () => {
            it('should display a change button for additional conditions', () => {

                licenceService.getLicence.resolves({
                    stage: 'PROCESSING_RO',
                    licence: {licenceConditions: {standard: {additionalConditionsRequired: 'No'}}}
                });

                const app = createApp({licenceService, prisonerService}, 'roUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/licenceConditions/standard/1">Change');
                    });

            });
        });

        context('risk management task not started', () => {
            it('should display a start button for risk management task', () => {
                licenceService.getLicence.resolves({
                    stage: 'PROCESSING_RO',
                    licence: {licenceConditions: {standard: {additionalConditionsRequired: 'No'}}}
                });

                const app = createApp({licenceService, prisonerService}, 'roUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/risk/riskManagement/1">Start');
                    });

            });
        });

        context('risk management task started', () => {
            it('should display a continue button for riskManagement', () => {
                licenceService.getLicence.resolves({
                    stage: 'PROCESSING_RO',
                    licence: {
                        risk: {
                            riskManagement: {
                                planningActions: 'Yes'
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService}, 'roUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/risk/riskManagement/1">Continue');
                    });

            });
        });

        context('risk management task complete', () => {
            it('should display a change button for riskManagement', () => {
                licenceService.getLicence.resolves({
                    stage: 'PROCESSING_RO',
                    licence: {
                        risk: {
                            riskManagement: {
                                planningActions: 'No',
                                awaitingInformation: 'No',
                                victimLiaison: 'No'
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService}, 'roUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/risk/riskManagement/1">Change');
                    });

            });
        });

        context('all tasks done,', () => {
            it('should display a submit to OMU button', () => {
                licenceService.getLicence.resolves({
                    stage: 'PROCESSING_RO',
                    licence: {
                        curfew: {
                            curfewAddressReview: {
                                consent: 'any'
                            },
                            addressSafety: {
                                deemedSafe: 'any'
                            },
                            curfewHours: 'any'
                        },
                        risk: {
                            riskManagement: {
                                planningActions: 'any',
                                victimLiaison: 'any'
                            }
                        },
                        licenceConditions: {
                            standard: {additionalConditionsRequired: 'No'}
                        },
                        reporting: {
                            reportingInstructions: {
                                name: 'name'
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService}, 'roUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/review/licenceDetails/1">Continue');
                    });

            });
        });
    });

    context('User is DM', () => {

        context('When there is a confiscation order', () => {
            it('should display the postpone HDC button', () => {
                licenceService.getLicence.resolves({
                    stage: 'APPROVAL', licence: {
                        finalChecks: {
                            confiscationOrder: {
                                comments: 'dscdscsdcdsc',
                                decision: 'Yes',
                                confiscationUnitConsulted: 'Yes'
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService}, 'dmUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('value="Postpone"');
                    });
            });
        });

        context('When there is not a confiscation order', () => {
            it('should not display the postpone HDC button', () => {
                licenceService.getLicence.resolves({
                    stage: 'APPROVAL', licence: {
                        finalChecks: {
                            confiscationOrder: {
                                decision: 'No'
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService}, 'dmUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.not.include('value="Postpone"');
                    });
            });
        });

        context('Curfew address approved', () => {
            it('should display all other tasks', () => {
                licenceService.getLicence.resolves({
                    stage: 'APPROVAL', licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [{
                                    consent: 'Yes',
                                    electricity: 'Yes',
                                    deemedSafe: 'Yes'
                                }]
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService}, 'dmUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.include('/hdc/review/risk/1">View');
                        expect(res.text).to.include('/hdc/review/curfewHours/1">View');
                        expect(res.text).to.include('/hdc/review/conditions/1">View');
                        expect(res.text).to.include('/hdc/review/reporting/1">View');
                        expect(res.text).to.include('Review case');
                    });

            });
        });

        context('Curfew address rejected', () => {
            it('should NOT display all other tasks', () => {
                licenceService.getLicence.resolves({
                    stage: 'APPROVAL', licence: {
                        proposedAddress: {
                            curfewAddress: {
                                addresses: [{
                                    consent: 'No'
                                }]
                            }
                        }
                    }
                });

                const app = createApp({licenceService, prisonerService}, 'dmUser');

                return request(app)
                    .get('/tasklist/123')
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).not.to.include('/hdc/review/risk/1">View');
                        expect(res.text).not.to.include('/hdc/review/curfewHours/1">View');
                        expect(res.text).not.to.include('/hdc/review/conditions/1">View');
                        expect(res.text).not.to.include('/hdc/review/reporting/1">View');
                        expect(res.text).not.to.include('Final checks');
                    });

            });
        });
    });
});

function createApp({licenceService, prisonerService}, user) {
    prisonerService = prisonerService || createPrisonerServiceStub();
    licenceService = licenceService || createLicenceServiceStub();
    const signInService = signInServiceStub;

    const baseRouter = standardRouter({licenceService, prisonerService, audit: auditStub, signInService});
    const route = baseRouter(createRoute({
        licenceService,
        prisonerService,
        caseListService: caseListServiceStub,
        audit: auditStub}), {licenceRequired: false});

    return appSetup(route, user, '/tasklist/');
}
