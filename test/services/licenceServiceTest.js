const createLicenceService = require('../../server/services/licenceService');
const {expect, sandbox} = require('../testSetup');

describe('licenceService', () => {

    const licenceClient = {
        getLicence: sandbox.stub().returnsPromise().resolves({licence: {a: 'b'}}),
        createLicence: sandbox.stub().returnsPromise().resolves('abc'),
        updateSection: sandbox.stub().returnsPromise().resolves(),
        updateStatus: sandbox.stub().returnsPromise().resolves(),
        getAdditionalConditions: sandbox.stub().returnsPromise().resolves([
            {USER_INPUT: {value: 1}, ID: {value: 1}, FIELD_POSITION: {value: null}}]),
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
            return expect(service.getLicence('123')).to.eventually.eql({licence: {a: 'b'}, status: undefined});
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
                {USER_INPUT: {value: 1}, ID: {value: 1}, FIELD_POSITION: {value: null}}]);

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

        it('should call updateStatus from the licence client', () => {
            service.markForHandover('ab1', 'CA', 'RO');

            expect(licenceClient.updateStatus).to.be.calledOnce();
            expect(licenceClient.updateStatus).to.be.calledWith('ab1', 'PROCESSING_RO');
        });

        it('should pick the right status based on sender and receiver', () => {
            service.markForHandover('ab1', 'CA', 'DM');
            expect(licenceClient.updateStatus).to.be.calledWith('ab1', 'APPROVAL');

            service.markForHandover('ab1', 'DM', 'CA');
            expect(licenceClient.updateStatus).to.be.calledWith('ab1', 'DECIDED');
        });

        it('should throw if error during update status', () => {
            licenceClient.updateStatus.rejects();
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

        it('should recurse if a field has inner contents', async() => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {outer: {
                    contains: [
                        {innerQuestion: {}},
                        {innerQuestion2: {}},
                        {dependentAnswer: {dependentOn: 'innerQuestion2', predicate: 'Yes'}},
                        {innerOuter: {
                            contains: [
                                {innerInner: {}}
                            ]
                        }}
                    ]
                }},
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

        it('should recurse through list items', async() => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {listItem: {
                        isList: true,
                        contains: [
                            {innerQuestion: {}},
                            {innerQuestion2: {}},
                            {dependentAnswer: {dependentOn: 'innerQuestion2', predicate: 'Yes'}}
                        ]
                    }},
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

        it('should filter out empty list items', async() => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {listItem: {
                        isList: true,
                        contains: [
                            {innerQuestion: {}},
                            {innerQuestion2: {}}
                        ]
                    }},
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

        it('should limit size of list by limitedBy flag', async() => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {listItem: {
                        isList: true,
                        contains: [
                            {innerQuestion: {}},
                            {innerQuestion2: {}}
                        ],
                        limitedBy: {
                            field: 'limiter',
                            No: 1
                        }
                    }},
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

        it('should filter out empty list items with recusion', async() => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {listItem: {
                        isList: true,
                        contains: [
                            {innerQuestion: {}},
                            {innerQuestion2: {
                                contains: [
                                    {innerInner: {}}
                                ]
                            }}
                        ]
                    }},
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
});
