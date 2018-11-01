const createLicenceService = require('../../server/services/licenceService');

describe('licenceService', () => {
    let licenceClient;
    let service;

    const establishmentsClient = {
        findById: sinon.stub().resolves({a: 'b'})
    };

    beforeEach(() => {
        licenceClient = {
            getLicence: sinon.stub().resolves({licence: {a: 'b'}}),
            createLicence: sinon.stub().resolves('abc'),
            updateSection: sinon.stub().resolves(),
            updateStage: sinon.stub().resolves(),
            getAdditionalConditions: sinon.stub().resolves([
                {user_input: 1, id: 1, field_position: null}]),
            updateLicence: sinon.stub().resolves(),
            updateStageAndVersion: sinon.stub().resolves(),
            getApprovedLicenceVersion: sinon.stub().resolves()
        };
        service = createLicenceService(licenceClient, establishmentsClient);
    });

    describe('getLicence', () => {
        it('should request licence details from client', () => {
            service.getLicence('123');

            expect(licenceClient.getLicence).to.be.calledOnce();
            expect(licenceClient.getLicence).to.be.calledWith('123');
        });

        it('should return licence', () => {
            return expect(service.getLicence('123')).to.eventually.eql({
                licence: {a: 'b'},
                stage: undefined,
                version: undefined,
                approvedVersion: undefined,
                approvedVersionDetails: undefined
            });
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

        it('should pass in the licence', () => {
            service.createLicence('123', {firstName: 'M'});

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
        let existingLicence;

        beforeEach(() => {
            existingLicence = {licence: {a: 'b'}};
        });

        it('should get the selected licence conditions', async () => {
            await service.updateLicenceConditions('ab1', existingLicence, {additionalConditions: {additional: {key: 'var'}}});

            expect(licenceClient.getAdditionalConditions).to.be.calledOnce();
            expect(licenceClient.getAdditionalConditions).to.be.calledWith({additional: {key: 'var'}});
        });

        it('should call update section with conditions from the licence client merged with existing', async () => {
            const existingLicence = {
                licence: {
                    licenceConditions: {standard: {additionalConditionsRequired: 'Yes'}}
                }
            };
            licenceClient.getAdditionalConditions.resolves([
                {user_input: 1, id: 1, field_position: null}]);

            await service.updateLicenceConditions('ab1', existingLicence, {additionalConditions: '1'}, [{text: 'bespoke'}]);

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

        it('should not call update section if no changes have been made', async () => {
            const existingLicence = {
                licence: {
                    licenceConditions:
                        {
                            standard: {additionalConditionsRequired: 'Yes'},
                            additional: {1: {}},
                            bespoke: [{text: 'bespoke'}]
                        }
                }
            };
            licenceClient.getAdditionalConditions.resolves([
                {user_input: 1, id: 1, field_position: null}]);

            await service.updateLicenceConditions('ab1', existingLicence, {additionalConditions: '1'}, [{text: 'bespoke'}]);

            expect(licenceClient.updateSection).to.not.be.called();
        });

        it('should throw if error updating licence', () => {
            licenceClient.updateSection.rejects();
            const args = {bookingId: 'ab1', existingLicence, additionalConditions: ['Scotland Street']};
            return expect(service.updateLicenceConditions(args)).to.eventually.be.rejected();
        });

        describe('post approval modifications', () => {

            it('should change stage to MODIFIED_APPROVAL when updates occur', async () => {
                const existingLicence = {stage: 'DECIDED', licence: {a: 'b'}};
                await service.updateLicenceConditions('ab1', existingLicence, {additionalConditions: {additional: {key: 'var'}}});

                expect(licenceClient.updateStage).to.be.calledOnce();
                expect(licenceClient.updateStage).to.be.calledWith('ab1', 'MODIFIED_APPROVAL');
            });

            it('should change stage to MODIFIED_APPROVAL when updates occur in MODIFIED stage', async () => {
                const existingLicence = {stage: 'MODIFIED', licence: {a: 'b'}};
                await service.updateLicenceConditions('ab1', existingLicence, {additionalConditions: {additional: {key: 'var'}}});

                expect(licenceClient.updateStage).to.be.calledOnce();
                expect(licenceClient.updateStage).to.be.calledWith('ab1', 'MODIFIED_APPROVAL');
            });

            it('should not change stage if not DECIDED', async () => {
                const existingLicence = {stage: 'PROCESSING_RO', licence: {a: 'b'}};
                await service.updateLicenceConditions('ab1', existingLicence, {additionalConditions: {additional: {key: 'var'}}});

                expect(licenceClient.updateStage).to.not.be.calledOnce();
            });

            it('should not change stage if no changes', async () => {
                const existingLicence = {
                    stage: 'PROCESSING_RO',
                    licence: {licenceConditions: {additionalConditions: {additional: {key: 'var'}}}}
                };
                await service.updateLicenceConditions('ab1', existingLicence, {additionalConditions: {additional: {key: 'var'}}});

                expect(licenceClient.updateStage).to.not.be.calledOnce();
            });
        });
    });

    describe('deleteLicenceCondition', () => {

        it('should remove additional condition by ID and call update section', async () => {
            const existingLicence = {
                licence: {
                    licenceConditions: {
                        standard: {additionalConditionsRequired: 'Yes'},
                        additional: {1: {}, 2: {}, 3: {}},
                        bespoke: [{text: 'bespoke'}]
                    }
                }
            };

            await service.deleteLicenceCondition('ab1', existingLicence, '2');

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
            const existingLicence = {
                licence: {
                    licenceConditions: {
                        standard: {additionalConditionsRequired: 'Yes'},
                        additional: {1: {}, 2: {}, 'bespoke-1': {}},
                        bespoke: [{text: '0'}, {text: '1'}, {text: '2'}]
                    }
                }
            };

            await service.deleteLicenceCondition('ab1', existingLicence, 'bespoke-1');

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
            return expect(service.deleteLicenceCondition('ab1', {}, 'bespoke-1')).to.eventually.be.rejected();
        });
    });

    describe('markForHandover', () => {

        it('should call updateStage from the licence client', () => {
            service.markForHandover('ab1', 'caToRo');

            expect(licenceClient.updateStage).to.be.calledOnce();
            expect(licenceClient.updateStage).to.be.calledWith('ab1', 'PROCESSING_RO');
        });

        it('should change stage according to transition', () => {
            service.markForHandover('ab1', 'caToDm');
            expect(licenceClient.updateStage).to.be.calledWith('ab1', 'APPROVAL');
        });

        it('should return to ELIGIBILITY when RO sends to CA after opt out', () => {
            service.markForHandover('ab1', 'roToCaOptedOut');
            expect(licenceClient.updateStage).to.be.calledWith('ab1', 'ELIGIBILITY');
        });

        it('should return to ELIGIBILITY when RO sends to CA after address rejected', () => {
            service.markForHandover('ab1', 'roToCaAddressRejected');
            expect(licenceClient.updateStage).to.be.calledWith('ab1', 'ELIGIBILITY');
        });

        it('should send to PROCESSING_CA if transition type of dmToCaReturn is passed in', () => {

            service.markForHandover(
                'ab1',
                'dmToCaReturn'
            );
            expect(licenceClient.updateStage).to.be.calledWith('ab1', 'PROCESSING_CA');
        });

        it('should throw if error during update status', () => {
            licenceClient.updateStage.rejects();
            return expect(service.markForHandover('ab1', 'caToRo')).to.eventually.be.rejected();
        });

        it('should throw if no matching transition type', () => {
            expect(() => service.markForHandover('ab1', 'caToBlah')).to.throw(Error);
        });
    });

    describe('removeDecision', () => {

        const licence = {
            licence: {
                approval: {
                    release: {
                        decision: 'Yes'
                    },
                    also: 'This'
                },
                somethingElse: 'Yes'
            }
        };

        it('should call updateStage from the licence client', async () => {
            await service.removeDecision('ab1', licence);

            expect(licenceClient.updateLicence).to.be.calledOnce();
            expect(licenceClient.updateLicence).to.be.calledWith('ab1', {somethingElse: 'Yes'});
        });
    });

    describe('addSplitDateFields', () => {
        it('should add day, month and year fields to split dates', () => {
            const rawData = {
                someDate: '12/03/2019',
                somethingElse: '19/03/2019'
            };
            const formFieldsConfig = [
                {someDate: {splitDate: {day: 'someDay', month: 'someMonth', year: 'someYear'}}},
                {somethingElse: {}}
            ];

            expect(service.addSplitDateFields(rawData, formFieldsConfig)).to.eql(
                {
                    someDate: '12/03/2019',
                    someDay: '12',
                    someMonth: '03',
                    someYear: '2019',
                    somethingElse: '19/03/2019'
                }
            );
        });

        it('should return as is if date is invalid', () => {
            const rawData = {
                someDate: '43/03/2019',
                somethingElse: '19/03/2019'
            };
            const formFieldsConfig = [
                {someDate: {splitDate: {day: 'someDay', month: 'someMonth', year: 'someYear'}}},
                {somethingElse: {}}
            ];

            expect(service.addSplitDateFields(rawData, formFieldsConfig)).to.eql(
                {
                    someDate: '43/03/2019',
                    somethingElse: '19/03/2019'
                }
            );
        });

        it('should return as is if date field is missing', () => {
            const rawData = {
                somethingElse: '19/03/2019'
            };
            const formFieldsConfig = [
                {someDate: {splitDate: {day: 'someDay', month: 'someMonth', year: 'someYear'}}},
                {somethingElse: {}}
            ];

            expect(service.addSplitDateFields(rawData, formFieldsConfig)).to.eql(
                {
                    somethingElse: '19/03/2019'
                }
            );
        });

        it('should return as is if no splitDate config', () => {
            const rawData = {
                someDate: '43/03/2019',
                somethingElse: '19/03/2019'
            };
            const formFieldsConfig = [
                {someDate: {}},
                {somethingElse: {}}
            ];

            expect(service.addSplitDateFields(rawData, formFieldsConfig)).to.eql(
                {
                    someDate: '43/03/2019',
                    somethingElse: '19/03/2019'
                }
            );
        });
    });

    describe('update', () => {

        const bookingId = 'ab1';

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

                const originalLicence = {booking_id: bookingId, licence};
                const output = await service.update(
                    {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

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

                const originalLicence = {booking_id: bookingId, licence};
                const output = await service.update(
                    {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

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

                const originalLicence = {booking_id: bookingId, licence};
                const output = await service.update(
                    {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

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

            const originalLicence = {booking_id: bookingId, licence};
            await service.update(
                {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

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

        it('should not call updateLicence if there are no changes', async () => {

            const fieldMap = [{answer: {}}];
            const userInput = {answer: 'answer'};
            const licenceSection = 'section4';
            const formName = 'form2';

            const originalLicence = {booking_id: bookingId, licence: baseLicence};
            const output = await service.update(
                {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

            expect(licenceClient.updateLicence).to.not.be.called();
            expect(output).to.be.eql(baseLicence);
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

            const originalLicence = {booking_id: bookingId, licence};
            const output = await service.update(
                {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

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

            const originalLicence = {booking_id: bookingId, licence};
            const output = await service.update(
                {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

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

            const originalLicence = {booking_id: bookingId, licence};
            const output = await service.update(
                {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

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

            const originalLicence = {booking_id: bookingId, licence};
            const output = await service.update(
                {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

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

            const originalLicence = {booking_id: bookingId, licence};
            const output = await service.update(
                {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

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

        it('should not filter out empty list items marked saveEmpty', async () => {

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
                        contains: [
                            {innerQuestion: {}},
                            {innerQuestion2: {}}
                        ],
                        saveEmpty: true
                    }
                },
                {followUp2: {}}
            ];

            const userInput = {
                decision: 'Yes',
                listItem: {
                    innerQuestion: '',
                    innerQuestion2: ''
                },
                followUp2: 'Town'
            };

            const licenceSection = 'section5';
            const formName = 'form3';

            const originalLicence = {booking_id: bookingId, licence};
            const output = await service.update(
                {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

            const expectedLicence = {
                ...licence,
                section5: {
                    form3: {
                        decision: 'Yes',
                        listItem: {
                            innerQuestion: '',
                            innerQuestion2: ''
                        },
                        followUp2: 'Town'
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

            const originalLicence = {booking_id: bookingId, licence};
            const output = await service.update(
                {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

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

        it('should piece together split dates', async () => {

            const fieldMap = [
                {someDate: {splitDate: {day: 'someDay', month: 'someMonth', year: 'someYear'}}}
            ];

            const userInput = {
                someDay: '12',
                someMonth: '03',
                someYear: '1985'
            };

            const licenceSection = 'section5';
            const formName = 'form3';

            const originalLicence = {booking_id: bookingId, licence: baseLicence};
            const output = await service.update(
                {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

            const expectedLicence = {
                ...baseLicence,
                section5: {
                    form3: {
                        someDate: '12/03/1985'
                    }
                }
            };
            expect(output).to.eql(expectedLicence);
        });

        context('modificationRequiresApproval', () => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4,
                    form3: {
                        decision: ''
                    }
                }

            };

            const fieldMap = [
                {decision: {}}
            ];

            const licenceSection = 'section4';
            const formName = 'form3';
            const userInput = {
                decision: 'Yes'
            };

            it('should update stage to MODIFIED if modificationRequiresApproval = true is not in config', async () => {
                const originalLicence = {booking_id: bookingId, stage: 'DECIDED', licence};
                await service.update(
                    {bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

                expect(licenceClient.updateStage).to.be.calledOnce();
                expect(licenceClient.updateStage).to.be.calledWith(bookingId, 'MODIFIED');
            });

            it('should not update stage to MODIFIED if noModify is set in config', async () => {
                const originalLicence = {booking_id: bookingId, stage: 'DECIDED', licence};
                const config = {
                    fields: fieldMap,
                    noModify: true
                };
                await service.update({bookingId, originalLicence, config, userInput, licenceSection, formName});

                expect(licenceClient.updateStage).to.not.be.called();
            });

            it('should not update stage to MODIFIED if in MODIFIED_APPROVAL', async () => {
                const originalLicence = {booking_id: bookingId, stage: 'MODIFIED_APPROVAL', licence};
                await service.update({bookingId, originalLicence, config: {fields: fieldMap}, userInput, licenceSection, formName});

                expect(licenceClient.updateStage).to.not.be.calledOnce();
            });

            it('should not update stage if in config', async () => {
                const originalLicence = {booking_id: bookingId, stage: 'DECIDED', licence};
                const config = {
                    fields: fieldMap,
                    modificationRequiresApproval: true
                };
                await service.update({bookingId, originalLicence, config, userInput, licenceSection, formName});

                expect(licenceClient.updateStage).to.be.calledOnce();
                expect(licenceClient.updateStage).to.be.calledWith(bookingId, 'MODIFIED_APPROVAL');
            });

            it('should not update stage if no change', async () => {
                const originalLicence = {booking_id: bookingId, stage: 'DECIDED', licence};
                const config = {
                    fields: fieldMap,
                    modificationRequiresApproval: true
                };
                const userInput = {
                    decision: ''
                };
                await service.update({bookingId, originalLicence, config, userInput, licenceSection, formName});

                expect(licenceClient.updateStage).to.not.be.calledOnce();
            });

            it('should not update stage if not in DECIDED state', async () => {
                const originalLicence = {booking_id: bookingId, stage: 'PROCESSING_RO', licence};
                const config = {
                    fields: fieldMap,
                    modificationRequiresApproval: true
                };
                const userInput = {
                    decision: ''
                };
                await service.update({bookingId, originalLicence, config, userInput, licenceSection, formName});

                expect(licenceClient.updateStage).to.not.be.calledOnce();
            });
        });
    });

    describe('updateAddress', () => {

        const baseLicence = {
            stage: 'ELIGIBILITY',
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {postCode: 'pc1'},
                            {postCode: 'pc2'}
                        ]
                    }
                }
            }
        };


        it('should add form items to correct address', async () => {

            const output = await service.updateAddress({
                index: 1,
                rawLicence: baseLicence,
                userInput: {addresses: [{newField: 'newField'}]},
                fieldMap: [{addresses: {isList: true, contains: [{newField: {}}]}}]
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

        it('should remove the address item if the submission is empty', async () => {

            const output = await service.updateAddress({
                index: 1,
                rawLicence: baseLicence,
                userInput: {addresses: [{postCode: ''}]},
                fieldMap: [{addresses: {isList: true, contains: [{postCode: {}}]}}]
            });

            const expectedOutput = {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {postCode: 'pc1'}
                        ]
                    }
                }
            };

            expect(output).to.eql(expectedOutput);
        });

        it('should handle submissions from the licence form', async () => {

            const output = await service.updateAddress({
                index: 1,
                rawLicence: baseLicence,
                userInput: {addresses: [{postCode: 'pc3'}]},
                fieldMap: [{addresses: {isList: true, contains: [{postCode: {}}]}}]
            });

            const expectedOutput = {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {postCode: 'pc1'},
                            {postCode: 'pc3'}
                        ]
                    }
                }
            };

            expect(output).to.eql(expectedOutput);
        });

        it('should use the form config', async () => {
            const output = await service.updateAddress({
                index: 0,
                rawLicence: baseLicence,
                userInput: {addresses: [{newField: 'newField', unwantedField: 'unwanted'}]},
                fieldMap: [{addresses: {isList: true, contains: [{newField: {}}]}}]
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
                rawLicence: {...baseLicence, licence: {...baseLicence.licence, otherfield: 'other'}},
                userInput: {addresses: [{newField: 'newField', unwantedField: 'unwanted'}]},
                fieldMap: [{addresses: {isList: true, contains: [{newField: {}}]}}]
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
                bookingId: 1,
                index: 0,
                rawLicence: baseLicence,
                userInput: {addresses: [{newField: 'newField', unwantedField: 'unwanted'}]},
                fieldMap: [{addresses: {isList: true, contains: [{newField: {}}]}}]
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

        it('should not update the saved licence if there are no changes', async () => {
            const output = await service.updateAddress({
                bookingId: 1,
                index: 1,
                rawLicence: baseLicence,
                userInput: {addresses: [{postCode: 'pc2'}]},
                fieldMap: [{addresses: {isList: true, contains: [{postCode: 'pc2'}]}}]
            });

            expect(licenceClient.updateLicence).to.not.be.called();
            expect(output).to.eql(baseLicence.licence);
        });

        it('should throw if there is no address to update', async () => {
            expect(service.updateAddress({
                bookingId: 1,
                index: 3,
                rawLicence: baseLicence,
                userInput: {addresses: [{newField: 'newField', unwantedField: 'unwanted'}]},
                fieldMap: [{addresses: {isList: true, contains: [{newField: {}}]}}]
            })).to.eventually.throw('No address to update');
        });

        describe('post approval modifications', () => {

            it('should change stage to MODIFIED_APPROVAL when updates occur', async () => {
                await service.updateAddress({
                    bookingId: 'ab1',
                    index: 1,
                    rawLicence: {...baseLicence, stage: 'DECIDED'},
                    userInput: {addresses: [{newField: 'newField'}]},
                    fieldMap: [{addresses: {isList: true, contains: [{newField: {}}]}}]
                });

                expect(licenceClient.updateStage).to.be.calledOnce();
                expect(licenceClient.updateStage).to.be.calledWith('ab1', 'MODIFIED');
            });

            it('should not change stage if not DECIDED', async () => {
                await service.updateAddress({
                    bookingId: 'ab1',
                    index: 1,
                    rawLicence: {...baseLicence, stage: 'PROCESSING_CA'},
                    userInput: {addresses: [{newField: 'newField'}]},
                    fieldMap: [{addresses: {isList: true, contains: [{newField: {}}]}}]
                });

                expect(licenceClient.updateStage).to.not.be.calledOnce();
            });
        });
    });

    describe('addAddress', () => {
        const baseLicence = {
            stage: 'ELIGIBILITY',
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {postCode: 'pc1'},
                            {postCode: 'pc2'}
                        ]
                    }
                }
            }
        };

        it('should add form items to address array', async () => {

            const output = await service.addAddress({
                bookingId: 1,
                rawLicence: baseLicence,
                userInput: {addresses: [{postCode: 'pc3'}]},
                fieldMap: [{addresses: {}, isList: true, contains: [{postCode: {}}]}]
            });

            const expectedOutput = {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {postCode: 'pc1'},
                            {postCode: 'pc2'},
                            {postCode: 'pc3'}
                        ]
                    }
                }
            };

            expect(output).to.eql(expectedOutput);
        });
    });

    describe('getLicenceErrors', () => {

        const proposedAddress = {
            curfewAddress: {
                addressLine1: 'line1',
                addressTown: 'town',
                postCode: 'S10 5NW',
                telephone: '+123',
                occupier: {
                    name: 'occupier',
                    relationship: 'rel'
                },
                residents: [
                    {
                        name: 'occupier',
                        relationship: 'rel',
                        age: ''
                    }
                ],
                cautionedAgainstResident: 'No',
                consent: 'Yes',
                deemedSafe: 'Yes',
                electricity: 'Yes',
                homeVisitConducted: 'Yes'
            }
        };

        const eligibility = {
            excluded: {
                decision: 'No'
            },
            suitability: {
                decision: 'No'
            },
            crdTime: {
                decision: 'No'
            }
        };

        const bassReferral = {
            bassRequest: {
                bassRequested: 'No'
            },
            bassAreaCheck: {
                bassAreaSuitable: 'Yes'
            }
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
            postcode: 'S10 5NW',
            telephone: '123 234'
        };

        const standard = {
            additionalConditionsRequired: 'No'
        };

        const baseLicence = {
            eligibility,
            proposedAddress,
            bassReferral,
            curfew: {
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

        const emptyLicenceResponse = {
            curfew: 'Not answered',
            eligibility: 'Not answered',
            licenceConditions: 'Not answered',
            proposedAddress: 'Not answered',
            reporting: 'Not answered',
            risk: 'Not answered'
        };

        it('should return error if section is missing from licence', () => {
            const licence = {};

            expect(service.getLicenceErrors({licence})).to.eql(emptyLicenceResponse);
        });

        it('should only validate sections passed into the licence', () => {
            const licence = {};
            const expectedOutput = {
                licenceConditions: 'Not answered'
            };

            expect(service.getLicenceErrors({licence, forms: ['additional']})).to.eql(expectedOutput);
        });

        it('should return null if the licence is valid', () => {
            expect(service.getLicenceErrors({licence: baseLicence})).to.eql({});
        });

        it('should return error if reason is not provided for exclusion', () => {

            const licence = {
                ...baseLicence,
                eligibility: {
                    excluded: {
                        decision: 'Yes'
                    }
                }
            };

            expect(service.getLicenceErrors({licence})).to.eql(
                {eligibility: {excluded: {reason: 'Select one or more reasons'}}});
        });

        it('should return error if DM approval is not provided for when less than 4 weeks', () => {

            const licence = {
                ...baseLicence,
                eligibility: {
                    ...baseLicence.eligibility,
                    crdTime: {
                        decision: 'Yes'
                    }
                }
            };

            expect(service.getLicenceErrors({licence})).to.eql(
                {eligibility: {crdTime: {dmApproval: 'Select yes or no'}}});
        });

        it('should return error if suitability decision is not provided', () => {

            const licence = {
                ...baseLicence,
                eligibility: {
                    excluded: {
                        decision: 'No'
                    },
                    suitability: {
                        decision: ''
                    },
                    crdTime: {
                        decision: 'No'
                    }
                }
            };

            expect(service.getLicenceErrors({licence})).to.eql(
                {eligibility: {suitability: {decision: 'Select yes or no'}}});
        });

        it('should return error if reason is not provided for suitability', () => {

            const licence = {
                ...baseLicence,
                eligibility: {
                    excluded: {
                        decision: 'No'
                    },
                    suitability: {
                        decision: 'Yes'
                    }
                }
            };

            expect(service.getLicenceErrors({licence})).to.eql(
                {eligibility: {suitability: {reason: 'Select one or more reasons'}}});
        });

        it('should not return error if reason is provided for suitability', () => {

            const licence = {
                ...baseLicence,
                eligibility: {
                    excluded: {
                        decision: 'No'
                    },
                    suitability: {
                        decision: 'Yes',
                        reason: ['this']
                    }
                }
            };

            expect(service.getLicenceErrors({licence})).to.eql({});
        });

        it('should return error if no address is provided', () => {

            const missingFieldProposedAddress = {
                ...baseLicence,
                proposedAddress: {
                    ...baseLicence.proposedAddress,
                    curfewAddress: undefined
                }
            };

            expect(service.getLicenceErrors({licence: missingFieldProposedAddress})).to.eql(
                {proposedAddress: {curfewAddress: 'Not answered'}}
            );
        });

        it('should return error if required address field is not provided', () => {

            const missingFieldProposedAddress = {
                ...baseLicence,
                proposedAddress: {
                    ...baseLicence.proposedAddress,
                    curfewAddress: {
                        ...baseLicence.proposedAddress.curfewAddress,
                        addressLine1: ''
                    }
                }
            };

            expect(service.getLicenceErrors({licence: missingFieldProposedAddress})).to.eql(
                {proposedAddress: {curfewAddress: {addressLine1: 'Enter an address'}}}
            );
        });

        it('should return error if the telephone is not a number', () => {

            const missingFieldProposedAddress = {
                ...baseLicence,
                proposedAddress: {
                    ...baseLicence.proposedAddress,
                    curfewAddress: {
                        ...baseLicence.proposedAddress.curfewAddress,
                        telephone: 'abc'
                    }
                }
            };

            expect(service.getLicenceErrors({licence: missingFieldProposedAddress})).to.eql(
                {proposedAddress: {curfewAddress: {telephone: 'Enter a valid phone number'}}}
            );
        });

        it('should return error if the postcode is not formatted correctly', () => {

            const missingFieldProposedAddress = {
                ...baseLicence,
                proposedAddress: {
                    ...baseLicence.proposedAddress,
                    curfewAddress: {
                        ...baseLicence.proposedAddress.curfewAddress,
                        postCode: 'abc'
                    }
                }
            };

            expect(service.getLicenceErrors({licence: missingFieldProposedAddress})).to.eql(
                {proposedAddress: {curfewAddress: {postCode: 'Enter a valid postcode'}}}
            );
        });

        describe('residents', () => {
            it('should allow empty residents list', () => {

                const emptyResidents = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            residents: []
                        }
                    }
                };

                expect(service.getLicenceErrors({licence: emptyResidents})).to.eql({});
            });

            it('should allow residents with name and relationship', () => {

                const emptyResidents = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            residents: [{
                                name: 'name',
                                relationship: 'relationship'
                            }]
                        }
                    }
                };

                expect(service.getLicenceErrors({licence: emptyResidents})).to.eql({});
            });

            it('should not allow residents with only name', () => {

                const emptyResidents = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            residents: [{
                                name: 'name',
                                relationship: ''
                            }]
                        }
                    }
                };

                expect(service.getLicenceErrors({licence: emptyResidents})).to.eql({
                    proposedAddress: {
                        curfewAddress: {
                            residents: {
                                0: {relationship: 'Enter a relationship'}
                            }
                        }
                    }
                });
            });

            it('should number the errors with an index', () => {

                const emptyResidents = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            residents: [{
                                name: 'name',
                                relationship: 'rel'
                            }, {
                                name: '',
                                relationship: 'rel'
                            }]
                        }
                    }
                };

                expect(service.getLicenceErrors({licence: emptyResidents})).to.eql({
                    proposedAddress: {
                        curfewAddress: {
                            residents: {
                                1: {name: 'Enter a name'}
                            }
                        }
                    }
                });
            });

            it('should handle multiple residents with errors', () => {

                const emptyResidents = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            residents: [{
                                name: 'name',
                                relationship: ''
                            },
                                {
                                    name: '',
                                    relationship: 'relationship'
                                }]
                        }
                    }
                };

                expect(service.getLicenceErrors({licence: emptyResidents})).to.eql({
                    proposedAddress: {
                        curfewAddress: {
                            residents: {
                                0: {relationship: 'Enter a relationship'},
                                1: {name: 'Enter a name'}
                            }
                        }
                    }
                });

            });
        });


        describe('occuppier', () => {
            it('should allow empty occupier object', () => {

                const emptyOccupier = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            occupier: {
                                name: '',
                                relationship: ''
                            }
                        }
                    }
                };

                expect(service.getLicenceErrors({licence: emptyOccupier})).to.eql({});
            });

            it('should require a relationship if a name is provided', () => {

                const emptyOccupier = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            occupier: {
                                name: 'name',
                                relationship: ''
                            }
                        }
                    }
                };

                expect(service.getLicenceErrors({licence: emptyOccupier})).to.eql({
                    proposedAddress: {curfewAddress: {occupier: {relationship: 'Enter a relationship'}}}
                });
            });

            it('should require a name if a relationship is provided', () => {

                const emptyOccupier = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            occupier: {
                                name: '',
                                relationship: 'relationship'
                            }
                        }
                    }
                };

                expect(service.getLicenceErrors({licence: emptyOccupier})).to.eql({
                    proposedAddress: {curfewAddress: {occupier: {name: 'Enter a name'}}}
                });
            });
        });

        context('Multiple sections', () => {

            const licence = {
                ...baseLicence,
                eligibility: {
                    ...baseLicence.eligibility,
                    suitability: {
                        decision: ''
                    }
                },
                proposedAddress: {
                    ...baseLicence.proposedAddress,
                    curfewAddress: {
                        ...baseLicence.proposedAddress.curfewAddress,
                        addressLine1: ''
                    }
                }
            };

            it('should validate all sections asked for', () => {

                const expectedOutput = {
                    eligibility: {suitability: {decision: 'Select yes or no'}},
                    proposedAddress: {curfewAddress: {addressLine1: 'Enter an address'}}
                };

                const output = service.getLicenceErrors({licence});
                expect(output).to.eql(expectedOutput);
            });
        });

        context('offender is main occupier', () => {
            it('should not require an answer for occupier consent', () => {

                const licence = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            consent: '',
                            occupier: {
                                ...baseLicence.proposedAddress.occupier,
                                isOffender: 'Yes'
                            }

                        }
                    }
                };

                const output = service.getLicenceErrors({licence});

                expect(output).to.eql({});
            });

            it('should require an answer for electricity if consent not given', () => {

                const licence = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            consent: '',
                            electricity: '',
                            occupier: {
                                ...baseLicence.proposedAddress.occupier,
                                isOffender: 'Yes'
                            }
                        }
                    }
                };

                const output = service.getLicenceErrors({licence});

                expect(output).to.eql({
                    proposedAddress: {
                        curfewAddress: {
                            electricity: 'Say if there is an electricity supply'
                        }
                    }
                });
            });

            it('should require an answer for homeVisitConducted if electricity is yes', () => {

                const licence = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            consent: '',
                            electricity: 'Yes',
                            homeVisitConducted: '',
                            occupier: {
                                ...baseLicence.proposedAddress.occupier,
                                isOffender: 'Yes'
                            }
                        }
                    }
                };

                const output = service.getLicenceErrors({licence});

                expect(output).to.eql({
                    proposedAddress: {
                        curfewAddress: {
                            homeVisitConducted: 'Say if you did a home visit'
                        }
                    }
                });
            });

        });

        context('offender is not main occupier', () => {

            it('should require an answer for consent from occupier', () => {

                const licence = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            consent: '',
                            occupier: {
                                ...baseLicence.proposedAddress.occupier,
                                isOffender: undefined
                            }

                        }
                    }
                };

                const output = service.getLicenceErrors({licence});

                expect(output).to.eql({
                    proposedAddress: {
                        curfewAddress: {
                            consent: 'Say if the homeowner consents to HDC'
                        }
                    }
                });
            });

            it('should require an answer for electricity if consent is yes', () => {

                const licence = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            consent: 'Yes',
                            electricity: ''
                        }
                    }
                };

                const output = service.getLicenceErrors({licence});

                expect(output).to.eql({
                    proposedAddress: {
                        curfewAddress: {
                            electricity: 'Say if there is an electricity supply'
                        }
                    }
                });
            });

            it('should not require an answer for electricity if consent not given', () => {

                const licence = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            consent: 'No',
                            electricity: ''
                        }
                    }
                };

                const output = service.getLicenceErrors({licence});

                expect(output).to.eql({});
            });

            it('should require an answer for homeVisitConducted if electricity is yes', () => {

                const licence = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            consent: 'Yes',
                            electricity: 'Yes',
                            homeVisitConducted: ''
                        }
                    }
                };

                const output = service.getLicenceErrors({licence});

                expect(output).to.eql({
                    proposedAddress: {
                        curfewAddress: {
                            homeVisitConducted: 'Say if you did a home visit'
                        }
                    }
                });
            });

            it('should not require an answer for homeVisitConducted if consent is no', () => {

                const licence = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            consent: 'No',
                            electricity: 'Yes',
                            homeVisitConducted: ''
                        }
                    }
                };

                const output = service.getLicenceErrors({licence});

                expect(output).to.eql({});
            });

            it('should require an answer for address safety if other curfew address questions are Yes', () => {

                const licence = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            deemedSafe: ''
                        }
                    }
                };

                const output = service.getLicenceErrors({licence});

                expect(output).to.eql({proposedAddress: {curfewAddress: {deemedSafe: 'Say if you approve the address'}}});
            });

            it('should not require an answer for address safety if other curfew address questions are No', () => {

                const licence = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            consent: 'Yes',
                            electricity: 'No',
                            homeVisitConducted: 'Yes',
                            deemedSafe: ''
                        }
                    }
                };

                const output = service.getLicenceErrors({licence});

                expect(output).to.eql({});
            });

            it('should require a reason if deemedSafe is no', () => {

                const licence = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            deemedSafe: 'No',
                            unsafeReason: ''
                        }
                    }
                };

                const output = service.getLicenceErrors({licence});

                expect(output).to.eql({
                    proposedAddress: {
                        curfewAddress: {
                            unsafeReason: 'Explain why you did not approve the address'
                        }
                    }
                });
            });
        });

        it('should require curfew hours', () => {

            const licence = {
                ...baseLicence,
                curfew: {
                    ...baseLicence.curfew,
                    curfewHours: {
                        ...baseLicence.curfew.curfewHours,
                        wednesdayFrom: '',
                        wednesdayUntil: 'abc',
                        thursdayUntil: '25:14',
                        fridayUntil: '23:14'
                    }
                }
            };

            const output = service.getLicenceErrors({licence});

            expect(output).to.eql({
                curfew: {
                    curfewHours: {
                        wednesdayFrom: 'Not answered',
                        wednesdayUntil: 'Enter a valid time',
                        thursdayUntil: 'Enter a valid time'
                    }
                }
            });
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

            const expectedOutput = {
                risk: {
                    riskManagement: {
                        planningActions: 'Say if there are risk management actions',
                        awaitingInformation: 'Say if you are still awaiting information',
                        victimLiaison: 'Say if it is a victim liaison case'
                    }
                }
            };

            expect(service.getLicenceErrors({licence})).to.eql(expectedOutput);
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

            const expectedOutput = {
                risk: {
                    riskManagement: {
                        planningActionsDetails: 'Provide details of the risk management actions',
                        awaitingInformationDetails: 'Provide details of information that you are waiting for',
                        victimLiaisonDetails: 'Provide details of the victim liaison case'
                    }
                }
            };

            expect(service.getLicenceErrors({licence})).to.eql(expectedOutput);
        });

        it('should require reporting instructions fields', () => {

            const licence = {
                ...baseLicence,
                reporting: {
                    reportingInstructions: {}
                }
            };

            const expectedOutput = {
                reporting: {
                    reportingInstructions: {
                        name: 'Enter a name',
                        buildingAndStreet1: 'Enter a building or street',
                        townOrCity: 'Enter a town or city',
                        postcode: 'Enter a postcode in the right format',
                        telephone: 'Enter a telephone number in the right format'
                    }
                }
            };

            expect(service.getLicenceErrors({licence})).to.eql(expectedOutput);
        });

        describe('additional conditions validation', () => {

            it('should return no error if there are no additional conditions', () => {
                const output = service.getLicenceErrors({licence: baseLicence});

                expect(output).to.eql({});
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

                    expect(service.getLicenceErrors({licence: newLicence})).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    NOCONTACTASSOCIATE: {
                                        groupsOrOrganisation:
                                            'Enter a name or describe specific groups or organisations'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    INTIMATERELATIONSHIP: {
                                        intimateGender: 'Select women / men / women or men'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    NOCONTACTNAMED: {
                                        noContactOffenders: 'Enter named offender(s) or individual(s)'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    NORESIDE: {
                                        notResideWithGender: 'Select any / any female / any male',
                                        notResideWithAge: 'Enter age'
                                    }
                                }
                            }
                        });

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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    NOUNSUPERVISEDCONTACT: {
                                        unsupervisedContactGender: 'Select any / any female / any male',
                                        unsupervisedContactAge: 'Enter age',
                                        unsupervisedContactSocial: 'Enter name of appropriate social service department'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    NOCHILDRENSAREA: {
                                        notInSightOf: 'Enter location, for example children\'s play area'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    NOWORKWITHAGE: {
                                        noWorkWithAge: 'Enter age'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    NOCOMMUNICATEVICTIM: {
                                        victimFamilyMembers: 'Enter name of victim and /or family members',
                                        socialServicesDept: 'Enter name of appropriate social service department'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    COMPLYREQUIREMENTS: {
                                        courseOrCentre: 'Enter name of course / centre'
                                    }
                                }
                            }
                        });
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
                                    appointmentName: '12',
                                    appointmentProfession: 'Psych'
                                }
                            }
                        }
                    };

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
                });

                it('should return error if appointmentName or appointmentProfession is not filled in', () => {

                    const newLicence = {
                        ...baseLicence,
                        licenceConditions: {
                            ...baseLicence.licenceConditions,
                            additional: {
                                ATTENDALL: {}
                            }
                        }
                    };

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    ATTENDALL: {
                                        appointmentName: 'Enter name',
                                        appointmentProfession:
                                            'Select psychiatrist / psychologist / medical practitioner'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    HOMEVISITS: {
                                        mentalHealthName: 'Enter name'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    REMAINADDRESS: {
                                        curfewAddress: 'Enter curfew address',
                                        curfewFrom: 'Enter start of curfew hours',
                                        curfewTo: 'Enter end of curfew hours'
                                    }
                                }
                            }
                        });

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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    CONFINEADDRESS: {
                                        confinedTo: 'Enter time',
                                        confinedFrom: 'Enter time',
                                        confinedReviewFrequency: 'Enter frequency, for example weekly'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({
                        licenceConditions: {
                            additional: {
                                REPORTTO: {
                                    reportingDaily: 'Enter time / daily'
                                }
                            }
                        }
                    });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({
                        licenceConditions: {
                            additional: {
                                REPORTTO: {
                                    reportingDaily: 'Enter time / daily'
                                }
                            }
                        }
                    });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    REPORTTO: {
                                        reportingAddress: 'Enter name of approved premises / police station',
                                        reportingFrequency: 'Enter frequency, for example weekly'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    VEHICLEDETAILS: {
                                        vehicleDetails: 'Enter details, for example make, model'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    EXCLUSIONADDRESS: {
                                        noEnterPlace: 'Enter name / type of premises / address / road'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    EXCLUSIONAREA: {
                                        exclusionArea: 'Enter clearly specified area'
                                    }
                                }
                            }
                        });
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
                });
            });

            context('ATTENDDEPENDENCY', () => {
                it('should return no error if appointmentDate, appointmentTime and appointmentAddress ' +
                    'are filled in', () => {

                    const newLicence = {
                        ...baseLicence,
                        licenceConditions: {
                            ...baseLicence.licenceConditions,
                            additional: {
                                ATTENDDEPENDENCY: {
                                    appointmentDate: '26/12/2040',
                                    appointmentTime: '13',
                                    appointmentAddress: 'address'
                                }
                            }
                        }
                    };

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
                });

                it('should return error if appointmentDate, appointmentTime and appointmentAddress ' +
                    'are not filled in', () => {

                    const newLicence = {
                        ...baseLicence,
                        licenceConditions: {
                            ...baseLicence.licenceConditions,
                            additional: {
                                ATTENDDEPENDENCY: {}
                            }
                        }
                    };

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    ATTENDDEPENDENCY: {
                                        appointmentDate: 'Enter appointment date',
                                        appointmentTime: 'Enter appointment time',
                                        appointmentAddress: 'Enter appointment name and address'
                                    }
                                }
                            }
                        });
                });

                it('should return error if appointmentDate is not in the format YYYY-MM-DD', () => {

                    const newLicence = {
                        ...baseLicence,
                        licenceConditions: {
                            ...baseLicence.licenceConditions,
                            additional: {
                                ATTENDDEPENDENCY: {
                                    appointmentDate: '2040-26-12',
                                    appointmentTime: '13',
                                    appointmentAddress: 'address'
                                }
                            }
                        }
                    };

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    ATTENDDEPENDENCY: {
                                        appointmentDate: 'Enter a valid date'
                                    }
                                }
                            }
                        });
                });

                it('should return error if appointmentDate is not a possible date', () => {

                    const newLicence = {
                        ...baseLicence,
                        licenceConditions: {
                            ...baseLicence.licenceConditions,
                            additional: {
                                ATTENDDEPENDENCY: {
                                    appointmentDate: '2040-12-32', appointmentTime: '13',
                                    appointmentAddress: 'address'
                                }
                            }
                        }
                    };

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    ATTENDDEPENDENCY: {
                                        appointmentDate: 'Enter a valid date'
                                    }
                                }
                            }
                        });
                });

                it('should return error if appointmentDate is in the past', () => {

                    const newLicence = {
                        ...baseLicence,
                        licenceConditions: {
                            ...baseLicence.licenceConditions,
                            additional: {
                                ATTENDDEPENDENCY: {
                                    appointmentDate: '01/01/2016', appointmentTime: '13',
                                    appointmentAddress: 'address'
                                }
                            }
                        }
                    };

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    ATTENDDEPENDENCY: {
                                        appointmentDate: 'Enter a date that is not in the past'
                                    }
                                }
                            }
                        });
                });
            });

            context('ATTENDSAMPLE', () => {
                it('should return no error if attendSampleDetailsName, attendSampleDetailsAddress are present', () => {

                    const newLicence = {
                        ...baseLicence,
                        licenceConditions: {
                            ...baseLicence.licenceConditions,
                            additional: {
                                ATTENDSAMPLE: {
                                    attendSampleDetailsName: 'name',
                                    attendSampleDetailsAddress: 'address'
                                }
                            }
                        }
                    };

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
                });

                it('should return error if attendSampleDetailsName, attendSampleDetailsAddress are not present', () => {

                    const newLicence = {
                        ...baseLicence,
                        licenceConditions: {
                            ...baseLicence.licenceConditions,
                            additional: {
                                ATTENDSAMPLE: {}
                            }
                        }
                    };

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    ATTENDSAMPLE: {
                                        attendSampleDetailsName: 'Enter appointment name',
                                        attendSampleDetailsAddress: 'Enter appointment address'
                                    }
                                }
                            }
                        });
                });
            });
        });


    });

    describe('getValidationErrorsForReview', () => {

        const proposedAddress = {
            curfewAddress: {
                addressLine1: 'line1',
                addressTown: 'town',
                postCode: 'S10 5NW',
                telephone: '+123',
                occupier: {
                    name: 'occupier',
                    relationship: 'rel',
                    age: ''
                },
                residents: [
                    {
                        name: 'occupier',
                        relationship: 'rel',
                        age: ''
                    }
                ],
                cautionedAgainstResident: 'No',
                consent: 'Yes',
                deemedSafe: 'Yes',
                electricity: 'Yes',
                homeVisitConducted: 'Yes'
            }
        };

        const eligibility = {
            excluded: {
                decision: 'No'
            },
            suitability: {
                decision: 'No'
            },
            crdTime: {
                decision: 'No'
            }
        };

        const baseLicence = {
            eligibility,
            proposedAddress
        };

        context('Stage === ELIGIBILITY', () => {

            it('should validate and remove unrequired address fields', () => {
                const missingFieldProposedAddress = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            telephone: 'abc',
                            cautionedAgainstResident: '',
                            consent: '',
                            deemedSafe: ''
                        }
                    }
                };

                const output = service.getValidationErrorsForReview({
                    licenceStatus: {stage: 'ELIGIBILITY', tasks: {}},
                    licence: missingFieldProposedAddress
                });

                expect(output).to.eql(
                    {
                        proposedAddress: {
                            curfewAddress: {
                                telephone: 'Enter a valid phone number',
                                cautionedAgainstResident: 'Select yes or no'
                            }
                        }
                    }
                );
            });

            it('should handle a string for curfew address error', () => {
                const missingFieldProposedAddress = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: 'Not answered'
                    }
                };

                const output = service.getValidationErrorsForReview({
                    licenceStatus: {stage: 'ELIGIBILITY', tasks: {}},
                    licence: missingFieldProposedAddress
                });

                expect(output).to.eql(
                    {proposedAddress: {curfewAddress: 'Not answered'}}
                );
            });

            it('should remove proposedAddress if it is empty after removal of fields', () => {
                const missingFieldProposedAddress = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            consent: '',
                            deemedSafe: ''
                        }
                    }
                };

                const output = service.getValidationErrorsForReview({
                    licenceStatus: {stage: 'ELIGIBILITY', tasks: {}},
                    licence: missingFieldProposedAddress
                });

                expect(output).to.eql({});
            });

            it('should validate bassRequest (only) when bassReferral', () => {
                const bassRequest = {
                    ...baseLicence,
                    bassReferral: {
                        bassRequest: {
                            bassRequested: 'Yes'
                        },
                        bassAreaCheck: {}
                    }
                };

                const output = service.getValidationErrorsForReview({
                    licenceStatus: {stage: 'ELIGIBILITY', tasks: {}, decisions: {bassReferralNeeded: true}},
                    licence: bassRequest
                });

                expect(output).to.eql(
                    {
                        bassReferral: {
                            bassRequest: {
                                proposedCounty: 'Enter a county',
                                proposedTown: 'Enter a town'
                            }
                        }
                    }
                );
            });
        });

        context('Stage === PROCESSING_RO, curfewAddressApproved === rejected', () => {
            it('should only validate proposedAddress sections', () => {
                const licence = {
                    eligibility: {
                        excluded: {
                            decision: ''
                        }
                    },
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            consent: 'Yes',
                            deemedSafe: ''
                        }
                    }
                };

                const output = service.getValidationErrorsForReview({
                    licenceStatus: {stage: 'PROCESSING_RO', decisions: {curfewAddressApproved: 'rejected'}},
                    licence
                });

                expect(output).to.eql({
                    proposedAddress: {
                        curfewAddress: {
                            deemedSafe: 'Say if you approve the address'
                        }
                    }
                });
            });

        });

        context('Stage === PROCESSING_RO, bass referral needed', () => {

            it('should validate bassAreaCheck when bassReferral, and ignore proposedAddress', () => {
                const bassRequest = {
                    ...baseLicence,
                    bassReferral: {
                        bassRequest: {
                            bassRequested: 'Yes',
                            proposedTown: 't',
                            proposedCounty: 'c'
                        },
                        bassAreaCheck: {
                            bassAreaSuitable: 'No'
                        }
                    },
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            consent: 'Yes',
                            deemedSafe: ''
                        }
                    }
                };

                const output = service.getValidationErrorsForReview({
                    licenceStatus: {stage: 'PROCESSING_RO', tasks: {}, decisions: {bassReferralNeeded: true}},
                    licence: bassRequest
                });

                expect(output).to.eql(
                    {
                        bassReferral: {
                            bassAreaCheck: {
                                bassAreaReason: 'Enter a reason'
                            }
                        },
                        curfew: 'Not answered',
                        licenceConditions: 'Not answered',
                        reporting: 'Not answered',
                        risk: 'Not answered'
                    }
                );
            });
        });


        context('Stage === PROCESSING_CA', () => {
            it('should validate all fields if curfewAddressReview !== UNSTARTED, and ignore bass referral', () => {
                const missingFieldProposedAddress = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            telephone: 'abc',
                            cautionedAgainstResident: '',
                            consent: '',
                            deemedSafe: ''
                        }
                    }, bassReferral: {
                        bassRequest: {
                            bassRequested: 'Yes'
                        },
                        bassAreaCheck: {
                            bassAreaSuitable: 'No'
                        }
                    }
                };

                const output = service.getValidationErrorsForReview({
                    licenceStatus: {
                        stage: 'PROCESSING_CA',
                        tasks: {curfewAddressReview: 'STARTED'},
                        decisions: {bassReferralNeeded: false}
                    },
                    licence: missingFieldProposedAddress
                });

                expect(output).to.eql(
                    {
                        proposedAddress: {
                            curfewAddress: {
                                telephone: 'Enter a valid phone number',
                                cautionedAgainstResident: 'Select yes or no',
                                consent: 'Say if the homeowner consents to HDC'
                            }
                        },
                        curfew: 'Not answered',
                        licenceConditions: 'Not answered',
                        reporting: 'Not answered',
                        risk: 'Not answered'
                    }
                );
            });

            it('should validate only ELIGIBILITY fields if curfewAddressReview is unstarted', () => {
                const missingFieldProposedAddress = {
                    ...baseLicence,
                    proposedAddress: {
                        ...baseLicence.proposedAddress,
                        curfewAddress: {
                            ...baseLicence.proposedAddress.curfewAddress,
                            telephone: 'abc',
                            cautionedAgainstResident: '',
                            consent: '',
                            deemedSafe: ''
                        }
                    }
                };

                const output = service.getValidationErrorsForReview({
                    licenceStatus: {stage: 'PROCESSING_CA', tasks: {curfewAddressReview: 'UNSTARTED'}},
                    licence: missingFieldProposedAddress
                });

                expect(output).to.eql(
                    {
                        proposedAddress: {
                            curfewAddress: {
                                telephone: 'Enter a valid phone number',
                                cautionedAgainstResident: 'Select yes or no'
                            }
                        }
                    }
                );
            });

        });
    });

    describe('getValidationErrorsForPage', () => {

        context('section === approval, confiscationOrder: true', () => {

            it('should return no error if decision is Yes and notedComments answered', () => {

                const licence = {
                    approval: {
                        release: {
                            decision: 'Yes',
                            notedComments: 'Yes'
                        }
                    },
                    finalChecks: {
                        confiscationOrder: {
                            decision: 'Yes'
                        }
                    }
                };

                const output = service.getValidationErrorsForPage(licence, ['release']);

                expect(output).to.eql({});
            });

            it('should return an error if decision is No and reason is not supplied', () => {

                const licence = {
                    approval: {
                        release: {
                            decision: 'No'
                        }
                    },
                    finalChecks: {
                        confiscationOrder: {
                            decision: 'Yes'
                        }
                    }
                };

                const output = service.getValidationErrorsForPage(licence, ['release']);

                expect(output).to.eql({approval: {release: {reason: 'Select a reason'}}});
            });

            it('should return error if decision is Yes and notedComments is not answered', () => {

                const licence = {
                    approval: {
                        release: {
                            decision: 'Yes',
                            notedComments: ''
                        }
                    },
                    finalChecks: {
                        confiscationOrder: {
                            decision: 'Yes'
                        }
                    }
                };

                const output = service.getValidationErrorsForPage(licence, ['release']);

                expect(output).to.eql({approval: {release: {notedComments: 'Add a comment'}}});
            });
        });

        context('section === approval, confiscationOrder === false', () => {
            it('should return no error if decision is Yes and notedComments is not answered', () => {

                const licence = {
                    approval: {
                        release: {
                            decision: 'Yes'
                        }
                    }
                };

                const output = service.getValidationErrorsForPage(licence, ['release']);

                expect(output).to.eql({});
            });
        });

        context('section !== approval', () => {
            it('should only validate sections passed into the licence', () => {
                const licence = {};
                const expectedOutput = {
                    licenceConditions: 'Not answered'
                };

                expect(service.getValidationErrorsForPage(licence, ['additional'])).to.eql(expectedOutput);
            });
        });

        context('section !== approval', () => {
            it('should validate bassOffer when bassReferral', () => {
                const licence = {
                    bassReferral: {
                        bassRequest: {
                            bassRequested: 'Yes',
                            proposedTown: 't',
                            proposedCounty: 'c'
                        },
                        bassAreaCheck: {
                            bassAreaSuitable: 'Yes'
                        },
                        bassOffer: {
                            bassAccepted: 'Yes',
                            bassArea: 'a'
                        }
                    }
                };

                const output = service.getValidationErrorsForPage(licence, ['bassOffer']);

                expect(output).to.eql(
                    {
                        bassReferral: {
                            bassOffer: {
                                addressLine1: 'Enter a building or street',
                                addressTown: 'Enter a town or city',
                                postCode: 'Enter a postcode in the right format'
                            }
                        }
                    }
                );
            });
        });
    });
});
