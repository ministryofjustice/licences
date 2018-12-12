const createLicenceService = require('../../server/services/licenceService');

describe('validation', () => {
    let service = createLicenceService({}, {});

    describe('validateForm', () => {
        describe('eligibility', () => {

            const {excluded, suitability, exceptionalCircumstances, crdTime} = require('../../server/routes/config/eligibility');
            describe('excluded', () => {
                const pageConfig = excluded;
                const options = [
                    {formResponse: {decision: 'Yes', reason: ['a', 'b']}, outcome: {}},
                    {formResponse: {decision: '', reason: ['a', 'b']}, outcome: {decision: 'Select yes or no'}},
                    {formResponse: {decision: 'Yes', reason: []}, outcome: {reason: 'Select one or more reasons'}},
                    {formResponse: {decision: 'No', reason: []}, outcome: {}}
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });

            describe('suitability', () => {
                const pageConfig = suitability;
                const options = [
                    {formResponse: {decision: 'Yes', reason: ['a', 'b']}, outcome: {}},
                    {formResponse: {decision: '', reason: ['a', 'b']}, outcome: {decision: 'Select yes or no'}},
                    {formResponse: {decision: 'Yes', reason: []}, outcome: {reason: 'Select one or more reasons'}},
                    {formResponse: {decision: 'No', reason: []}, outcome: {}}
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });

            describe('exceptionalCircumstances', () => {
                const pageConfig = exceptionalCircumstances;
                const options = [
                    {formResponse: {decision: 'Yes'}, outcome: {}},
                    {formResponse: {decision: ''}, outcome: {decision: 'Select yes or no'}}
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });

            describe('crdTime', () => {
                const pageConfig = crdTime;
                const options = [
                    {formResponse: {decision: 'Yes', dmApproval: 'Yes'}, outcome: {}},
                    {formResponse: {decision: ''}, outcome: {decision: 'Select yes or no'}},
                    {formResponse: {decision: 'Yes'}, outcome: {dmApproval: 'Select yes or no'}},
                    {formResponse: {decision: 'No'}, outcome: {}}
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });

            describe('curfewAddress', () => {
                const {curfewAddress} = require('../../server/routes/config/proposedAddress');
                describe('curfewAddress', () => {

                    const pageConfig = curfewAddress;

                    const options = [
                        {
                            formResponse: {
                                addressLine1: 'a1',
                                addressTown: 't1',
                                postCode: 'S105NW',
                                cautionedAgainstResident: 'No',
                                telephone: '07700000000'
                            },
                            outcome: {}
                        },
                        {
                            formResponse: {
                                addressLine1: '', addressTown: 't1', postCode: 'S105NW', cautionedAgainstResident: 'No',
                                telephone: 'a'
                            },
                            outcome: {
                                addressLine1: 'Enter an address',
                                telephone: 'Enter a telephone number in the right format'
                            }
                        },
                        {
                            formResponse: {
                                addressLine1: 'a1',
                                addressTown: 't1',
                                postCode: 'S105NW',
                                cautionedAgainstResident: 'No',
                                telephone: '07700000000',
                                residents: [{name: 'name', relationship: 'rel'}]
                            },
                            outcome: {}
                        },
                        {
                            formResponse: {
                                addressLine1: 'a1',
                                addressTown: 't1',
                                postCode: 'S105NW',
                                cautionedAgainstResident: 'No',
                                telephone: '07700000000',
                                residents: [{name: 'a', relationship: ''}]
                            },
                            outcome: {residents: {0: {relationship: 'Enter a relationship'}}}
                        },
                        {
                            formResponse: {
                                addressLine1: 'a1',
                                addressTown: 't1',
                                postCode: 'S105NW',
                                cautionedAgainstResident: 'No',
                                telephone: '07700000000',
                                residents: []
                            },
                            outcome: {}
                        },
                        {
                            formResponse: {
                                addressLine1: 'a1',
                                addressTown: 't1',
                                postCode: 'S105NW',
                                cautionedAgainstResident: 'No',
                                telephone: '07700000000',
                                residents: [{name: 'n', relationship: 'n'}, {name: '', relationship: 'n'}]
                            },
                            outcome: {residents: {1: {name: 'Enter a name'}}}
                        },
                        {
                            formResponse: {
                                addressLine1: 'a1',
                                addressTown: 't1',
                                postCode: 'S105NW',
                                cautionedAgainstResident: 'No',
                                telephone: '07700000000',
                                residents: [{name: 'n', relationship: 'n'}],
                                occupier: {name: 'o', relationship: 'r'}
                            },
                            outcome: {}
                        },
                        {
                            formResponse: {
                                addressLine1: 'a1',
                                addressTown: 't1',
                                postCode: 'S105NW',
                                cautionedAgainstResident: 'No',
                                telephone: '07700000000',
                                residents: [{name: 'n', relationship: 'n'}],
                                occupier: {name: 'o', relationship: 'Enter a relationship'}
                            },
                            outcome: {}
                        }
                    ];

                    options.forEach(option => {
                        it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                            const {outcome, formResponse} = option;
                            expect(service.validateForm({
                                formResponse,
                                pageConfig,
                                formType: 'curfewAddress'
                            })).to.eql(outcome);
                        });
                    });
                });
            });
        });

        describe('processing_ro', () => {
            const {riskManagement} = require('../../server/routes/config/risk');
            describe('risk', () => {
                const pageConfig = riskManagement;
                const options = [
                    {
                        formResponse: {planningActions: 'No', awaitingInformation: 'No', victimLiaison: 'No'},
                        outcome: {}
                    },
                    {
                        formResponse: {planningActions: 'Yes', awaitingInformation: 'Yes', victimLiaison: 'Yes'},
                        outcome: {
                            planningActionsDetails: 'Provide details of the risk management actions',
                            awaitingInformationDetails: 'Provide details of the risk management actions',
                            victimLiaisonDetails: 'Provide details of the victim liaison case'
                        }
                    },
                    {
                        formResponse: {planningActions: '', awaitingInformation: '', victimLiaison: ''},
                        outcome: {
                            planningActions: 'Say if there are risk management actions',
                            awaitingInformation: 'Say if you are still awaiting information',
                            victimLiaison: 'Say if it is a victim liaison case'
                        }
                    }
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });

            const {reportingInstructions} = require('../../server/routes/config/reporting');
            describe('reportingInstructions', () => {
                const pageConfig = reportingInstructions;
                const options = [
                    {
                        formResponse:
                            {
                                name: 'n',
                                buildingAndStreet1: 'o',
                                townOrCity: 't',
                                postcode: 'S1 4JQ',
                                telephone: '0770000000'
                            },
                        outcome: {}
                    },
                    {
                        formResponse:
                            {name: '', buildingAndStreet1: '', townOrCity: '', postcode: 'a', telephone: 'd'},
                        outcome: {
                            name: 'Enter a name',
                            buildingAndStreet1: 'Enter a building or street',
                            townOrCity: 'Enter a town or city',
                            postcode: 'Enter a postcode in the right format',
                            telephone: 'Enter a telephone number in the right format'
                        }
                    }
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });

            const {curfewHours, curfewAddressReview, addressSafety} = require('../../server/routes/config/curfew');
            describe('curfewAddressReview', () => {
                const validAddress = {
                    addressLine1: 'a1', addressTown: 't1', postCode: 'S105NW', cautionedAgainstResident: 'No',
                    telephone: '07700000000'
                };
                const pageConfig = curfewAddressReview;
                const options = [
                    {
                        formResponse: {
                            ...validAddress, occupier: {isOffender: 'No', name: 'n', relationship: 'r'},
                            consent: 'No'
                        },
                        outcome: {}
                    },
                    {
                        formResponse: {
                            ...validAddress, occupier: {isOffender: 'No', name: 'n', relationship: 'r'},
                            consent: 'Yes'
                        },
                        outcome: {electricity: 'Say if there is an electricity supply'}
                    },
                    {
                        formResponse: {
                            ...validAddress, occupier: {isOffender: 'No', name: 'n', relationship: 'r'},
                            consent: 'Yes', electricity: 'Yes'
                        },
                        outcome: {homeVisitConducted: 'Say if you did a home visit'}
                    },
                    {
                        formResponse: {
                            ...validAddress, occupier: {isOffender: 'No', name: 'n', relationship: 'r'},
                            consent: 'Yes', electricity: 'No'
                        },
                        outcome: {}
                    },
                    {
                        formResponse: {
                            ...validAddress, occupier: {isOffender: 'No', name: 'n', relationship: 'r'},
                            consent: 'Yes', electricity: 'Yes', homeVisitConducted: 'Yes'
                        },
                        outcome: {}
                    },
                    // offender is occupier
                    {
                        formResponse: {...validAddress, occupier: {isOffender: 'Yes'}},
                        outcome: {electricity: 'Say if there is an electricity supply'}
                    },
                    {
                        formResponse: {
                            ...validAddress, occupier: {isOffender: 'Yes'},
                            electricity: 'Yes'
                        },
                        outcome: {homeVisitConducted: 'Say if you did a home visit'}
                    },

                    {
                        formResponse: {
                            ...validAddress, occupier: {isOffender: 'Yes'},
                            electricity: 'No'
                        },
                        outcome: {}
                    }
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({
                            formResponse,
                            pageConfig,
                            formType: 'curfewAddressReview'
                        })).to.eql(outcome);
                    });
                });
            });

            describe('addressSafety', () => {
                const validAddress = {
                    addressLine1: 'a1', addressTown: 't1', postCode: 'S105NW', cautionedAgainstResident: 'No',
                    telephone: '07700000000', electricity: 'Yes', homeVisitConducted: 'Yes'
                };
                const pageConfig = addressSafety;
                const options = [
                    {
                        formResponse: {
                            ...validAddress, occupier: {isOffender: 'No', name: 'n', relationship: 'r'},
                            consent: 'Yes', deemedSafe: 'Yes'
                        },
                        outcome: {}
                    },
                    {
                        formResponse: {
                            ...validAddress, occupier: {isOffender: 'No', name: 'n', relationship: 'r'},
                            consent: 'Yes', deemedSafe: 'No'
                        },
                        outcome: {unsafeReason: 'Explain why you did not approve the address'}
                    },
                    {
                        formResponse: {
                            ...validAddress, occupier: {isOffender: 'Yes'},
                            consent: '', deemedSafe: 'Yes'
                        },
                        outcome: {unsafeReason: 'Explain why you did not approve the address'}
                    },
                    {
                        formResponse: {
                            ...validAddress, occupier: {isOffender: 'No', name: 'n', relationship: 'r'},
                            consent: 'Yes', deemedSafe: 'Yes', unsafeReason: 'a'
                        },
                        outcome: {}
                    }
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({
                            formResponse,
                            pageConfig,
                            formType: 'addressSafety'
                        })).to.eql(outcome);
                    });
                });
            });

            describe('curfewHours', () => {
                const pageConfig = curfewHours;
                const options = [
                    {
                        formResponse:
                            {
                                daySpecificInputs: '', allFrom: '', allUntil: '',
                                mondayFrom: '07:00', mondayUntil: '20:00',
                                tuesdayFrom: '07:00', tuesdayUntil: '20:00',
                                wednesdayFrom: '07:00', wednesdayUntil: '20:00',
                                thursdayFrom: '07:00', thursdayUntil: '20:00',
                                fridayFrom: '07:00', fridayUntil: '20:00',
                                saturdayFrom: '07:00', saturdayUntil: '20:00',
                                sundayFrom: '07:00', sundayUntil: '20:00'
                            },
                        outcome: {}
                    },
                    {
                        formResponse:
                            {
                                daySpecificInputs: '', allFrom: '', allUntil: '',
                                mondayFrom: '25:00', mondayUntil: '',
                                tuesdayFrom: '', tuesdayUntil: '',
                                wednesdayFrom: '', wednesdayUntil: '',
                                thursdayFrom: '', thursdayUntil: '',
                                fridayFrom: '', fridayUntil: '',
                                saturdayFrom: '', saturdayUntil: '',
                                sundayFrom: '', sundayUntil: ''
                            },
                        outcome: {
                            mondayFrom: 'Enter a valid time', mondayUntil: 'Enter a valid time',
                            tuesdayFrom: 'Enter a valid time', tuesdayUntil: 'Enter a valid time',
                            wednesdayFrom: 'Enter a valid time', wednesdayUntil: 'Enter a valid time',
                            thursdayFrom: 'Enter a valid time', thursdayUntil: 'Enter a valid time',
                            fridayFrom: 'Enter a valid time', fridayUntil: 'Enter a valid time',
                            saturdayFrom: 'Enter a valid time', saturdayUntil: 'Enter a valid time',
                            sundayFrom: 'Enter a valid time', sundayUntil: 'Enter a valid time'
                        }
                    }
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });
        });

        describe('processing_ca', () => {
            const {seriousOffence, onRemand, confiscationOrder} = require('../../server/routes/config/finalChecks');
            describe('excluded', () => {
                const pageConfig = seriousOffence;
                const options = [
                    {formResponse: {decision: 'Yes'}, outcome: {}},
                    {formResponse: {decision: ''}, outcome: {decision: 'Select yes or no'}}
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });

            describe('onRemand', () => {
                const pageConfig = onRemand;
                const options = [
                    {formResponse: {decision: 'Yes'}, outcome: {}},
                    {formResponse: {decision: ''}, outcome: {decision: 'Select yes or no'}}
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });

            describe('confiscationOrder', () => {
                const pageConfig = confiscationOrder;
                const options = [
                    {formResponse: {decision: 'No'}, outcome: {}},
                    {
                        formResponse: {decision: 'Yes', confiscationUnitConsulted: ''},
                        outcome: {confiscationUnitConsulted: 'Select yes or no'}
                    },
                    {formResponse: {decision: 'Yes', confiscationUnitConsulted: 'No'}, outcome: {}},
                    {
                        formResponse: {decision: 'Yes', confiscationUnitConsulted: 'Yes', comments: ''},
                        outcome: {comments: 'Provide details'}
                    },
                    {formResponse: {decision: 'Yes', confiscationUnitConsulted: 'Yes', comments: 'wgew'}, outcome: {}}
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });
        });

        describe('curfew', () => {
            const {firstNight} = require('../../server/routes/config/curfew');
            describe('firstNight', () => {

                const pageConfig = firstNight;

                const options = [
                    {formResponse: {firstNightFrom: '13:00', firstNightUntil: '14:00'}, outcome: {}},
                    {
                        formResponse: {firstNightFrom: '25:00', firstNightUntil: '14:00'},
                        outcome: {firstNightFrom: 'Enter a valid from time'}
                    },
                    {
                        formResponse: {firstNightFrom: '13:00', firstNightUntil: ''},
                        outcome: {firstNightUntil: 'Enter a valid until time'}
                    },
                    {
                        formResponse: {},
                        outcome: {
                            firstNightFrom: 'Enter a valid from time',
                            firstNightUntil: 'Enter a valid until time'
                        }
                    }
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });
        });

        describe('bassReferral', () => {
            const {bassRequest, bassAreaCheck, bassOffer} = require('../../server/routes/config/bassReferral');

            describe('bassRequest', () => {
                const pageConfig = bassRequest;
                const options = [
                    {formResponse: {bassRequested: 'No'}, outcome: {}},
                    {formResponse: {bassRequested: 'Yes', specificArea: 'Yes'},
                        outcome: {proposedCounty: 'Enter a county', proposedTown: 'Enter a town'}},
                    {formResponse: {bassRequested: 'Yes', specificArea: 'Yes', proposedCounty: 'county'},
                        outcome: {proposedTown: 'Enter a town'}},
                    {formResponse: {bassRequested: 'Yes', specificArea: 'Yes', proposedCounty: 'county', proposedTown: 'town'},
                        outcome: {}}
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });

            describe('bassAreaCheck', () => {
                const pageConfig = bassAreaCheck;
                const options = [
                    {formResponse: {bassAreaSuitable: 'Yes'}, outcome: {}},
                    {formResponse: {bassAreaSuitable: 'No'}, outcome: {bassAreaReason: 'Enter a reason'}},
                    {formResponse: {bassAreaSuitable: 'No', bassAreaReason: 'reason'}, outcome: {}}
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });

            describe('bassOffer', () => {

                const pageConfig = bassOffer;

                describe('bassOffer - pre approval', () => {

                    const options = [
                        {formResponse: {bassAccepted: 'No'}, outcome: {}},
                        {
                            formResponse: {bassAccepted: 'Yes'},
                            outcome: {}
                        },
                        {
                            formResponse: {bassAccepted: ''},
                            outcome: {bassAccepted: 'Select an option'}
                        }
                    ];

                    options.forEach(option => {
                        it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.response)}`, () => {
                            const {outcome, formResponse} = option;
                            expect(service.validateForm(
                                {formResponse, pageConfig, bespokeConditions: {postApproval: false}})).to.eql(outcome);
                        });
                    });
                });

                describe('bassOffer - post approval', () => {
                    const options = [
                        {formResponse: {bassAccepted: 'No'}, outcome: {}},
                        {
                            formResponse: {
                                bassAccepted: 'Yes'
                            },
                            outcome: {
                                addressLine1: 'Enter a building or street',
                                addressTown: 'Enter a town or city',
                                bassArea: 'Enter the provided area',
                                postCode: 'Enter a postcode in the right format',
                                telephone: 'Enter a telephone number in the right format'
                            }
                        },
                        {
                            formResponse: {
                                bassAccepted: 'Yes',
                                addressLine1: 'Road',
                                addressTown: 'Town',
                                bassArea: 'Area',
                                postCode: 'LE17 4XJ',
                                telephone: '111'
                            },
                            outcome: {}
                        },
                        {
                            formResponse: {
                                bassAccepted: 'Yes',
                                addressLine1: 'Road',
                                addressTown: 'Town',
                                bassArea: 'Area',
                                postCode: 'a',
                                telephone: '111'
                            },
                            outcome: {postCode: 'Enter a postcode in the right format'}
                        }
                    ];

                    options.forEach(option => {
                        it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                            const {outcome, formResponse} = option;
                            expect(service.validateForm(
                                {formResponse, pageConfig, bespokeConditions: {postApproval: true}})).to.eql(outcome);
                        });
                    });
                });
            });
        });

        describe('approval', () => {
            const {release} = require('../../server/routes/config/approval');
            describe('release', () => {

                const pageConfig = release;

                context('when confiscationOrder is true', () => {
                    const options = [
                        {formResponse: {decision: 'Yes', notedComments: 'comments'}, outcome: {}},
                        {formResponse: {decision: 'Yes'}, outcome: {notedComments: 'Add a comment'}},
                        {formResponse: {decision: 'Yes', notedComments: ''}, outcome: {notedComments: 'Add a comment'}},
                        {formResponse: {decision: 'No', reason: ['reason']}, outcome: {}},
                        {formResponse: {decision: 'No', reason: []}, outcome: {reason: 'Select a reason'}}
                    ];

                    options.forEach(option => {
                        it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                            const {outcome, formResponse} = option;
                            expect(service.validateForm({
                                formResponse,
                                pageConfig,
                                bespokeConditions: {confiscationOrder: true}
                            })).to.eql(outcome);
                        });
                    });
                });

                context('when confiscationOrder is false', () => {
                    const options = [
                        {formResponse: {decision: 'Yes', notedComments: 'comments'}, outcome: {}},
                        {formResponse: {decision: 'Yes', notedComments: ''}, outcome: {}},
                        {formResponse: {decision: 'No', reason: ['reason']}, outcome: {}},
                        {formResponse: {decision: 'No', reason: []}, outcome: {reason: 'Select a reason'}}
                    ];

                    options.forEach(option => {
                        it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                            const {outcome, formResponse} = option;
                            expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                        });
                    });
                });

            });
        });

        describe('reporting', () => {
            const {reportingDate} = require('../../server/routes/config/reporting');
            describe('reportingDate', () => {

                const pageConfig = reportingDate;

                const options = [
                    {formResponse: {reportingDate: '12/03/2025', reportingTime: '15:00'}, outcome: {}},
                    {
                        formResponse: {reportingDate: '12/03/2016', reportingTime: '15:00'},
                        outcome: {reportingDate: 'Enter a valid date'}
                    },
                    {
                        formResponse: {reportingDate: '', reportingTime: '15:00'},
                        outcome: {reportingDate: 'Enter a valid date'}
                    },
                    {
                        formResponse: {reportingDate: '', reportingTime: ''},
                        outcome: {reportingDate: 'Enter a valid date', reportingTime: 'Enter a valid time'}
                    },
                    {
                        formResponse: {reportingDate: '12/03/2025', reportingTime: '24:40'},
                        outcome: {reportingTime: 'Enter a valid time'}
                    }
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
                        const {outcome, formResponse} = option;
                        expect(service.validateForm({formResponse, pageConfig})).to.eql(outcome);
                    });
                });
            });
        });


    });

    describe('validateFormGroup', () => {
        describe('eligibility', () => {

            const stage = 'ELIGIBILITY';
            const validAddress = {
                addressLine1: 'a1',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '07700000000'
            };

            const invalidAddress = {
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '07700000000'
            };
            const validLicence = {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {},
                            validAddress
                        ]
                    }
                }
            };
            const invalidLicence = {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {},
                            invalidAddress
                        ]
                    }
                }
            };

            const options = [
                {licence: validLicence, outcome: {}},
                {
                    licence: invalidLicence,
                    outcome: {proposedAddress: {curfewAddress: {addressLine1: 'Enter an address'}}}
                },
                {licence: {}, outcome: {proposedAddress: {curfewAddress: 'Please provide a curfew address'}}}
            ];

            options.forEach(option => {
                it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.licence)}`, () => {
                    const {outcome, licence} = option;
                    expect(service.validateFormGroup({licence, stage})).to.eql(outcome);
                });
            });

            context('bass referral needed', () => {

                const validBassRequest = {bassRequested: 'No', specificArea: 'No'};
                const validBassLicence = {
                    proposedAddress: {
                        curfewAddress: {
                            addresses: [validAddress]
                        }
                    },
                    bassReferral: {
                        bassRequest: validBassRequest
                    }
                };

                const options = [
                    {licence: validBassLicence, outcome: {}},
                    {
                        licence: {
                            ...validBassLicence,
                            bassReferral: {
                                ...validBassLicence.bassReferral,
                                bassRequest: {bassRequested: 'Yes', specificArea: 'Yes'}
                            }
                        },
                        outcome: {
                            bassReferral: {
                                bassRequest: {
                                    proposedCounty: 'Enter a county',
                                    proposedTown: 'Enter a town'
                                }
                            }
                        }
                    }
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.licence)}`, () => {
                        const {outcome, licence} = option;
                        expect(service.validateFormGroup({licence, stage, decisions: {bassReferralNeeded: true}})).to.eql(outcome);
                    });
                });
            });

        });

        describe('processing_ro', () => {

            const stage = 'PROCESSING_RO';
            const validRiskManagement = {planningActions: 'No', awaitingInformation: 'No', victimLiaison: 'No'};
            const validCurfewHours = {
                daySpecificInputs: '', allFrom: '', allUntil: '',
                mondayFrom: '07:00', mondayUntil: '20:00',
                tuesdayFrom: '07:00', tuesdayUntil: '20:00',
                wednesdayFrom: '07:00', wednesdayUntil: '20:00',
                thursdayFrom: '07:00', thursdayUntil: '20:00',
                fridayFrom: '07:00', fridayUntil: '20:00',
                saturdayFrom: '07:00', saturdayUntil: '20:00',
                sundayFrom: '07:00', sundayUntil: '20:00'
            };
            const validReportingInstructions =
                {name: 'n', buildingAndStreet1: 'o', townOrCity: 't', postcode: 'S1 4JQ', telephone: '0770000000'};

            const validAddress = {
                consent: 'Yes',
                postCode: 'S10 5NW',
                residents: [],
                telephone: '01344 553424',
                deemedSafe: 'Yes',
                addressTown: 'Sheffield',
                electricity: 'Yes',
                addressLine1: '3 Sandygate Grange Drive',
                addressLine2: '',
                unsafeReason: '',
                homeVisitConducted: 'Yes',
                addressReviewComments: '',
                cautionedAgainstResident: 'No'
            };

            const validLicence = {
                risk: {riskManagement: validRiskManagement},
                curfew: {curfewHours: validCurfewHours},
                reporting: {reportingInstructions: validReportingInstructions},
                proposedAddress: {curfewAddress: {addresses: [validAddress]}}
            };

            const invalidLicence = {
                risk: {riskManagement: {planningActions: '', awaitingInformation: 'No', victimLiaison: 'No'}},
                curfew: {curfewHours: validCurfewHours},
                reporting: {reportingInstructions: validReportingInstructions},
                proposedAddress: {curfewAddress: {addresses: [validAddress]}}
            };

            const options = [
                {licence: validLicence, standardOutcome: {}, addressRejectedOutcome: {}},
                {
                    licence: invalidLicence,
                    standardOutcome: {
                        risk: {riskManagement: {planningActions: 'Say if there are risk management actions'}}
                    },
                    addressRejectedOutcome: {}
                },
                {
                    licence: {},
                    standardOutcome: {
                        risk: {riskManagement: 'Enter the risk management and victim liaison details'},
                        curfew: {curfewHours: 'Enter the proposed curfew hours'},
                        curfewAddress: {
                            addressSafety: 'Enter the curfew address review details',
                            curfewAddressReview: 'Enter the curfew address review details'
                        },
                        reporting: {reportingInstructions: 'Enter the reporting instructions'}
                    },
                    addressRejectedOutcome: {
                        curfewAddress: {
                            addressSafety: 'Enter the curfew address review details',
                            curfewAddressReview: 'Enter the curfew address review details'
                        }
                    }
                }
            ];

            context('address not rejected', () => {
                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.standardOutcome)} for ${JSON.stringify(option.licence)}`, () => {
                        const {standardOutcome, licence} = option;
                        expect(service.validateFormGroup({licence, stage})).to.eql(standardOutcome);
                    });
                });
            });

            context('address rejected', () => {
                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.licence)}`, () => {
                        const {addressRejectedOutcome, licence} = option;
                        expect(service.validateFormGroup(
                            {licence, stage, decisions: {curfewAddressApproved: 'rejected'}})).to.eql(addressRejectedOutcome);
                    });
                });
            });

            context('bass requested', () => {
                const validBassRequest = {bassRequested: 'Yes', specificArea: 'No'};
                const validBassAreaCheck = {bassAreaSuitable: 'Yes'};
                const validBassOffer = {bassAccepted: 'No'};
                const validBassLicence = {
                    ...validLicence,
                    bassReferral: {
                        bassRequest: validBassRequest,
                        bassAreaCheck: validBassAreaCheck,
                        bassOffer: validBassOffer
                    }
                };

                const options = [
                    {licence: validBassLicence, outcome: {}},
                    {licence: {...validBassLicence, bassReferral: {}},
                        outcome: {
                            bassAreaCheck: {
                                bassReferral: 'Enter the bass area check details'
                            },
                            bassReferral: {
                                bassOffer: 'Enter the bass offer details',
                                bassRequest: 'Enter the bass referral details'
                            }
                        }
                    },
                    {licence: {...validBassLicence, proposedAddress: {}}, outcome: {}}
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.licence)}`, () => {
                        const {outcome, licence} = option;
                        expect(service.validateFormGroup({
                            licence,
                            stage,
                            decisions: {bassReferralNeeded: true}
                        })).to.eql(outcome);
                    });
                });
            });

            context('bass area suitable', () => {
                const validBassRequest = {bassRequested: 'No', specificArea: 'No'};
                const validBassAreaCheck = {bassAreaSuitable: 'Yes'};
                const validBassOffer = {bassAccepted: 'No'};
                const validBassLicence = {
                    curfew: {curfewHours: validCurfewHours},
                    bassReferral: {
                        bassRequest: validBassRequest,
                        bassAreaCheck: validBassAreaCheck,
                        bassOffer: validBassOffer
                    }
                };

                const options = [
                    {licence: validBassLicence, bassOutcome: {}},
                    {
                        licence: {
                            ...validBassLicence,
                            bassReferral: {
                                ...validBassLicence.bassReferral,
                                bassRequest: {bassRequested: 'Yes', specificArea: 'Yes'}
                            }
                        },
                        bassOutcome: {
                            bassReferral: {
                                bassRequest: {
                                    proposedCounty: 'Enter a county',
                                    proposedTown: 'Enter a town'
                                }
                            }
                        }
                    },
                    {
                        licence: {},
                        bassOutcome: {
                            bassOffer: {
                                bassReferral: 'Enter the bass offer details'
                            },
                            bassReferral: {
                                bassAreaCheck: 'Enter the bass area check details',
                                bassRequest: 'Enter the bass referral details'
                            }
                        }
                    }
                ];

                options.forEach(option => {
                    it(`should return ${JSON.stringify(option.bassOutcome)} for ${JSON.stringify(option.licence)}`, () => {
                        const {bassOutcome, licence} = option;
                        expect(service.validateFormGroup({licence, stage, decisions: {bassAreaNotSuitable: true}})).to.eql(bassOutcome);
                    });
                });
            });

        });
    });


});
