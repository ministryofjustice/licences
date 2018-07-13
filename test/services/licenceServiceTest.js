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
            updateLicence: sinon.stub().resolves()
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

                licenceClient.getLicence.resolves({licence});
                const output = await service.update({nomisId, fieldMap, userInput, licenceSection, formName});

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

                licenceClient.getLicence.resolves({licence});
                const output = await service.update({nomisId, fieldMap, userInput, licenceSection, formName});

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

                licenceClient.getLicence.resolves({licence});
                const output = await service.update({nomisId, fieldMap, userInput, licenceSection, formName});

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

            licenceClient.getLicence.resolves({licence});
            await service.update({nomisId, fieldMap, userInput, licenceSection, formName});

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

            licenceClient.getLicence.resolves({licence});
            const output = await service.update({nomisId, fieldMap, userInput, licenceSection, formName});

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

            licenceClient.getLicence.resolves({licence});
            const output = await service.update({nomisId, fieldMap, userInput, licenceSection, formName});

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

            licenceClient.getLicence.resolves({licence});
            const output = await service.update({nomisId, fieldMap, userInput, licenceSection, formName});

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

            licenceClient.getLicence.resolves({licence});
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

            licenceClient.getLicence.resolves({licence});
            const output = await service.update({nomisId, fieldMap, userInput, licenceSection, formName});

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

            licenceClient.getLicence.resolves({licence});
            const output = await service.update({nomisId, fieldMap, userInput, licenceSection, formName});

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

            licenceClient.getLicence.resolves({licence});
            const output = await service.update({nomisId, fieldMap, userInput, licenceSection, formName});

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
                licence: baseLicence,
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
                licence: baseLicence,
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
                licence: baseLicence,
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
                licence: {...baseLicence, otherfield: 'other'},
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
                nomisId: 1,
                index: 0,
                licence: baseLicence,
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

        it('should throw if there is no address to update', async () => {
            expect(service.updateAddress({
                nomisId: 1,
                index: 3,
                licence: baseLicence,
                userInput: {addresses: [{newField: 'newField', unwantedField: 'unwanted'}]},
                fieldMap: [{addresses: {isList: true, contains: [{newField: {}}]}}]
            })).to.eventually.throw('No address to update');
        });
    });

    describe('addAddress', () => {
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

        it('should add form items to address array', async () => {

            const output = await service.addAddress({
                nomisId: 1,
                licence: baseLicence,
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

            expect(service.getLicenceErrors({licence, sections: ['licenceConditions']})).to.eql(expectedOutput);
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
                {eligibility: {excluded: {reason: 'Not answered'}}});
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
                {eligibility: {crdTime: {dmApproval: 'Not answered'}}});
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
                {eligibility: {suitability: {decision: 'Not answered'}}});
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
                {eligibility: {suitability: {reason: 'Not answered'}}});
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
                {proposedAddress: {curfewAddress: {addressLine1: 'Not answered'}}}
            );
        });

        it('should return error if occupier relationship provided without name', () => {

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
                {proposedAddress: {curfewAddress: {addressLine1: 'Not answered'}}}
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
                {proposedAddress: {curfewAddress: {telephone: 'Invalid entry - number required'}}}
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
                {proposedAddress: {curfewAddress: {postCode: 'Invalid postcode'}}}
            );
        });

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
                    proposedAddress: {curfewAddress: {occupier: {relationship: 'Not answered'}}}
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
                    proposedAddress: {curfewAddress: {occupier: {name: 'Not answered'}}}
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
                    eligibility: {suitability: {decision: 'Not answered'}},
                    proposedAddress: {curfewAddress: {addressLine1: 'Not answered'}}
                };

                const output = service.getLicenceErrors({licence});
                expect(output).to.eql(expectedOutput);
            });
        });


        it('should require an answer for curfew address review', () => {

            const licence = {
                ...baseLicence,
                proposedAddress: {
                    ...baseLicence.proposedAddress,
                    curfewAddress: {
                        ...baseLicence.proposedAddress.curfewAddress,
                        consent: '',
                        electricity: ''
                    }
                }
            };

            const output = service.getLicenceErrors({licence});

            expect(output).to.eql({proposedAddress: {curfewAddress: {consent: 'Not answered'}}});
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

            expect(output).to.eql({proposedAddress: {curfewAddress: {electricity: 'Not answered'}}});
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

            expect(output).to.eql({proposedAddress: {curfewAddress: {homeVisitConducted: 'Not answered'}}});
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

            expect(output).to.eql({proposedAddress: {curfewAddress: {deemedSafe: 'Not answered'}}});
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

            expect(output).to.eql({proposedAddress: {curfewAddress: {unsafeReason: 'Not answered'}}});
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
                        wednesdayUntil: 'Invalid time',
                        thursdayUntil: 'Invalid time'
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
                        planningActions: 'Not answered',
                        awaitingInformation: 'Not answered',
                        victimLiaison: 'Not answered'
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
                        planningActionsDetails: 'Not answered',
                        awaitingInformationDetails: 'Not answered',
                        victimLiaisonDetails: 'Not answered'
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
                        name: 'Not answered',
                        buildingAndStreet1: 'Not answered',
                        townOrCity: 'Not answered',
                        postcode: 'Not answered',
                        telephone: 'Not answered'
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
                                        groupsOrOrganisation: 'Not answered'
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
                                        intimateGender: 'Not answered'
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
                                        noContactOffenders: 'Not answered'
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
                                        notResideWithGender: 'Not answered',
                                        notResideWithAge: 'Not answered'
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
                                        unsupervisedContactGender: 'Not answered',
                                        unsupervisedContactAge: 'Not answered',
                                        unsupervisedContactSocial: 'Not answered'
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
                                        notInSightOf: 'Not answered'
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
                                        noWorkWithAge: 'Not answered'
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
                                        victimFamilyMembers: 'Not answered',
                                        socialServicesDept: 'Not answered'
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
                                        courseOrCentre: 'Not answered'
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
                                    appointmentName: '12'
                                }
                            }
                        }
                    };

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql({});
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

                    const output = service.getLicenceErrors({licence: newLicence});

                    expect(output).to.eql(
                        {
                            licenceConditions: {
                                additional: {
                                    ATTENDALL: {
                                        appointmentName: 'Not answered'
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
                                        mentalHealthName: 'Not answered'
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
                                        curfewAddress: 'Not answered',
                                        curfewFrom: 'Not answered',
                                        curfewTo: 'Not answered',
                                        curfewTagRequired: 'Not answered'
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
                                        confinedTo: 'Not answered',
                                        confinedFrom: 'Not answered',
                                        confinedReviewFrequency: 'Not answered'
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
                                    reportingDaily: 'Not answered'
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
                                    reportingDaily: 'Not answered'
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
                                        reportingAddress: 'Not answered',
                                        reportingFrequency: 'Not answered'
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
                                        vehicleDetails: 'Not answered'
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
                                        noEnterPlace: 'Not answered'
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
                                        exclusionArea: 'Not answered'
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
                                        appointmentDate: 'Not answered',
                                        appointmentTime: 'Not answered',
                                        appointmentAddress: 'Not answered'
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
                                        appointmentDate: 'Invalid or incorrectly formatted date'
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
                                        appointmentDate: 'Invalid or incorrectly formatted date'
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
                                        appointmentDate: 'Invalid date - must not be in the past'
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
                                        attendSampleDetailsName: 'Not answered',
                                        attendSampleDetailsAddress: 'Not answered'
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
                    licenceStatus: {stage: 'ELIGIBILITY'},
                    licence: missingFieldProposedAddress});

                expect(output).to.eql(
                    {proposedAddress: {curfewAddress: {
                                telephone: 'Invalid entry - number required',
                                cautionedAgainstResident: 'Not answered'
                            }}}
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
                    licenceStatus: {stage: 'ELIGIBILITY'},
                    licence: missingFieldProposedAddress});

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
                    licenceStatus: {stage: 'ELIGIBILITY'},
                    licence: missingFieldProposedAddress});

                expect(output).to.eql({});
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
                    licence});

                expect(output).to.eql({
                    proposedAddress: {
                        curfewAddress: {
                            deemedSafe: 'Not answered'
                        }
                    }
                });
            });

        });

        context('Stage === PROCESSING_CA', () => {
            it('should validate all fields if curfewAddressReview !== UNSTARTED', () => {
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
                    licenceStatus: {stage: 'PROCESSING_CA', tasks: {curfewAddressReview: 'STARTED'}},
                    licence: missingFieldProposedAddress});

                expect(output).to.eql(
                    {proposedAddress: {
                        curfewAddress: {
                            telephone: 'Invalid entry - number required',
                            cautionedAgainstResident: 'Not answered',
                            consent: 'Not answered'
                        }
                    },
                    curfew: 'Not answered',
                    licenceConditions: 'Not answered',
                    reporting: 'Not answered',
                    risk: 'Not answered'
                    }
                );
            });

            it('should validate only ELIGIBILITY fields id curfewAddressReview is unstarted', () => {
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
                    licence: missingFieldProposedAddress});

                expect(output).to.eql(
                    {proposedAddress: {curfewAddress: {
                                telephone: 'Invalid entry - number required',
                                cautionedAgainstResident: 'Not answered'
                            }}}
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

                const output = service.getValidationErrorsForPage(licence, 'approval');

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

                const output = service.getValidationErrorsForPage(licence, 'approval');

                expect(output).to.eql({approval: {release: {reason: 'Not answered'}}});
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

                const output = service.getValidationErrorsForPage(licence, 'approval');

                expect(output).to.eql({approval: {release: {notedComments: 'Not answered'}}});
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

                const output = service.getValidationErrorsForPage(licence, 'approval');

                expect(output).to.eql({});
            });
        });

        context('section !== approval', () => {
            it('should only validate sections passed into the licence', () => {
                const licence = {};
                const expectedOutput = {
                    licenceConditions: 'Not answered'
                };

                expect(service.getValidationErrorsForPage(licence, 'licenceConditions')).to.eql(expectedOutput);
            });
        });
    });
});
