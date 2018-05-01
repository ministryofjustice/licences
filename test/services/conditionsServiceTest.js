const createConditionsService = require('../../server/services/conditionsService');
const {expect, sandbox} = require('../testSetup');

describe('conditionsService', () => {

    const licenceClient = {
        getStandardConditions: sandbox.stub().returnsPromise().resolves({a: 'b'}),
        getAdditionalConditions: sandbox.stub().returnsPromise().resolves([{text: 'v', user_input: {}}])
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
                {
                    id: 'NOTIFYRELATIONSHIP',
                    text: 'v',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1'
                },
                {
                    id: 'NOWORKWITHAGE',
                    text: 'g',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1'
                },
                {
                    id: 'NOCONTACTPRISONER',
                    text: 'a',
                    user_input: {},
                    group_name: 'g2',
                    subgroup_name: 's2'
                },
                {
                    id: 'CAMERAAPPROVAL',
                    text: 's',
                    user_input: {},
                    group_name: 'g2',
                    subgroup_name: 's3'
                }
            ]);

            const expectedOutput = {
                g1: {
                    s1: [
                        {
                            id: 'NOWORKWITHAGE',
                            text: 'g',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1'
                        },
                        {
                            id: 'NOTIFYRELATIONSHIP',
                            text: 'v',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1'
                        }
                    ]
                },
                g2: {
                    s2: [
                        {
                            id: 'NOCONTACTPRISONER',
                            text: 'a',
                            user_input: {},
                            group_name: 'g2',
                            subgroup_name: 's2'
                        }
                    ],
                    s3: [
                        {
                            id: 'CAMERAAPPROVAL',
                            text: 's',
                            user_input: {},
                            group_name: 'g2',
                            subgroup_name: 's3'
                        }
                    ]
                }
            };

            return expect(service.getAdditionalConditions()).to.eventually.eql(expectedOutput);
        });

        it('should handle a null subgroup', () => {
            licenceClient.getAdditionalConditions.resolves([
                {
                    id: 'NOTIFYRELATIONSHIP',
                    text: 'v',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1'
                },
                {
                    id: 'NOWORKWITHAGE',
                    text: 'g',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1'
                },
                {
                    id: 'NOCONTACTPRISONER',
                    text: 'a',
                    user_input: {},
                    group_name: 'g2',
                    subgroup_name: 's2'
                },
                {
                    id: 'CAMERAAPPROVAL',
                    text: 's',
                    user_input: {},
                    group_name: 'g2',
                    subgroup_name: null
                }
            ]);

            const expectedOutput = {
                g1: {
                    s1: [
                        {
                            id: 'NOWORKWITHAGE',
                            text: 'g',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1'
                        },
                        {
                            id: 'NOTIFYRELATIONSHIP',
                            text: 'v',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1'
                        }
                    ]
                },
                g2: {
                    base: [
                        {
                            id: 'CAMERAAPPROVAL',
                            text: 's',
                            user_input: {},
                            group_name: 'g2',
                            subgroup_name: null
                        }
                    ],
                    s2: [
                        {
                            id: 'NOCONTACTPRISONER',
                            text: 'a',
                            user_input: {},
                            group_name: 'g2',
                            subgroup_name: 's2'
                        }
                    ]
                }
            };

            return expect(service.getAdditionalConditions()).to.eventually.eql(expectedOutput);
        });

        it('should handle a null group', () => {
            licenceClient.getAdditionalConditions.resolves([
                {
                    id: 'NOWORKWITHAGE',
                    text: 'v',
                    user_input: {},
                    group_name: null,
                    subgroup_name: null
                },
                {
                    id: 'NOTIFYRELATIONSHIP',
                    text: 'g',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1'
                },
                {
                    id: 'CAMERAAPPROVAL',
                    text: 'a',
                    user_input: {},
                    group_name: 'g2',
                    subgroup_name: 's2'
                },
                {
                    id: 'NOCONTACTPRISONER',
                    text: 's',
                    user_input: {},
                    group_name: 'g2',
                    subgroup_name: null
                }
            ]);

            const expectedOutput = {
                base: {
                    base: [
                        {
                            id: 'NOWORKWITHAGE',
                            text: 'v',
                            user_input: {},
                            group_name: null,
                            subgroup_name: null
                        }
                    ]
                },
                g1: {
                    s1: [
                        {
                            id: 'NOTIFYRELATIONSHIP',
                            text: 'g',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1'
                        }
                    ]
                },
                g2: {
                    base: [
                        {
                            id: 'NOCONTACTPRISONER',
                            text: 's',
                            user_input: {},
                            group_name: 'g2',
                            subgroup_name: null
                        }
                    ],
                    s2: [
                        {
                            id: 'CAMERAAPPROVAL',
                            text: 'a',
                            user_input: {},
                            group_name: 'g2',
                            subgroup_name: 's2'
                        }
                    ]
                }
            };

            return expect(service.getAdditionalConditions()).to.eventually.eql(expectedOutput);
        });

        it('should populate inputs if licence is passed in', () => {

            const licence = {
                licenceConditions: {
                    additional: {12: {victimFamilyMembers: 'a', socialServicesDept: 'd'}}
                }
            };

            licenceClient.getAdditionalConditions.resolves([
                {
                    id: '12', text: 'v', group_name: null, subgroup_name: null,
                    user_input: 'additionalConditions'
                },
                {
                    id: '13', text: 'g', group_name: null, subgroup_name: null,
                    user_input: {}
                },
                {
                    id: '14', text: 'a', group_name: null, subgroup_name: null,
                    user_input: {}
                },
                {
                    id: '15', text: 's', group_name: null, subgroup_name: null,
                    user_input: {}
                }
            ]);

            const expectedOutput = {
                base: {
                    base: [
                        {
                            id: '12', text: 'v', group_name: null, subgroup_name: null,
                            user_input: 'additionalConditions',
                            selected: true,
                            user_submission: {victimFamilyMembers: 'a', socialServicesDept: 'd'}
                        },
                        {
                            id: '13', text: 'g', group_name: null, subgroup_name: null,
                            user_input: {},
                            selected: false,
                            user_submission: {}
                        },
                        {
                            id: '14', text: 'a', group_name: null, subgroup_name: null,
                            user_input: {},
                            selected: false,
                            user_submission: {}
                        },
                        {
                            id: '15', text: 's', group_name: null, subgroup_name: null,
                            user_input: {},
                            selected: false,
                            user_submission: {}
                        }
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
                    id: 'a',
                    text: 'v',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1',
                    field_position: {address1: '0', address2: '1'}
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
                            id: 'a',
                            text: 'v',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1',
                            field_position: {address1: '0', address2: '1'},
                            selected: true,
                            user_submission: {address1: '5 Fleet Street', address2: 'London'},
                            errors: ['MISSING_INPUT']
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
                    id: 'a',
                    text: 'v',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1',
                    field_position: {appointmentDate: '0', b: '1'}
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
                            id: 'a',
                            text: 'v',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1',
                            field_position: {appointmentDate: '0', b: '1'},
                            selected: true,
                            user_submission: {appointmentDate: '13/11/2017'},
                            errors: ['MISSING_INPUT']
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
                    id: 'a',
                    text: 'v',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1',
                    field_position: {address1: '0', address2: '1'}
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
                            id: 'a',
                            text: 'v',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1',
                            field_position: {address1: '0', address2: '1'}
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
                    id: 'a',
                    text: 'v',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1',
                    field_position: {address1: '0', address2: '1'}
                },
                {
                    id: 'b',
                    text: 'v',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1',
                    field_position: {address3: '0', address4: '1'}
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
                            id: 'a',
                            text: 'v',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1',
                            field_position: {address1: '0', address2: '1'},
                            selected: true,
                            user_submission: {address1: '5 Fleet Street', address2: 'London'},
                            errors: null
                        },
                        {
                            id: 'b',
                            text: 'v',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1',
                            field_position: {address3: '0', address4: '1'},
                            selected: true,
                            user_submission: {address3: 'Birmingham'},
                            errors: ['MISSING_INPUT']
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
                    id: 'a',
                    text: 'v',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1',
                    field_position: null
                },
                {
                    id: 'b',
                    text: 'v',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1',
                    field_position: {address3: '0', address4: '1'}
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
                            id: 'a',
                            text: 'v',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1',
                            field_position: null,
                            selected: true
                        },
                        {
                            id: 'b',
                            text: 'v',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1',
                            field_position: {address3: '0', address4: '1'},
                            selected: true,
                            user_submission: {address3: 'Birmingham'},
                            errors: ['MISSING_INPUT']
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
                    id: 'a',
                    text: 'v',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1',
                    field_position: null
                },
                {
                    id: 'b',
                    text: 'v',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1',
                    field_position: {address3: '0', address4: '1'}
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
                            id: 'a',
                            text: 'v',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1',
                            field_position: null,
                            selected: true
                        },
                        {
                            id: 'b',
                            text: 'v',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1',
                            field_position: {address3: '0', address4: '1'},
                            selected: true,
                            user_submission: {address3: 'Birmingham'},
                            errors: ['MISSING_INPUT', 'TOO_LONG']
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
                    id: 'a',
                    text: 'v',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1',
                    field_position: null
                },
                {
                    id: 'b',
                    text: 'v',
                    user_input: {},
                    group_name: 'g1',
                    subgroup_name: 's1',
                    field_position: {address3: '0', address4: '1'}
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
                            id: 'a',
                            text: 'v',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1',
                            field_position: null,
                            selected: true
                        },
                        {
                            id: 'b',
                            text: 'v',
                            user_input: {},
                            group_name: 'g1',
                            subgroup_name: 's1',
                            field_position: {address3: '0', address4: '1'},
                            selected: true,
                            user_submission: {address3: 'Birmingham'},
                            errors: ['MISSING_INPUT', 'TOO_LONG', 'INVALID_DATE']
                        }
                    ]
                }
            };

            return expect(service.getAdditionalConditionsWithErrors(validatedInput))
                .to.eventually.eql(expectedOutput);
        });
    });

    describe('populateLicenceWithConditions', () => {
        it('should populate the user input with form data', () => {
            it('should addAdditionalConditions if they are present in licence and requested', () => {
                const licence = {licenceConditions: {additional: {1: {}}, bespoke: []}};
                licenceClient.getAdditionalConditions.resolves([{
                    id: 1,
                    user_input: null,
                    text: 'The condition',
                    field_position: null,
                    group_name: 'group',
                    subgroup_name: 'subgroup'
                }]);

                return expect(service.populateLicenceWithConditions(licence)).to.eventually.eql({
                    licence: {
                        licenceConditions: [{
                            content: [{text: 'The condition'}],
                            group: 'group',
                            subgroup: 'subgroup',
                            id: 1
                        }]
                    },

                    status: undefined
                });
            });

            it('should return licence if no additional conditions', () => {
                const licence = {licenceConditions: {}};
                licenceClient.getAdditionalConditions.resolves([{
                    id: 1,
                    user_input: null,
                    text: 'The condition',
                    field_position: null,
                    group_name: 'group',
                    subgroup_name: 'subgroup'
                }]);

                return expect(service.populateLicenceWithConditions(licence)).to.eventually.eql({
                    licence: {licenceConditions: {}}
                });
            });
        });
    });
});
