const createLicenceService = require('../../server/services/licenceService');
const {expect, sandbox} = require('../testSetup');

describe('licenceService', () => {

    const licenceClient = {
        getLicence: sandbox.stub().returnsPromise().resolves({licence: {a: 'b'}}),
        createLicence: sandbox.stub().returnsPromise().resolves('abc'),
        updateSection: sandbox.stub().returnsPromise().resolves(),
        updateStage: sandbox.stub().returnsPromise().resolves(),
        getAdditionalConditions: sandbox.stub().returnsPromise().resolves([
            {user_input: 1, id: 1, field_position: null}]),
        updateLicence: sandbox.stub().returnsPromise().resolves()
    };

    const establishmentsClient = {
        findById: sandbox.stub().returnsPromise().resolves({a: 'b'})
    };

    const service = createLicenceService(licenceClient, establishmentsClient);

    afterEach(() => {
        sandbox.reset();
    });

    describe('getLicence', () => {
        it('should request licence details from client', () => {
            service.getLicence('123');

            expect(licenceClient.getLicence).to.be.calledOnce();
            expect(licenceClient.getLicence).to.be.calledWith('123');
        });

        it('should return licence', () => {
            return expect(service.getLicence('123')).to.eventually.eql({licence: {a: 'b'}, stage: undefined});
        });

        it('should throw if error getting licence', () => {
            licenceClient.getLicence.rejects();
            return expect(service.getLicence('123')).to.eventually.be.rejected();
        });
    });

    describe('createLicence', () => {
        it('should create a licence', () => {
            service.createLicence('123');

            expect(licenceClient.createLicence).to.be.calledOnce();
            expect(licenceClient.createLicence).to.be.calledWith('123', {});
        });

        it('should pass in a valid licence', () => {
            service.createLicence('123', {firstName: 'M', bad: '1'});

            expect(licenceClient.createLicence).to.be.calledOnce();
            expect(licenceClient.createLicence).to.be.calledWith('123', {firstName: 'M'});
        });

        it('should return returned id', () => {
            return expect(service.createLicence('123')).to.eventually.eql('abc');
        });

        it('should throw if error getting licence', () => {
            licenceClient.createLicence.rejects();
            return expect(service.createLicence('123')).to.eventually.be.rejected();
        });
    });

    describe('updateLicenceConditions', () => {

        it('should get the selected licence conditions', async () => {
            await service.updateLicenceConditions('ab1', {additionalConditions: {additional: {key: 'var'}}});

            expect(licenceClient.getAdditionalConditions).to.be.calledOnce();
            expect(licenceClient.getAdditionalConditions).to.be.calledWith({additional: {key: 'var'}});
        });

        it('should call update section with conditions from the licence client merged with existing', async () => {
            licenceClient.getLicence.resolves({
                licence: {
                    licenceConditions: {standard: {additionalConditionsRequired: 'Yes'}}
                }
            });
            licenceClient.getAdditionalConditions.resolves([
                {user_input: 1, id: 1, field_position: null}]);

            await service.updateLicenceConditions('ab1', {additionalConditions: '1'}, [{text: 'bespoke'}]);

            expect(licenceClient.updateSection).to.be.calledOnce();
            expect(licenceClient.updateSection).to.be.calledWith(
                'licenceConditions',
                'ab1',
                {
                    standard: {additionalConditionsRequired: 'Yes'},
                    additional: {1: {}},
                    bespoke: [{text: 'bespoke'}]
                }
            );
        });

        it('should throw if error updating licence', () => {
            licenceClient.updateSection.rejects();
            const args = {nomisId: 'ab1', additionalConditions: ['Scotland Street']};
            return expect(service.updateLicenceConditions(args)).to.eventually.be.rejected();
        });
    });

    describe('deleteLicenceCondition', () => {

        it('should remove additional condition by ID and call update section', async () => {
            licenceClient.getLicence.resolves({
                licence: {
                    licenceConditions: {
                        standard: {additionalConditionsRequired: 'Yes'},
                        additional: {1: {}, 2: {}, 3: {}},
                        bespoke: [{text: 'bespoke'}]
                    }
                }
            });

            await service.deleteLicenceCondition('ab1', '2');

            expect(licenceClient.updateSection).to.be.calledOnce();
            expect(licenceClient.updateSection).to.be.calledWith(
                'licenceConditions',
                'ab1',
                {
                    standard: {additionalConditionsRequired: 'Yes'},
                    additional: {1: {}, 3: {}},
                    bespoke: [{text: 'bespoke'}]
                }
            );
        });

        it('should remove bespoke condition by index when id is "bespoke-index", and call update section', async () => {
            licenceClient.getLicence.resolves({
                licence: {
                    licenceConditions: {
                        standard: {additionalConditionsRequired: 'Yes'},
                        additional: {1: {}, 2: {}, 'bespoke-1': {}},
                        bespoke: [{text: '0'}, {text: '1'}, {text: '2'}]
                    }
                }
            });

            await service.deleteLicenceCondition('ab1', 'bespoke-1');

            expect(licenceClient.updateSection).to.be.calledOnce();
            expect(licenceClient.updateSection).to.be.calledWith(
                'licenceConditions',
                'ab1',
                {
                    standard: {additionalConditionsRequired: 'Yes'},
                    additional: {1: {}, 2: {}, 'bespoke-1': {}},
                    bespoke: [{text: '0'}, {text: '2'}]
                }
            );
        });

        it('should throw if error updating licence', () => {
            licenceClient.updateSection.rejects();
            return expect(service.deleteLicenceCondition('ab1', 'bespoke-1')).to.eventually.be.rejected();
        });
    });

    describe('markForHandover', () => {

        it('should call updateStage from the licence client', () => {
            service.markForHandover('ab1', 'CA', 'RO');

            expect(licenceClient.updateStage).to.be.calledOnce();
            expect(licenceClient.updateStage).to.be.calledWith('ab1', 'PROCESSING_RO');
        });

        it('should pick the right stage based on sender and receiver', () => {
            service.markForHandover('ab1', 'CA', 'DM');
            expect(licenceClient.updateStage).to.be.calledWith('ab1', 'APPROVAL');

            service.markForHandover('ab1', 'DM', 'CA');
            expect(licenceClient.updateStage).to.be.calledWith('ab1', 'DECIDED');
        });

        it('should reverse to ELIGIBILITY when RO sends to CA after opt out', () => {

            service.markForHandover('ab1', 'RO', 'CA', {
                stage: 'PROCESSING_RO',
                licence: {proposedAddress: {optOut: {decision: 'Yes'}}}
            });
            expect(licenceClient.updateStage).to.be.calledWith('ab1', 'ELIGIBILITY');

            service.markForHandover('ab1', 'RO', 'CA', {
                stage: 'PROCESSING_RO',
                licence: {proposedAddress: {optOut: {decision: 'No'}}}
            });
            expect(licenceClient.updateStage).to.be.calledWith('ab1', 'PROCESSING_CA');
        });

        it('should throw if error during update status', () => {
            licenceClient.updateStage.rejects();
            return expect(service.markForHandover('ab1', 'CA', 'RO')).to.eventually.be.rejected();
        });

        it('should throw if no matching sender-receiver pair', () => {
            expect(() => service.markForHandover('ab1', 'CA', 'UNMATCHED')).to.throw(Error);
        });
    });


    describe('update', () => {

        const nomisId = 'ab1';

        const baseLicence = {
            section1: '',
            section2: '',
            section3: {},
            section4: {
                form1: {},
                form2: {answer: 'answer'}
            }
        };

        context('When there are dependents', () => {
            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4,
                    form3: {
                        decision: '',
                        followUp1: '',
                        followUp2: ''
                    }
                }

            };

            const fieldMap = [
                {decision: {}},
                {
                    followUp1: {
                        dependentOn: 'decision',
                        predicate: 'Yes'
                    }
                },
                {
                    followUp2: {
                        dependentOn: 'decision',
                        predicate: 'Yes'
                    }
                }

            ];

            it('should store dependents if predicate matches', async () => {
                const userInput = {
                    decision: 'Yes',
                    followUp1: 'County',
                    followUp2: 'Town'
                };

                const licenceSection = 'section4';
                const formName = 'form3';

                const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

                expect(output).to.eql({
                    ...licence,
                    section4: {
                        ...licence.section4,
                        form3: {
                            decision: 'Yes',
                            followUp1: 'County',
                            followUp2: 'Town'
                        }
                    }
                });
            });

            it('should remove dependents if predicate does not match', async () => {
                const userInput = {
                    decision: 'No',
                    followUp1: 'County',
                    followUp2: 'Town'
                };

                const licenceSection = 'section4';
                const formName = 'form3';

                const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

                expect(output).to.eql({
                    ...licence,
                    section4: {
                        ...licence.section4,
                        form3: {
                            decision: 'No'
                        }
                    }
                });
            });
        });

        context('When there are no dependents', () => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4,
                    form3: {
                        decision: '',
                        followUp1: '',
                        followUp2: ''
                    }
                }

            };

            const fieldMap = [
                {decision: {}},
                {followUp1: {}},
                {followUp2: {}}
            ];

            it('should store everything', async () => {
                const userInput = {
                    decision: 'Yes',
                    followUp1: 'County',
                    followUp2: 'Town'
                };

                const licenceSection = 'section4';
                const formName = 'form3';

                const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

                expect(output).to.eql({
                    ...licence,
                    section4: {
                        ...licence.section4,
                        form3: {
                            decision: 'Yes',
                            followUp1: 'County',
                            followUp2: 'Town'
                        }
                    }
                });
            });
        });
        it('should call updateLicence and pass in the licence', async () => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4,
                    form3: {
                        decision: '',
                        followUp1: '',
                        followUp2: ''
                    }
                }

            };

            const fieldMap = [
                {decision: {}},
                {followUp1: {}},
                {followUp2: {}}
            ];

            const userInput = {
                decision: 'Yes',
                followUp1: 'County',
                followUp2: 'Town'
            };

            const licenceSection = 'section4';
            const formName = 'form3';

            await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

            const expectedLicence = {
                ...licence,
                section4: {
                    ...licence.section4,
                    form3: {
                        decision: 'Yes',
                        followUp1: 'County',
                        followUp2: 'Town'
                    }
                }
            };
            expect(licenceClient.updateLicence).to.be.calledOnce();
            expect(licenceClient.updateLicence).to.be.calledWith('ab1', expectedLicence);
        });

        it('should add new form to the licence', async () => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {followUp1: {}},
                {followUp2: {}}
            ];

            const userInput = {
                decision: 'Yes',
                followUp1: 'County',
                followUp2: 'Town'
            };

            const licenceSection = 'section4';
            const formName = 'form3';

            const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

            const expectedLicence = {
                ...licence,
                section4: {
                    ...licence.section4,
                    form3: {
                        decision: 'Yes',
                        followUp1: 'County',
                        followUp2: 'Town'
                    }
                }
            };
            expect(output).to.eql(expectedLicence);
        });

        it('should add new section to the licence', async () => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {followUp1: {}},
                {followUp2: {}}
            ];

            const userInput = {
                decision: 'Yes',
                followUp1: 'County',
                followUp2: 'Town'
            };

            const licenceSection = 'section5';
            const formName = 'form3';

            const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

            const expectedLicence = {
                ...licence,
                section5: {
                    form3: {
                        decision: 'Yes',
                        followUp1: 'County',
                        followUp2: 'Town'
                    }
                }
            };
            expect(output).to.eql(expectedLicence);
        });

        it('should recurse if a field has inner contents', async () => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {
                    outer: {
                        contains: [
                            {innerQuestion: {}},
                            {innerQuestion2: {}},
                            {dependentAnswer: {dependentOn: 'innerQuestion2', predicate: 'Yes'}},
                            {
                                innerOuter: {
                                    contains: [
                                        {innerInner: {}}
                                    ]
                                }
                            }
                        ]
                    }
                },
                {followUp2: {}}
            ];

            const userInput = {
                decision: 'Yes',
                outer: {
                    innerQuestion: 'InnerAnswer',
                    innerQuestion2: 'Yes',
                    unwantedAnswer: 'unwanted',
                    dependentAnswer: 'depAnswer',
                    innerOuter: {
                        innerInner: 'here',
                        innerUnwanted: 'here2'
                    }
                },
                followUp2: 'Town'
            };

            const licenceSection = 'section5';
            const formName = 'form3';

            const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

            const expectedLicence = {
                ...licence,
                section5: {
                    form3: {
                        decision: 'Yes',
                        outer: {
                            innerQuestion: 'InnerAnswer',
                            innerQuestion2: 'Yes',
                            dependentAnswer: 'depAnswer',
                            innerOuter: {
                                innerInner: 'here'
                            }
                        },
                        followUp2: 'Town'
                    }
                }
            };
            expect(output).to.eql(expectedLicence);
        });

        it('should recurse through list items', async () => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {
                    listItem: {
                        isList: true,
                        contains: [
                            {innerQuestion: {}},
                            {innerQuestion2: {}},
                            {dependentAnswer: {dependentOn: 'innerQuestion2', predicate: 'Yes'}}
                        ]
                    }
                },
                {followUp2: {}}
            ];

            const userInput = {
                decision: 'Yes',
                listItem: [
                    {
                        innerQuestion: 'InnerAnswer',
                        innerQuestion2: 'No'
                    },
                    {
                        innerQuestion: 'InnerAnswer',
                        innerQuestion2: 'Yes',
                        unwantedAnswer: 'unwanted',
                        dependentAnswer: 'depAnswer'
                    }
                ],
                followUp2: 'Town'
            };

            const licenceSection = 'section5';
            const formName = 'form3';

            const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

            const expectedLicence = {
                ...licence,
                section5: {
                    form3: {
                        decision: 'Yes',
                        listItem: [
                            {
                                innerQuestion: 'InnerAnswer',
                                innerQuestion2: 'No'
                            },
                            {
                                innerQuestion: 'InnerAnswer',
                                innerQuestion2: 'Yes',
                                dependentAnswer: 'depAnswer'
                            }
                        ],
                        followUp2: 'Town'
                    }
                }
            };
            expect(output).to.eql(expectedLicence);
        });

        it('should filter out empty list items', async () => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {
                    listItem: {
                        isList: true,
                        contains: [
                            {innerQuestion: {}},
                            {innerQuestion2: {}}
                        ]
                    }
                },
                {followUp2: {}}
            ];

            const userInput = {
                decision: 'Yes',
                listItem: [
                    {
                        innerQuestion: 'InnerAnswer',
                        innerQuestion2: 'No'
                    },
                    {
                        innerQuestion: 'InnerAnswer2',
                        innerQuestion2: 'Yes'
                    },
                    {
                        innerQuestion: '',
                        innerQuestion2: ''
                    }
                ],
                followUp2: 'Town'
            };

            const licenceSection = 'section5';
            const formName = 'form3';

            const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

            const expectedLicence = {
                ...licence,
                section5: {
                    form3: {
                        decision: 'Yes',
                        listItem: [
                            {
                                innerQuestion: 'InnerAnswer',
                                innerQuestion2: 'No'
                            },
                            {
                                innerQuestion: 'InnerAnswer2',
                                innerQuestion2: 'Yes'
                            }
                        ],
                        followUp2: 'Town'
                    }
                }
            };
            expect(output).to.eql(expectedLicence);
        });

        it('should limit size of list by limitedBy flag', async () => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {
                    listItem: {
                        isList: true,
                        contains: [
                            {innerQuestion: {}},
                            {innerQuestion2: {}}
                        ],
                        limitedBy: {
                            field: 'limiter',
                            No: 1
                        }
                    }
                },
                {limiter: {}}
            ];

            const userInput = {
                decision: 'Yes',
                listItem: [
                    {
                        innerQuestion: 'InnerAnswer',
                        innerQuestion2: 'No'
                    },
                    {
                        innerQuestion: 'InnerAnswer2',
                        innerQuestion2: 'Yes'
                    }
                ],
                limiter: 'No'
            };

            const licenceSection = 'section5';
            const formName = 'form3';

            const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

            const expectedLicence = {
                ...licence,
                section5: {
                    form3: {
                        decision: 'Yes',
                        listItem: [
                            {
                                innerQuestion: 'InnerAnswer',
                                innerQuestion2: 'No'
                            }
                        ],
                        limiter: 'No'
                    }
                }
            };
            expect(output).to.eql(expectedLicence);
        });

        it('should filter out empty list items with recursion', async () => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {
                    listItem: {
                        isList: true,
                        contains: [
                            {innerQuestion: {}},
                            {
                                innerQuestion2: {
                                    contains: [
                                        {innerInner: {}}
                                    ]
                                }
                            }
                        ]
                    }
                },
                {followUp2: {}}
            ];

            const userInput = {
                decision: 'Yes',
                listItem: [
                    {
                        innerQuestion: 'InnerAnswer',
                        innerQuestion2: {
                            innerInner: 'innerInner'
                        }
                    },
                    {
                        innerQuestion: 'InnerAnswer2',
                        innerQuestion2: {
                            innerInner: 'innerInner'
                        }
                    },
                    {
                        innerQuestion: '',
                        innerQuestion2: {
                            innerInner: ''
                        }
                    }
                ],
                followUp2: 'Town'
            };

            const licenceSection = 'section5';
            const formName = 'form3';

            const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

            const expectedLicence = {
                ...licence,
                section5: {
                    form3: {
                        decision: 'Yes',
                        listItem: [
                            {
                                innerQuestion: 'InnerAnswer',
                                innerQuestion2: {
                                    innerInner: 'innerInner'
                                }
                            },
                            {
                                innerQuestion: 'InnerAnswer2',
                                innerQuestion2: {
                                    innerInner: 'innerInner'
                                }
                            }
                        ],
                        followUp2: 'Town'
                    }
                }
            };
            expect(output).to.eql(expectedLicence);
        });
    });

    describe('updateAddress', () => {

        const baseLicence = {
            proposedAddress: {
                curfewAddress: {
                    addresses: [
                        {postCode: 'pc1'},
                        {postCode: 'pc2'}
                    ]
                }
            }
        };


        it('should add form items to correct address', async () => {

            const output = await service.updateAddress({
                index: 1,
                licence: baseLicence,
                userInput: {newField: 'newField'},
                fieldMap: [{newField: {}}]
            });

            const expectedOutput = {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {postCode: 'pc1'},
                            {postCode: 'pc2', newField: 'newField'}
                        ]
                    }
                }
            };

            expect(output).to.eql(expectedOutput);
        });

        it('should use the form config', async () => {
            const output = await service.updateAddress({
                index: 0,
                licence: baseLicence,
                userInput: {newField: 'newField', unwantedField: 'unwanted'},
                fieldMap: [{newField: {}}]
            });

            const expectedOutput = {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {postCode: 'pc1', newField: 'newField'},
                            {postCode: 'pc2'}
                        ]
                    }
                }
            };

            expect(output).to.eql(expectedOutput);
        });

        it('should not change the rest of the licence', async () => {
            const output = await service.updateAddress({
                index: 0,
                licence: {...baseLicence, otherfield: 'other'},
                userInput: {newField: 'newField', unwantedField: 'unwanted'},
                fieldMap: [{newField: {}}]
            });

            const expectedOutput = {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {postCode: 'pc1', newField: 'newField'},
                            {postCode: 'pc2'}
                        ]
                    }
                },
                otherfield: 'other'
            };

            expect(output).to.eql(expectedOutput);
        });

        it('should update the saved licence', async () => {
            await service.updateAddress({
                nomisId: 1,
                index: 0,
                licence: baseLicence,
                userInput: {newField: 'newField', unwantedField: 'unwanted'},
                fieldMap: [{newField: {}}]
            });

            const expectedOutput = {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {postCode: 'pc1', newField: 'newField'},
                            {postCode: 'pc2'}
                        ]
                    }
                }
            };

            expect(licenceClient.updateLicence).to.be.calledOnce();
            expect(licenceClient.updateLicence).to.be.calledWith(1, expectedOutput);
        });
    });

    describe('validateLicence', () => {

        const curfewAddressReview = {
            consent: 'Yes',
            electricity: 'Yes',
            homeVisitConducted: 'Yes'
        };

        const addressSafety = {
            deemedSafe: 'Yes',
            unsafeReason: ''
        };

        const curfewHours = {
            firstNightFrom: '09:00',
            firstNightUntil: '09:00',
            mondayFrom: '09:00',
            mondayUntil: '09:00',
            tuesdayFrom: '09:00',
            tuesdayUntil: '09:00',
            wednesdayFrom: '09:00',
            wednesdayUntil: '09:00',
            thursdayFrom: '09:00',
            thursdayUntil: '09:00',
            fridayFrom: '09:00',
            fridayUntil: '09:00',
            saturdayFrom: '09:00',
            saturdayUntil: '09:00',
            sundayFrom: '09:00',
            sundayUntil: '09:00'
        };

        const riskManagement = {
            planningActions: 'No',
            planningActionsDetails: '',
            awaitingInformation: 'No',
            awaitingInformationDetails: '',
            victimLiaison: 'No',
            victimLiaisonDetails: ''
        };

        const reportingInstructions = {
            name: 'name',
            buildingAndStreet1: 'name',
            buildingAndStreet2: 'name',
            townOrCity: 'name',
            postcode: 'name',
            telephone: 'name'
        };

        const standard = {
            additionalConditionsRequired: 'No'
        };

        const eligibility = {
            excluded: {
                decision: 'No',
                reason: ''
            },
            suitability: {
                decision: 'No',
                reason: ''
            },
            crdTime: {
                decision: 'No'
            }
        };

        it('should return error if section is missing from licence', () => {
            const licence = {};

            const expectedOutput = [
                {path: ['eligibility'], type: 'any.required', message: 'eligibility is required'},
                {path: ['proposedAddress'], type: 'any.required', message: 'proposedAddress is required'}
            ];

            expect(service.validateLicence(licence, 'ELIGIBILITY')).to.eql(expectedOutput);

        });

        context('Eligibility', () => {
            const validEligibility = {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [{
                            addressLine1: 'line1',
                            addressTown: 'town',
                            postCode: 'pc',
                            telephone: '123',
                            occupier: {
                                name: 'occupier',
                                relation: 'rel',
                                age: ''
                            },
                            residents: [
                                {
                                    name: 'occupier',
                                    relation: 'rel',
                                    age: ''
                                }
                            ],
                            cautionedAgainstResident: 'No'
                        }]
                    }
                },
                eligibility
            };

            it('should return null if the licence is valid', () => {
                expect(service.validateLicence(validEligibility, 'ELIGIBILITY')).to.eql([]);
            });

            it('should return error if required field not provided', () => {

                const missingField = {
                    eligibility: {
                        excluded: {
                            decision: 'Yes',
                            reason: 'this reason'
                        },
                        suitability: {
                            decision: ''
                        },
                        crdTime: {
                            decision: 'No'
                        }
                    }
                };

                expect(service.validateLicence(missingField, 'ELIGIBILITY')[0].path).to.eql(
                    ['suitability', 'decision']);
            });
        });

        context('proposedAddress', () => {

            it('should return error if required field not provided', () => {

                const missingFieldProposedAddress = {
                    eligibility,
                    proposedAddress: {
                        curfewAddress: {
                            addresses: [{
                                addressLine1: '',
                                addressTown: 'town',
                                postCode: 'pc',
                                telephone: '123',
                                occupier: {
                                    name: 'occupier',
                                    relation: 'rel',
                                    age: ''
                                },
                                residents: [
                                    {
                                        name: 'occupier',
                                        relation: 'rel',
                                        age: ''
                                    }
                                ],
                                cautionedAgainstResident: 'No'
                            }]
                        }
                    }
                };

                expect(service.validateLicence(missingFieldProposedAddress, 'ELIGIBILITY')[0].path).to.eql(
                    ['curfewAddress', 'addresses', 0, 'addressLine1']);
            });

            it('should allow empty residents list', () => {

                const emptyResidents = {
                    eligibility,
                    proposedAddress: {
                        curfewAddress: {
                            addresses: [{
                                    addressLine1: 'address1',
                                addressTown: 'town',
                                postCode: 'pc',
                                telephone: '123',
                                occupier: {
                                    name: 'occupier',
                                    relation: 'rel',
                                    age: ''
                                },
                                residents: [],
                                cautionedAgainstResident: 'No'
                            }]
                        }
                    }
                };

                expect(service.validateLicence(emptyResidents, 'ELIGIBILITY')).to.eql([]);
            });

            it('should not allow empty occupier object', () => {

                const emptyOccupier = {
                    eligibility,
                    proposedAddress: {
                        curfewAddress: {
                            addresses: [{
                                addressLine1: '',
                                addressTown: 'town',
                                postCode: 'pc',
                                telephone: '123',
                                occupier: {
                                    name: '',
                                    relation: '',
                                    age: ''
                                },
                                residents: [],
                                cautionedAgainstResident: 'No'
                            }]
                        }
                    }
                };

                expect(service.validateLicence(emptyOccupier, 'ELIGIBILITY')[0].path).to.eql(
                    ['curfewAddress', 'addresses', 0, 'addressLine1']);

                expect(service.validateLicence(emptyOccupier, 'ELIGIBILITY')[1].path).to.eql(
                    ['curfewAddress', 'addresses', 0, 'occupier', 'name']);
            });
        });

        context('Multiple sections', () => {

            const licence = {
                eligibility: {
                    excluded: {
                        decision: 'Yes',
                        reason: 'this reason'
                    },
                    suitability: {
                        decision: ''
                    },
                    crdTime: {
                        decision: 'No'
                    }
                },
                proposedAddress: {
                    curfewAddress: {
                        addresses: [{
                            addressLine1: '',
                            addressTown: 'town',
                            postCode: 'pc',
                            telephone: '123',
                            occupier: {
                                name: 'Res',
                                relation: 'Rel',
                                age: '18'
                            },
                            residents: [],
                            cautionedAgainstResident: 'No'
                        }]
                    }
                }
            };

            it('should validate all sections asked for', () => {

                const output = service.validateLicence(licence, 'ELIGIBILITY');

                expect(output.length).to.eql(2);

                expect(output[0].path).to.eql(
                    ['suitability', 'decision']);

                expect(output[1].path).to.eql(
                    ['curfewAddress', 'addresses', 0, 'addressLine1']);

            });
        });

        context('PROCESSING_RO', () => {

            const baseLicence = {
                curfew: {
                    curfewAddressReview,
                    addressSafety,
                    curfewHours
                },
                risk: {
                    riskManagement
                },
                reporting: {
                    reportingInstructions
                },
                licenceConditions: {
                    standard
                }
            };

            it('should return [] for no errors', () => {

                const output = service.validateLicence(baseLicence, 'PROCESSING_RO');

                expect(output).to.eql([]);

            });


            it('should require all sections for the processing stage', () => {

                const newLicence = {
                    curfew: {
                        curfewAddressReview,
                        addressSafety,
                        curfewHours
                    },
                    risk: {
                        riskManagement
                    },
                    licenceConditions: {
                        standard
                    }
                };

                const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                expect(output).to.eql([{
                    message: 'reporting is required',
                    path: [
                        'reporting'
                    ],
                    type: 'any.required'
                }]);

            });

            it('should require an answer for curfew address review', () => {

                const licence = {
                    ...baseLicence,
                    curfew: {
                        ...baseLicence.curfew,
                        curfewAddressReview: {
                            consent: ''
                        }
                    }
                };

                const output = service.validateLicence(licence, 'PROCESSING_RO');

                expect(output.length).to.eql(1);
                expect(output[0].path).to.eql(['curfewAddressReview', 'consent']);
            });

            it('should require an answer for electricity if consent is yes', () => {

                const licence = {
                    ...baseLicence,
                    curfew: {
                        ...baseLicence.curfew,
                        curfewAddressReview: {
                            consent: 'Yes',
                            electricity: ''
                        }
                    }
                };

                const output = service.validateLicence(licence, 'PROCESSING_RO');

                expect(output.length).to.eql(1);
                expect(output[0].path).to.eql(['curfewAddressReview', 'electricity']);
            });

            it('should require an answer for homeVisitConducted if electricity is yes', () => {

                const licence = {
                    ...baseLicence,
                    curfew: {
                        ...baseLicence.curfew,
                        curfewAddressReview: {
                            consent: 'Yes',
                            electricity: 'Yes',
                            homeVisitConducted: ''
                        }
                    }
                };

                const output = service.validateLicence(licence, 'PROCESSING_RO');

                expect(output.length).to.eql(1);
                expect(output[0].path).to.eql(['curfewAddressReview', 'homeVisitConducted']);
            });

            it('should require an answer for address safety', () => {

                const licence = {
                    ...baseLicence,
                    curfew: {
                        ...baseLicence.curfew,
                        addressSafety: {
                            deemedSafe: ''
                        }
                    }
                };

                const output = service.validateLicence(licence, 'PROCESSING_RO');

                expect(output.length).to.eql(1);
                expect(output[0].path).to.eql(['addressSafety', 'deemedSafe']);
            });

            it('should require a reason if deemedSafe is no', () => {

                const licence = {
                    ...baseLicence,
                    curfew: {
                        ...baseLicence.curfew,
                        addressSafety: {
                            deemedSafe: 'No'
                        }
                    }
                };

                const output = service.validateLicence(licence, 'PROCESSING_RO');

                expect(output.length).to.eql(1);
                expect(output[0].path).to.eql(['addressSafety', 'unsafeReason']);
            });

            it('should require curfew hours', () => {

                const licence = {
                    ...baseLicence,
                    curfew: {
                        ...baseLicence.curfew,
                        curfewHours: {
                            ...baseLicence.curfew.curfewHours,
                            wednesdayFrom: ''
                        }
                    }
                };

                const output = service.validateLicence(licence, 'PROCESSING_RO');

                expect(output.length).to.eql(1);
                expect(output[0].path).to.eql(['curfewHours', 'wednesdayFrom']);
            });

            it('should require an answer for planning actions, awaiting information and victim liaison', () => {

                const licence = {
                    ...baseLicence,
                    risk: {
                        riskManagement: {
                            planningActions: '',
                            awaitingInformation: '',
                            victimLiaison: ''
                        }
                    }
                };

                const output = service.validateLicence(licence, 'PROCESSING_RO');

                expect(output.length).to.eql(3);

                expect(output[0].path).to.eql(['riskManagement', 'planningActions']);
                expect(output[1].path).to.eql(['riskManagement', 'awaitingInformation']);
                expect(output[2].path).to.eql(['riskManagement', 'victimLiaison']);
            });

            it('should require reasons for planning actions, awaiting information and victim liaison if Yes', () => {

                const licence = {
                    ...baseLicence,
                    risk: {
                        riskManagement: {
                            planningActions: 'Yes',
                            awaitingInformation: 'Yes',
                            victimLiaison: 'Yes'
                        }
                    }
                };

                const output = service.validateLicence(licence, 'PROCESSING_RO');

                expect(output.length).to.eql(3);

                expect(output[0].path).to.eql(['riskManagement', 'planningActionsDetails']);
                expect(output[1].path).to.eql(['riskManagement', 'awaitingInformationDetails']);
                expect(output[2].path).to.eql(['riskManagement', 'victimLiaisonDetails']);
            });

            it('should require reporting instructions fields', () => {

                const licence = {
                    ...baseLicence,
                    reporting: {
                        reportingInstructions: {

                        }
                    }
                };

                const output = service.validateLicence(licence, 'PROCESSING_RO');

                expect(output.length).to.eql(5);

                expect(output[0].path).to.eql(['reportingInstructions', 'name']);
                expect(output[1].path).to.eql(['reportingInstructions', 'buildingAndStreet1']);
                expect(output[2].path).to.eql(['reportingInstructions', 'townOrCity']);
                expect(output[3].path).to.eql(['reportingInstructions', 'postcode']);
                expect(output[4].path).to.eql(['reportingInstructions', 'telephone']);
            });

            describe('additional conditions validation', () => {

                it('should return no error if there are no additional conditions', () => {
                    const output = service.validateLicence(baseLicence, 'PROCESSING_RO');

                    expect(output.length).to.eql(0);
                });

                context('NOCONTACTASSOCIATE', () => {
                    it('should return no error if groupsOrOrganisation is entered', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NOCONTACTASSOCIATE: {
                                        groupsOrOrganisation: 'ngr'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if groupsOrOrganisation is not', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NOCONTACTASSOCIATE: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(
                            ['additional', 'NOCONTACTASSOCIATE', 'groupsOrOrganisation']);
                    });
                });

                context('INTIMATERELATIONSHIP', () => {
                    it('should return no error if intimateGender is entered', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    INTIMATERELATIONSHIP: {
                                        intimateGender: 'a'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if groupsOrOrganisation is not', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    INTIMATERELATIONSHIP: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(
                            ['additional', 'INTIMATERELATIONSHIP', 'intimateGender']);
                    });
                });

                context('NOCONTACTNAMED', () => {
                    it('should return no error if noContactOffenders is entered', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NOCONTACTNAMED: {
                                        noContactOffenders: 'a'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if noContactOffenders is not', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NOCONTACTNAMED: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(
                            ['additional', 'NOCONTACTNAMED', 'noContactOffenders']);
                    });
                });

                context('NORESIDE', () => {
                    it('should return no error if notResideWithGender and notResideWithAge are filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NORESIDE: {
                                        notResideWithGender: 'a',
                                        notResideWithAge: '13'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if noContactOffenders is not', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NORESIDE: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(2);
                        expect(output[0].path).to.eql(
                            ['additional', 'NORESIDE', 'notResideWithGender']);
                        expect(output[1].path).to.eql(
                            ['additional', 'NORESIDE', 'notResideWithAge']);
                    });
                });

                context('NOUNSUPERVISEDCONTACT', () => {
                    it('should return no error if unsupervisedContactGender, unsupervisedContactAge and ' +
                        'unsupervisedContactSocial are filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NOUNSUPERVISEDCONTACT: {
                                        unsupervisedContactGender: 'a',
                                        unsupervisedContactAge: '13',
                                        unsupervisedContactSocial: 'b'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if unsupervisedContactGender, unsupervisedContactAge or ' +
                        'unsupervisedContactSocial are not filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NOUNSUPERVISEDCONTACT: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(3);
                        expect(output[0].path).to.eql(
                            ['additional', 'NOUNSUPERVISEDCONTACT', 'unsupervisedContactGender']);
                        expect(output[1].path).to.eql(
                            ['additional', 'NOUNSUPERVISEDCONTACT', 'unsupervisedContactAge']);
                        expect(output[2].path).to.eql(
                            ['additional', 'NOUNSUPERVISEDCONTACT', 'unsupervisedContactSocial']);
                    });
                });

                context('NOCHILDRENSAREA', () => {
                    it('should return no error if notInSightOf is filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NOCHILDRENSAREA: {
                                        notInSightOf: 'a'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if notInSightOf is not filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NOCHILDRENSAREA: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(
                            ['additional', 'NOCHILDRENSAREA', 'notInSightOf']);
                    });
                });

                context('NOWORKWITHAGE', () => {
                    it('should return no error if noWorkWithAge is filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NOWORKWITHAGE: {
                                        noWorkWithAge: '12'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if noWorkWithAge is not filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NOWORKWITHAGE: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(
                            ['additional', 'NOWORKWITHAGE', 'noWorkWithAge']);
                    });
                });

                context('NOCOMMUNICATEVICTIM', () => {
                    it('should return no error if victimFamilyMembers and socialServicesDept are filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NOCOMMUNICATEVICTIM: {
                                        victimFamilyMembers: 'a',
                                        socialServicesDept: '13'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if noContactOffenders is not', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NOCOMMUNICATEVICTIM: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(2);
                        expect(output[0].path).to.eql(
                            ['additional', 'NOCOMMUNICATEVICTIM', 'victimFamilyMembers']);
                        expect(output[1].path).to.eql(
                            ['additional', 'NOCOMMUNICATEVICTIM', 'socialServicesDept']);
                    });
                });

                context('COMPLYREQUIREMENTS', () => {
                    it('should return no error if courseOrCentre is filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    COMPLYREQUIREMENTS: {
                                        courseOrCentre: '12'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if courseOrCentre is not filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    COMPLYREQUIREMENTS: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(
                            ['additional', 'COMPLYREQUIREMENTS', 'courseOrCentre']);
                    });
                });

                context('ATTEND', () => {
                    it('should return no error if appointmentDate, appointmentTime and appointmentAddress ' +
                        'are filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    ATTEND: {
                                        appointmentDate: '2019-12-26',
                                        appointmentTime: '13',
                                        appointmentAddress: 'address'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if appointmentDate, appointmentTime and appointmentAddress ' +
                        'are not filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    ATTEND: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(3);
                        expect(output[0].path).to.eql(
                            ['additional', 'ATTEND', 'appointmentDate']);
                        expect(output[1].path).to.eql(
                            ['additional', 'ATTEND', 'appointmentTime']);
                        expect(output[2].path).to.eql(
                            ['additional', 'ATTEND', 'appointmentAddress']);
                    });

                    it('should return error if appointmentDate is not in the format YYYY-MM-DD', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    ATTEND: {
                                        appointmentDate: '26/12/2018',
                                        appointmentTime: '13',
                                        appointmentAddress: 'address'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(
                            ['additional', 'ATTEND', 'appointmentDate']);
                    });
                });

                context('ATTENDALL', () => {
                    it('should return no error if appointmentName is filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    ATTENDALL: {
                                        appointmentName: '12'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if appointmentName is not filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    ATTENDALL: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(
                            ['additional', 'ATTENDALL', 'appointmentName']);
                    });
                });

                context('HOMEVISITS', () => {
                    it('should return no error if mentalHealthName is filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    HOMEVISITS: {
                                        mentalHealthName: '12'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if mentalHealthName is not filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    HOMEVISITS: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(
                            ['additional', 'HOMEVISITS', 'mentalHealthName']);
                    });
                });

                context('REMAINADDRESS', () => {
                    it('should return no error if curfewAddress, curfewFrom, curfewTo and curfewTagRequired' +
                        'are filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    REMAINADDRESS: {
                                        curfewAddress: 'a',
                                        curfewFrom: 'b',
                                        curfewTo: 'c',
                                        curfewTagRequired: 'd'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if curfewAddress, curfewFrom, curfewTo and curfewTagRequired ' +
                        'are not filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    REMAINADDRESS: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(4);
                        expect(output[0].path).to.eql(
                            ['additional', 'REMAINADDRESS', 'curfewAddress']);
                        expect(output[1].path).to.eql(
                            ['additional', 'REMAINADDRESS', 'curfewFrom']);
                        expect(output[2].path).to.eql(
                            ['additional', 'REMAINADDRESS', 'curfewTo']);
                        expect(output[3].path).to.eql(
                            ['additional', 'REMAINADDRESS', 'curfewTagRequired']);
                    });
                });

                context('CONFINEADDRESS', () => {
                    it('should return no error if confinedTo, confinedFrom and confinedReviewFrequency' +
                        'are filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    CONFINEADDRESS: {
                                        confinedTo: 'a',
                                        confinedFrom: 'b',
                                        confinedReviewFrequency: 'c'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if confinedTo, confinedFrom and confinedReviewFrequency ' +
                        'are not filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    CONFINEADDRESS: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(3);
                        expect(output[0].path).to.eql(
                            ['additional', 'CONFINEADDRESS', 'confinedTo']);
                        expect(output[1].path).to.eql(
                            ['additional', 'CONFINEADDRESS', 'confinedFrom']);
                        expect(output[2].path).to.eql(
                            ['additional', 'CONFINEADDRESS', 'confinedReviewFrequency']);
                    });
                });

                context('REPORTTO', () => {
                    it('should return no error if reportingAddress, reportingTime and reportingFrequency' +
                        'are filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    REPORTTO: {
                                        reportingAddress: 'a',
                                        reportingTime: 'b',
                                        reportingDaily: '',
                                        reportingFrequency: 'c'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return no error if reportingAddress, reportingDaily and reportingFrequency' +
                        'are filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    REPORTTO: {
                                        reportingAddress: 'a',
                                        reportingTime: '',
                                        reportingDaily: 'b',
                                        reportingFrequency: 'c'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if reportingTime and reportingFrequency are both filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    REPORTTO: {
                                        reportingAddress: 'a',
                                        reportingTime: 'b',
                                        reportingDaily: 'c',
                                        reportingFrequency: 'c'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(['additional', 'REPORTTO', 'reportingDaily']);
                    });

                    it('should return error if reportingTime and reportingFrequency are both empty', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    REPORTTO: {
                                        reportingAddress: 'a',
                                        reportingTime: '',
                                        reportingDaily: '',
                                        reportingFrequency: 'c'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(['additional', 'REPORTTO', 'reportingDaily']);
                    });

                    it('should return error if confinedTo, confinedFrom and confinedReviewFrequency ' +
                        'are not filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    REPORTTO: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(2);
                        expect(output[0].path).to.eql(
                            ['additional', 'REPORTTO', 'reportingAddress']);
                        expect(output[1].path).to.eql(
                            ['additional', 'REPORTTO', 'reportingFrequency']);
                    });
                });

                context('VEHICLEDETAILS', () => {
                    it('should return no error if vehicleDetails is filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    VEHICLEDETAILS: {
                                        vehicleDetails: 'fe'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if vehicleDetails is not filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    VEHICLEDETAILS: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(
                            ['additional', 'VEHICLEDETAILS', 'vehicleDetails']);
                    });
                });

                context('EXCLUSIONADDRESS', () => {
                    it('should return no error if noEnterPlace is filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    EXCLUSIONADDRESS: {
                                        noEnterPlace: 'fe'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if noEnterPlace is not filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    EXCLUSIONADDRESS: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(
                            ['additional', 'EXCLUSIONADDRESS', 'noEnterPlace']);
                    });
                });

                context('EXCLUSIONAREA', () => {
                    it('should return no error if exclusionArea is filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    EXCLUSIONAREA: {
                                        exclusionArea: 'fe'
                                    }
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });

                    it('should return error if exclusionArea is not filled in', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    EXCLUSIONAREA: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(1);
                        expect(output[0].path).to.eql(
                            ['additional', 'EXCLUSIONAREA', 'exclusionArea']);
                    });
                });

                context('Conditions with no extra information', () => {
                    it('should return no error if conditions selected', () => {

                        const newLicence = {
                            ...baseLicence,
                            licenceConditions: {
                                ...baseLicence.licenceConditions,
                                additional: {
                                    NOTIFYRELATIONSHIP: {},
                                    NOCONTACTPRISONER: {},
                                    NOCONTACTSEXOFFENDER: {},
                                    CAMERAAPPROVAL: {},
                                    NOCAMERA: {},
                                    NOCAMERAPHONE: {},
                                    USAGEHISTORY: {},
                                    NOINTERNET: {},
                                    ONEPHONE: {},
                                    RETURNTOUK: {},
                                    SURRENDERPASSPORT: {},
                                    NOTIFYPASSPORT: {}
                                }
                            }
                        };

                        const output = service.validateLicence(newLicence, 'PROCESSING_RO');

                        expect(output.length).to.eql(0);
                    });
                });
            });

        });
    });
});
