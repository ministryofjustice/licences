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
        });

        describe('finalChecks', () => {
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
                    {formResponse: {decision: 'Yes', confiscationUnitConsulted: ''},
                        outcome: {confiscationUnitConsulted: 'Select yes or no'}},
                    {formResponse: {decision: 'Yes', confiscationUnitConsulted: 'No'}, outcome: {}},
                    {formResponse: {decision: 'Yes', confiscationUnitConsulted: 'Yes', comments: ''},
                        outcome: {comments: 'Provide details'}},
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
                    {formResponse: {firstNightFrom: '25:00', firstNightUntil: '14:00'},
                        outcome: {firstNightFrom: 'Enter a valid from time'}},
                    {formResponse: {firstNightFrom: '13:00', firstNightUntil: ''}, outcome: {firstNightUntil: 'Enter a valid until time'}},
                    {formResponse: {}, outcome: {firstNightFrom: 'Enter a valid from time', firstNightUntil: 'Enter a valid until time'}}
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
            const {bassOffer} = require('../../server/routes/config/bassReferral');
            describe('bassOffer', () => {

                const pageConfig = bassOffer;

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
                            postCode: 'Enter a postcode in the right format'
                        }
                    },
                    {
                        formResponse: {
                            bassAccepted: 'Yes',
                            addressLine1: 'Road',
                            addressTown: 'Town',
                            bassArea: 'Area',
                            postCode: 'LE17 4XJ'
                        },
                        outcome: {}
                    },
                    {
                        formResponse: {
                            bassAccepted: 'Yes',
                            addressLine1: 'Road',
                            addressTown: 'Town',
                            bassArea: 'Area',
                            postCode: 'a'
                        },
                        outcome: {postCode: 'Enter a postcode in the right format'}
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
                                bespokeConditions: {confiscationOrder: true}})).to.eql(outcome);
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

        describe('curfewAddress', () => {
            const {curfewAddress} = require('../../server/routes/config/proposedAddress');
            describe('curfewAddress', () => {

                const pageConfig = curfewAddress;

                const options = [
                    {formResponse: {
                            addressLine1: 'a1', addressTown: 't1', postCode: 'S105NW', cautionedAgainstResident: 'No',
                            telephone: '07700000000'},
                        outcome: {}
                    },
                    {formResponse: {
                            addressLine1: '', addressTown: 't1', postCode: 'S105NW', cautionedAgainstResident: 'No',
                            telephone: 'a'},
                        outcome: {addressLine1: 'Enter an address', telephone: 'Enter a telephone number in the right format'}
                    },
                    {formResponse: {
                            addressLine1: 'a1', addressTown: 't1', postCode: 'S105NW', cautionedAgainstResident: 'No',
                            telephone: '07700000000',
                            residents: [{name: 'name', relationship: 'rel'}]
                        },
                        outcome: {}
                    },
                    {formResponse: {
                            addressLine1: 'a1', addressTown: 't1', postCode: 'S105NW', cautionedAgainstResident: 'No',
                            telephone: '07700000000',
                            residents: [{name: 'a', relationship: ''}]
                        },
                        outcome: {residents: {0: {relationship: 'Enter a relationship'}}}
                    },
                    {formResponse: {
                            addressLine1: 'a1', addressTown: 't1', postCode: 'S105NW', cautionedAgainstResident: 'No',
                            telephone: '07700000000',
                            residents: []
                        },
                        outcome: {}
                    },
                    {formResponse: {
                            addressLine1: 'a1', addressTown: 't1', postCode: 'S105NW', cautionedAgainstResident: 'No',
                            telephone: '07700000000',
                            residents: [{name: 'n', relationship: 'n'}, {name: '', relationship: 'n'}]
                        },
                        outcome: {residents: {1: {name: 'Enter a name'}}}
                    },
                    {formResponse: {
                            addressLine1: 'a1', addressTown: 't1', postCode: 'S105NW', cautionedAgainstResident: 'No',
                            telephone: '07700000000',
                            residents: [{name: 'n', relationship: 'n'}],
                            occupier: {name: 'o', relationship: 'r'}
                        },
                        outcome: {}
                    },
                    {formResponse: {
                            addressLine1: 'a1', addressTown: 't1', postCode: 'S105NW', cautionedAgainstResident: 'No',
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
                        expect(service.validateForm({formResponse, pageConfig, formType: 'curfewAddress'})).to.eql(outcome);
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
                {licence: invalidLicence, outcome: {proposedAddress: {curfewAddress: {addressLine1: 'Enter an address'}}}},
                {licence: {}, outcome: {proposedAddress: {curfewAddress: 'Please provide a curfew address'}}}
            ];

            options.forEach(option => {
                it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.licence)}`, () => {
                    const {outcome, licence} = option;
                    expect(service.validateFormGroup({licence, stage})).to.eql(outcome);
                });
            });

        });
    });


});
