const createConditionsService = require('../../server/services/conditionsService');
const {expect, sandbox} = require('../testSetup');

describe('licenceDetailsService', () => {

    const licenceClient = {
        getStandardConditions: sandbox.stub().returnsPromise().resolves({a: 'b'}),
        getAdditionalConditions: sandbox.stub().returnsPromise().resolves([{TEXT: {value: 'v'}, USER_INPUT: {}}])
    };

    const service = createConditionsService(licenceClient);

    afterEach(() => {
        sandbox.reset();
    });

    describe('getStandardConditions', () => {
        it('should request standard conditions from client', () => {
            service.getStandardConditions();

            expect(licenceClient.getStandardConditions).to.be.calledOnce();
        });

        it('should return the conditions', () => {
            return expect(service.getStandardConditions()).to.eventually.eql({a: 'b'});
        });

        it('should throw if error getting conditions', () => {
            licenceClient.getStandardConditions.rejects();
            return expect(service.getStandardConditions()).to.eventually.be.rejected();
        });
    });

    describe('getAdditionalConditions', () => {
        it('should request additional conditions from client', () => {
            service.getAdditionalConditions();

            expect(licenceClient.getAdditionalConditions).to.be.calledOnce();
        });

        it('should throw if error getting conditions', () => {
            licenceClient.getAdditionalConditions.rejects();
            return expect(service.getAdditionalConditions()).to.eventually.be.rejected();
        });

        it('should split the conditions by group and subgroup', () => {
            licenceClient.getAdditionalConditions.resolves([
                {TEXT: {value: 'v'}, USER_INPUT: {}, GROUP_NAME: {value: 'g1'}, SUBGROUP_NAME: {value: 's1'}},
                {TEXT: {value: 'g'}, USER_INPUT: {}, GROUP_NAME: {value: 'g1'}, SUBGROUP_NAME: {value: 's1'}},
                {TEXT: {value: 'a'}, USER_INPUT: {}, GROUP_NAME: {value: 'g2'}, SUBGROUP_NAME: {value: 's2'}},
                {TEXT: {value: 's'}, USER_INPUT: {}, GROUP_NAME: {value: 'g2'}, SUBGROUP_NAME: {value: 's3'}}
            ]);

            const expectedOutput = {
                g1: {
                    s1: [
                        {TEXT: {value: 'v'}, USER_INPUT: {}, GROUP_NAME: {value: 'g1'}, SUBGROUP_NAME: {value: 's1'}},
                        {TEXT: {value: 'g'}, USER_INPUT: {}, GROUP_NAME: {value: 'g1'}, SUBGROUP_NAME: {value: 's1'}}
                    ]
                },
                g2: {
                    s2: [
                        {TEXT: {value: 'a'}, USER_INPUT: {}, GROUP_NAME: {value: 'g2'}, SUBGROUP_NAME: {value: 's2'}}
                    ],
                    s3: [
                        {TEXT: {value: 's'}, USER_INPUT: {}, GROUP_NAME: {value: 'g2'}, SUBGROUP_NAME: {value: 's3'}}
                    ]
                }
            };

            return expect(service.getAdditionalConditions()).to.eventually.eql(expectedOutput);
        });

        it('should handle a null subgroup', () => {
            licenceClient.getAdditionalConditions.resolves([
                {TEXT: {value: 'v'}, USER_INPUT: {}, GROUP_NAME: {value: 'g1'}, SUBGROUP_NAME: {value: 's1'}},
                {TEXT: {value: 'g'}, USER_INPUT: {}, GROUP_NAME: {value: 'g1'}, SUBGROUP_NAME: {value: 's1'}},
                {TEXT: {value: 'a'}, USER_INPUT: {}, GROUP_NAME: {value: 'g2'}, SUBGROUP_NAME: {value: 's2'}},
                {TEXT: {value: 's'}, USER_INPUT: {}, GROUP_NAME: {value: 'g2'}, SUBGROUP_NAME: {value: null}}
            ]);

            const expectedOutput = {
                g1: {
                    s1: [
                        {TEXT: {value: 'v'}, USER_INPUT: {}, GROUP_NAME: {value: 'g1'}, SUBGROUP_NAME: {value: 's1'}},
                        {TEXT: {value: 'g'}, USER_INPUT: {}, GROUP_NAME: {value: 'g1'}, SUBGROUP_NAME: {value: 's1'}}
                    ]
                },
                g2: {
                    base: [
                        {TEXT: {value: 's'}, USER_INPUT: {}, GROUP_NAME: {value: 'g2'}, SUBGROUP_NAME: {value: null}}
                    ],
                    s2: [
                        {TEXT: {value: 'a'}, USER_INPUT: {}, GROUP_NAME: {value: 'g2'}, SUBGROUP_NAME: {value: 's2'}}
                    ]
                }
            };

            return expect(service.getAdditionalConditions()).to.eventually.eql(expectedOutput);
        });

        it('should handle a null group', () => {
            licenceClient.getAdditionalConditions.resolves([
                {TEXT: {value: 'v'}, USER_INPUT: {}, GROUP_NAME: {value: null}, SUBGROUP_NAME: {value: null}},
                {TEXT: {value: 'g'}, USER_INPUT: {}, GROUP_NAME: {value: 'g1'}, SUBGROUP_NAME: {value: 's1'}},
                {TEXT: {value: 'a'}, USER_INPUT: {}, GROUP_NAME: {value: 'g2'}, SUBGROUP_NAME: {value: 's2'}},
                {TEXT: {value: 's'}, USER_INPUT: {}, GROUP_NAME: {value: 'g2'}, SUBGROUP_NAME: {value: null}}
            ]);

            const expectedOutput = {
                base: {
                    base: [
                        {TEXT: {value: 'v'}, USER_INPUT: {}, GROUP_NAME: {value: null}, SUBGROUP_NAME: {value: null}}
                    ]
                },
                g1: {
                    s1: [
                        {TEXT: {value: 'g'}, USER_INPUT: {}, GROUP_NAME: {value: 'g1'}, SUBGROUP_NAME: {value: 's1'}}
                    ]
                },
                g2: {
                    base: [
                        {TEXT: {value: 's'}, USER_INPUT: {}, GROUP_NAME: {value: 'g2'}, SUBGROUP_NAME: {value: null}}
                    ],
                    s2: [
                        {TEXT: {value: 'a'}, USER_INPUT: {}, GROUP_NAME: {value: 'g2'}, SUBGROUP_NAME: {value: 's2'}}
                    ]
                }
            };

            return expect(service.getAdditionalConditions()).to.eventually.eql(expectedOutput);
        });

        it('should populate inputs if licence is passed in', () => {

            const licence = {additionalConditions: {12: {victimFamilyMembers: 'a', socialServicesDept: 'd'}}};

            licenceClient.getAdditionalConditions.resolves([
                {ID: {value: '12'}, TEXT: {value: 'v'}, GROUP_NAME: {value: null}, SUBGROUP_NAME: {value: null},
                    USER_INPUT: {value: 'additionalConditions'}},
                {ID: {value: '13'}, TEXT: {value: 'g'}, GROUP_NAME: {value: null}, SUBGROUP_NAME: {value: null},
                    USER_INPUT: {}},
                {ID: {value: '14'}, TEXT: {value: 'a'}, GROUP_NAME: {value: null}, SUBGROUP_NAME: {value: null},
                    USER_INPUT: {}},
                {ID: {value: '15'}, TEXT: {value: 's'}, GROUP_NAME: {value: null}, SUBGROUP_NAME: {value: null},
                    USER_INPUT: {}}
            ]);

            const expectedOutput = {
                base: {
                    base: [
                        {ID: {value: '12'}, TEXT: {value: 'v'}, GROUP_NAME: {value: null}, SUBGROUP_NAME: {value: null},
                            USER_INPUT: {value: 'additionalConditions'},
                            SELECTED: true,
                            USER_SUBMISSION: {victimFamilyMembers: 'a', socialServicesDept: 'd'}
                        },
                        {ID: {value: '13'}, TEXT: {value: 'g'}, GROUP_NAME: {value: null}, SUBGROUP_NAME: {value: null},
                            USER_INPUT: {},
                            SELECTED: false,
                            USER_SUBMISSION: {}},
                        {ID: {value: '14'}, TEXT: {value: 'a'}, GROUP_NAME: {value: null}, SUBGROUP_NAME: {value: null},
                            USER_INPUT: {},
                            SELECTED: false,
                            USER_SUBMISSION: {}},
                        {ID: {value: '15'}, TEXT: {value: 's'}, GROUP_NAME: {value: null}, SUBGROUP_NAME: {value: null},
                            USER_INPUT: {},
                            SELECTED: false,
                            USER_SUBMISSION: {}}
                    ]
                }
            };

            return expect(service.getAdditionalConditions(licence)).to.eventually.eql(expectedOutput);

        });

    });

    describe('getAdditionalConditionsWithErrors', () => {
        it('should populate the user input with form data', () => {
            licenceClient.getAdditionalConditions.resolves([
                {
                    ID: {value: 'a'},
                    TEXT: {value: 'v'},
                    USER_INPUT: {},
                    GROUP_NAME: {value: 'g1'},
                    SUBGROUP_NAME: {value: 's1'},
                    FIELD_POSITION: {value: {address1: '0', address2: '1'}}
                }
            ]);

            const validatedInput = {
                validates: false,
                errors: {
                    address1: ['MISSING_INPUT']
                },
                additionalConditions: 'a',
                address1: '5 Fleet Street',
                address2: 'London'
            };

            const expectedOutput = {
                g1: {
                    s1: [
                        {
                            ID: {value: 'a'},
                            TEXT: {value: 'v'},
                            USER_INPUT: {},
                            GROUP_NAME: {value: 'g1'},
                            SUBGROUP_NAME: {value: 's1'},
                            FIELD_POSITION: {value: {address1: '0', address2: '1'}},
                            SELECTED: true,
                            USER_SUBMISSION: {address1: '5 Fleet Street', address2: 'London'},
                            ERRORS: ['MISSING_INPUT']
                        }
                    ]
                }
            };

            return expect(service.getAdditionalConditionsWithErrors(validatedInput))
                .to.eventually.eql(expectedOutput);
        });

        it('should format date fields', () => {
            licenceClient.getAdditionalConditions.resolves([
                {
                    ID: {value: 'a'},
                    TEXT: {value: 'v'},
                    USER_INPUT: {},
                    GROUP_NAME: {value: 'g1'},
                    SUBGROUP_NAME: {value: 's1'},
                    FIELD_POSITION: {value: {appointmentDate: '0', b: '1'}}
                }
            ]);

            const validatedInput = {
                validates: false,
                errors: {
                    b: ['MISSING_INPUT']
                },
                additionalConditions: 'a',
                appointmentDate: '2017-11-13'
            };

            const expectedOutput = {
                g1: {
                    s1: [
                        {
                            ID: {value: 'a'},
                            TEXT: {value: 'v'},
                            USER_INPUT: {},
                            GROUP_NAME: {value: 'g1'},
                            SUBGROUP_NAME: {value: 's1'},
                            FIELD_POSITION: {value: {appointmentDate: '0', b: '1'}},
                            SELECTED: true,
                            USER_SUBMISSION: {appointmentDate: '13/11/2017'},
                            ERRORS: ['MISSING_INPUT']
                        }
                    ]
                }
            };

            return expect(service.getAdditionalConditionsWithErrors(validatedInput))
                .to.eventually.eql(expectedOutput);
        });

        it('should not populate unselected items', () => {
            licenceClient.getAdditionalConditions.resolves([
                {
                    ID: {value: 'a'},
                    TEXT: {value: 'v'},
                    USER_INPUT: {},
                    GROUP_NAME: {value: 'g1'},
                    SUBGROUP_NAME: {value: 's1'},
                    FIELD_POSITION: {value: {address1: '0', address2: '1'}}
                }
            ]);

            const input = {
                additionalConditions: [],
                address1: '5 Fleet Street',
                address2: 'London'
            };

            const validationObject = {
                validates: false,
                errors: {}
            };

            const expectedOutput = {
                g1: {
                    s1: [
                        {
                            ID: {value: 'a'},
                            TEXT: {value: 'v'},
                            USER_INPUT: {},
                            GROUP_NAME: {value: 'g1'},
                            SUBGROUP_NAME: {value: 's1'},
                            FIELD_POSITION: {value: {address1: '0', address2: '1'}}
                        }
                    ]
                }
            };

            return expect(service.getAdditionalConditionsWithErrors(input, validationObject))
                .to.eventually.eql(expectedOutput);
        });

        it('should populate multiple conditions', () => {
            licenceClient.getAdditionalConditions.resolves([
                {
                    ID: {value: 'a'},
                    TEXT: {value: 'v'},
                    USER_INPUT: {},
                    GROUP_NAME: {value: 'g1'},
                    SUBGROUP_NAME: {value: 's1'},
                    FIELD_POSITION: {value: {address1: '0', address2: '1'}}
                },
                {
                    ID: {value: 'b'},
                    TEXT: {value: 'v'},
                    USER_INPUT: {},
                    GROUP_NAME: {value: 'g1'},
                    SUBGROUP_NAME: {value: 's1'},
                    FIELD_POSITION: {value: {address3: '0', address4: '1'}}
                }
            ]);

            const validatedInput = {
                validates: false,
                errors: {
                    address3: ['MISSING_INPUT']
                },
                additionalConditions: ['a', 'b'],
                address1: '5 Fleet Street',
                address2: 'London',
                address3: 'Birmingham'
            };

            const expectedOutput = {
                g1: {
                    s1: [
                        {
                            ID: {value: 'a'},
                            TEXT: {value: 'v'},
                            USER_INPUT: {},
                            GROUP_NAME: {value: 'g1'},
                            SUBGROUP_NAME: {value: 's1'},
                            FIELD_POSITION: {value: {address1: '0', address2: '1'}},
                            SELECTED: true,
                            USER_SUBMISSION: {address1: '5 Fleet Street', address2: 'London'},
                            ERRORS: null
                        },
                        {
                            ID: {value: 'b'},
                            TEXT: {value: 'v'},
                            USER_INPUT: {},
                            GROUP_NAME: {value: 'g1'},
                            SUBGROUP_NAME: {value: 's1'},
                            FIELD_POSITION: {value: {address3: '0', address4: '1'}},
                            SELECTED: true,
                            USER_SUBMISSION: {address3: 'Birmingham'},
                            ERRORS: ['MISSING_INPUT']
                        }
                    ]
                }
            };

            return expect(service.getAdditionalConditionsWithErrors(validatedInput))
                .to.eventually.eql(expectedOutput);
        });

        it('should not break on conditions with no inputs', () => {
            licenceClient.getAdditionalConditions.resolves([
                {
                    ID: {value: 'a'},
                    TEXT: {value: 'v'},
                    USER_INPUT: {},
                    GROUP_NAME: {value: 'g1'},
                    SUBGROUP_NAME: {value: 's1'},
                    FIELD_POSITION: {value: null}
                },
                {
                    ID: {value: 'b'},
                    TEXT: {value: 'v'},
                    USER_INPUT: {},
                    GROUP_NAME: {value: 'g1'},
                    SUBGROUP_NAME: {value: 's1'},
                    FIELD_POSITION: {value: {address3: '0', address4: '1'}}
                }
            ]);

            const validatedInput = {
                validates: false,
                errors: {
                    address3: ['MISSING_INPUT']
                },
                additionalConditions: ['a', 'b'],
                address3: 'Birmingham'
            };

            const expectedOutput = {
                g1: {
                    s1: [
                        {
                            ID: {value: 'a'},
                            TEXT: {value: 'v'},
                            USER_INPUT: {},
                            GROUP_NAME: {value: 'g1'},
                            SUBGROUP_NAME: {value: 's1'},
                            FIELD_POSITION: {value: null},
                            SELECTED: true
                        },
                        {
                            ID: {value: 'b'},
                            TEXT: {value: 'v'},
                            USER_INPUT: {},
                            GROUP_NAME: {value: 'g1'},
                            SUBGROUP_NAME: {value: 's1'},
                            FIELD_POSITION: {value: {address3: '0', address4: '1'}},
                            SELECTED: true,
                            USER_SUBMISSION: {address3: 'Birmingham'},
                            ERRORS: ['MISSING_INPUT']
                        }
                    ]
                }
            };

            return expect(service.getAdditionalConditionsWithErrors(validatedInput))
                .to.eventually.eql(expectedOutput);
        });

        it('should be able to handle multiple errors for same condition', () => {
            licenceClient.getAdditionalConditions.resolves([
                {
                    ID: {value: 'a'},
                    TEXT: {value: 'v'},
                    USER_INPUT: {},
                    GROUP_NAME: {value: 'g1'},
                    SUBGROUP_NAME: {value: 's1'},
                    FIELD_POSITION: {value: null}
                },
                {
                    ID: {value: 'b'},
                    TEXT: {value: 'v'},
                    USER_INPUT: {},
                    GROUP_NAME: {value: 'g1'},
                    SUBGROUP_NAME: {value: 's1'},
                    FIELD_POSITION: {value: {address3: '0', address4: '1'}}
                }
            ]);

            const validatedInput = {
                validates: false,
                errors: {
                    address3: ['MISSING_INPUT'],
                    address4: ['TOO_LONG']
                },
                additionalConditions: ['a', 'b'],
                address3: 'Birmingham'
            };

            const expectedOutput = {
                g1: {
                    s1: [
                        {
                            ID: {value: 'a'},
                            TEXT: {value: 'v'},
                            USER_INPUT: {},
                            GROUP_NAME: {value: 'g1'},
                            SUBGROUP_NAME: {value: 's1'},
                            FIELD_POSITION: {value: null},
                            SELECTED: true
                        },
                        {
                            ID: {value: 'b'},
                            TEXT: {value: 'v'},
                            USER_INPUT: {},
                            GROUP_NAME: {value: 'g1'},
                            SUBGROUP_NAME: {value: 's1'},
                            FIELD_POSITION: {value: {address3: '0', address4: '1'}},
                            SELECTED: true,
                            USER_SUBMISSION: {address3: 'Birmingham'},
                            ERRORS: ['MISSING_INPUT', 'TOO_LONG']
                        }
                    ]
                }
            };

            return expect(service.getAdditionalConditionsWithErrors(validatedInput))
                .to.eventually.eql(expectedOutput);
        });

        it('should be able to handle multiple errors for same field', () => {
            licenceClient.getAdditionalConditions.resolves([
                {
                    ID: {value: 'a'},
                    TEXT: {value: 'v'},
                    USER_INPUT: {},
                    GROUP_NAME: {value: 'g1'},
                    SUBGROUP_NAME: {value: 's1'},
                    FIELD_POSITION: {value: null}
                },
                {
                    ID: {value: 'b'},
                    TEXT: {value: 'v'},
                    USER_INPUT: {},
                    GROUP_NAME: {value: 'g1'},
                    SUBGROUP_NAME: {value: 's1'},
                    FIELD_POSITION: {value: {address3: '0', address4: '1'}}
                }
            ]);

            const validatedInput = {
                validates: false,
                errors: {
                    address3: ['MISSING_INPUT'],
                    address4: ['TOO_LONG', 'INVALID_DATE']
                },
                additionalConditions: ['a', 'b'],
                address3: 'Birmingham'
            };

            const expectedOutput = {
                g1: {
                    s1: [
                        {
                            ID: {value: 'a'},
                            TEXT: {value: 'v'},
                            USER_INPUT: {},
                            GROUP_NAME: {value: 'g1'},
                            SUBGROUP_NAME: {value: 's1'},
                            FIELD_POSITION: {value: null},
                            SELECTED: true
                        },
                        {
                            ID: {value: 'b'},
                            TEXT: {value: 'v'},
                            USER_INPUT: {},
                            GROUP_NAME: {value: 'g1'},
                            SUBGROUP_NAME: {value: 's1'},
                            FIELD_POSITION: {value: {address3: '0', address4: '1'}},
                            SELECTED: true,
                            USER_SUBMISSION: {address3: 'Birmingham'},
                            ERRORS: ['MISSING_INPUT', 'TOO_LONG', 'INVALID_DATE']
                        }
                    ]
                }
            };

            return expect(service.getAdditionalConditionsWithErrors(validatedInput))
                .to.eventually.eql(expectedOutput);
        });
    });
});
