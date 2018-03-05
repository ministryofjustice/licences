const {expect} = require('../testSetup');
const {
    createLicenceObjectFrom,
    createAdditionalConditionsObject,
    populateAdditionalConditionsAsString,
    populateAdditionalConditionsAsObject,
    createInputWithReasonObject
} = require('../../server/utils/licenceFactory');

const model = {
    firstName: '',
    lastName: '',
    nomisId: '',
    establishment: '',
    agencyLocationId: '',
    dischargeDate: '',
    licenceConditions: {},
    dischargeAddress: {
        address1: '',
        address2: '',
        address3: '',
        postCode: ''
    }
};

describe('licenceFactory', () => {

    describe('createLicenceObjectFrom', () => {

        it('should filter out any unacceptable data', () => {
            const input = {firstName: 'Matt', bad: 'yes'};

            expect(createLicenceObjectFrom({model, inputObject: input})).to.eql({firstName: 'Matt'});
        });
    });

    describe('createConditionsObject', () => {
        it('should return an object for each selected item', () => {

            const selectedConditions = [
                {ID: {value: 1}, USER_INPUT: {value: 'appointmentName'}, FIELD_POSITION: {value: {appointmentName: 0}}},
                {
                    ID: {value: 2}, USER_INPUT: {value: 'confinedDetails'},
                    FIELD_POSITION: {
                        value: {
                            confinedTo: 0,
                            confinedFrom: 1,
                            confinedReviewFrequency: 2
                        }
                    }
                }
            ];

            const formInputs = {licenceConditions: ['appointmentName', 'confinedDetails']};

            const expectedOutput = {
                1: {appointmentName: undefined},
                2: {
                    confinedFrom: undefined,
                    confinedReviewFrequency: undefined,
                    confinedTo: undefined
                }
            };

            const output = createAdditionalConditionsObject(selectedConditions, formInputs);

            expect(output).to.eql(expectedOutput);
        });

        it('should add form data to the objects', () => {

            const selectedConditions = [
                {ID: {value: 1}, USER_INPUT: {value: 'notInSightOf'}, FIELD_POSITION: {value: {notInSightOf: 0}}},
                {
                    ID: {value: 2}, USER_INPUT: {value: 'curfewDetails'},
                    FIELD_POSITION: {
                        value: {
                            curfewFrom: 0,
                            curfewTo: 1,
                            curfewTagRequired: 3,
                            curfewAddress: 2
                        }
                    }
                }
            ];

            const formInputs = {
                licenceConditions: ['notInSightOf', 'curfewDetails'],
                notInSightOf: 'abc',
                curfewFrom: '01/02/2024',
                curfewTo: '01/02/2016',
                curfewTagRequired: 'yes',
                curfewAddress: 'here',
                curfewAddressWrong: 'there'
            };

            const expectedOutput = {
                1: {notInSightOf: 'abc'},
                2: {
                    curfewFrom: '01/02/2024',
                    curfewTo: '01/02/2016',
                    curfewTagRequired: 'yes',
                    curfewAddress: 'here'
                }
            };

            const output = createAdditionalConditionsObject(selectedConditions, formInputs);

            expect(output).to.eql(expectedOutput);
        });

        it('should return empty object for conditions with no input', () => {

            const selectedConditions = [
                {ID: {value: 1}, USER_INPUT: {value: 'notInSightOf'}, FIELD_POSITION: {value: {notInSightOf: 0}}},
                {ID: {value: 2}, USER_INPUT: {value: 'null'}, FIELD_POSITION: {value: null}}
            ];

            const formInputs = {
                licenceConditions: ['1', '2'],
                notInSightOf: 'abc'
            };

            const expectedOutput = {
                1: {notInSightOf: 'abc'},
                2: {}
            };

            const output = createAdditionalConditionsObject(selectedConditions, formInputs);

            expect(output).to.eql(expectedOutput);
        });
    });

    describe('populateAdditionalConditionsAsObject', () => {
        it('should add text to licence if selected and has no user input', () => {
            const rawLicence = {licenceConditions: {additional: {1: {}}, bespoke: []}};
            const selectedConditions = [
                {
                    ID: {value: 1},
                    USER_INPUT: {value: null},
                    TEXT: {value: 'The condition'},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                }
            ];

            const output = populateAdditionalConditionsAsObject(rawLicence, selectedConditions);

            const expectedOutput = {
                licenceConditions: [
                    {
                        content: [{text: 'The condition'}],
                        group: 'g',
                        subgroup: 'sg',
                        id: 1
                    }
                ]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should add bespoke conditions to the output in the same format, including generated IDs', () => {
            const rawLicence = {licenceConditions: {additional: {1: {}},
                bespoke: [{text: 'bespoke1'}, {text: 'bespoke2'}]}};
            const selectedConditions = [
                {
                    ID: {value: 1},
                    USER_INPUT: {value: null},
                    TEXT: {value: 'The condition'},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                }
            ];

            const output = populateAdditionalConditionsAsObject(rawLicence, selectedConditions);

            const expectedOutput = {
                licenceConditions: [
                    {
                        content: [{text: 'The condition'}],
                        group: 'g',
                        subgroup: 'sg',
                        id: 1
                    },
                    {
                        content: [{text: 'bespoke1'}],
                        group: 'Bespoke',
                        subgroup: null,
                        id: 'bespoke-0'
                    },
                    {
                        content: [{text: 'bespoke2'}],
                        group: 'Bespoke',
                        subgroup: null,
                        id: 'bespoke-1'
                    }
                ]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should return object for view containing condition sections', () => {
            const rawLicence = {licenceConditions: {additional: {1: {appointmentName: 'injected'}}, bespoke: []}};
            const selectedConditions = [
                {
                    ID: {value: 1},
                    USER_INPUT: {value: 'appointmentName'},
                    TEXT: {value: 'The condition [placeholder] with input'},
                    FIELD_POSITION: {value: {appointmentName: 0}},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                }
            ];

            const output = populateAdditionalConditionsAsObject(rawLicence, selectedConditions);

            const expectedOutput = {
                licenceConditions: [
                    {
                        content: [
                            {text: 'The condition '},
                            {variable: 'injected'},
                            {text: ' with input'}
                        ],
                        group: 'g',
                        subgroup: 'sg',
                        id: 1
                    }

                ]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text for appointment conditions for view', () => {
            const rawLicence = {
                licenceConditions: {additional: {
                1: {
                        appointmentAddress: 'Address 1', appointmentDate: '21/01/2018', appointmentTime: '15:30'
                    }
                },
                bespoke: []
            }};
            const selectedConditions = [
                {
                    ID: {value: 1},
                    USER_INPUT: {value: 'appointmentDetails'},
                    TEXT: {value: 'The condition [placeholder] with input'},
                    FIELD_POSITION: {value: {appointmentAddress: 0, appointmentDate: 1, appointmentTime: 2}},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                }
            ];

            const output = populateAdditionalConditionsAsObject(rawLicence, selectedConditions);

            const expectedOutput = {
                licenceConditions: [{
                    content: [
                        {text: 'The condition '},
                        {variable: 'Address 1 on 21/01/2018 at 15:30'},
                        {text: ' with input'}
                    ],
                    group: 'g',
                    subgroup: 'sg',
                    id: 1
                }]
            };

            expect(output).to.eql(expectedOutput);

        });


        it('should replace placeholder text when multiple items for view', () => {
            const rawLicence = {licenceConditions: {
                additional: {1: {field: 'injected', appointmentTime: 'injected2'}},
                bespoke: []
            }};
            const selectedConditions = [
                {
                    ID: {value: 1},
                    USER_INPUT: {value: 'standardCondition'},
                    TEXT: {value: 'The condition [placeholder] with input [placeholder2] and another'},
                    FIELD_POSITION: {value: {field: 0, appointmentTime: 1}},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                }
            ];

            const output = populateAdditionalConditionsAsObject(rawLicence, selectedConditions);

            const expectedOutput = {
                licenceConditions: [{
                    content: [
                        {text: 'The condition '},
                        {variable: 'injected'},
                        {text: ' with input '},
                        {variable: 'injected2'},
                        {text: ' and another'}
                    ],
                    group: 'g',
                    subgroup: 'sg',
                    id: 1
                }]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text when multiple items in wrong order for view', () => {
            const rawLicence = {licenceConditions: {
                additional: {1: {field: 'injected', appointmentTime: 'injected2'}},
                bespoke: []
            }};
            const selectedConditions = [
                {
                    ID: {value: 1},
                    USER_INPUT: {value: 'standardCondition'},
                    TEXT: {value: 'The condition [placeholder] with input [placeholder2] and another'},
                    FIELD_POSITION: {value: {appointmentTime: 1, field: 0}},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                }
            ];

            const output = populateAdditionalConditionsAsObject(rawLicence, selectedConditions);

            const expectedOutput = {
                licenceConditions: [{
                    content: [
                        {text: 'The condition '},
                        {variable: 'injected'},
                        {text: ' with input '},
                        {variable: 'injected2'},
                        {text: ' and another'}
                    ],
                    group: 'g',
                    subgroup: 'sg',
                    id: 1
                }]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text when multiple conditions for view', () => {
            const rawLicence = {
                licenceConditions: {additional: {
                    1: {field: 'injected', appointmentTime: 'injected2'},
                    2: {groupsOrOrganisation: 'injected3'}
                },
                bespoke: []
            }};
            const selectedConditions = [
                {
                    ID: {value: 1},
                    USER_INPUT: {value: 'standardCondition'},
                    TEXT: {value: 'The condition [placeholder] with input [placeholder2] and another'},
                    FIELD_POSITION: {value: {field: 0, appointmentTime: 1}},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                },
                {
                    ID: {value: 2},
                    USER_INPUT: {value: 'groupsOrOrganisations'},
                    TEXT: {value: 'The condition [placeholder]'},
                    FIELD_POSITION: {value: {groupsOrOrganisation: 0}},
                    GROUP_NAME: {value: 'g2'},
                    SUBGROUP_NAME: {value: 'sg2'}
                }
            ];

            const output = populateAdditionalConditionsAsObject(rawLicence, selectedConditions);

            const expectedOutput = {
                licenceConditions: [
                    {
                        content: [
                            {text: 'The condition '},
                            {variable: 'injected'},
                            {text: ' with input '},
                            {variable: 'injected2'},
                            {text: ' and another'}
                        ],
                        group: 'g',
                        subgroup: 'sg',
                        id: 1
                    },
                    {
                        content: [
                            {text: 'The condition '},
                            {variable: 'injected3'}
                        ],
                        group: 'g2',
                        subgroup: 'sg2',
                        id: 2
                    }]
            };

            expect(output).to.eql(expectedOutput);

        });
    });

    describe('populateAdditionalConditionsAsString', () => {

        it('should replace placeholder text when asString is true', () => {
            const rawLicence = {licenceConditions: {additional: {1: {appointmentName: 'injected'}}, bespoke: []}};
            const selectedConditions = [
                {
                    ID: {value: 1},
                    USER_INPUT: {value: 'appointmentName'},
                    TEXT: {value: 'The condition [placeholder] with input'},
                    FIELD_POSITION: {value: {appointmentName: 0}},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                }
            ];

            const output = populateAdditionalConditionsAsString(rawLicence, selectedConditions);

            const expectedOutput = {
                licenceConditions: [
                    {
                        content: 'The condition injected with input',
                        group: 'g',
                        subgroup: 'sg',
                        id: 1
                    }
                ]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text for appointment conditions for string', () => {
            const rawLicence = {
                licenceConditions: {additional: {
                    1: {
                        appointmentAddress: 'Address 1', appointmentDate: '21/01/2018', appointmentTime: '15:30'
                    }
                },
                bespoke: []
            }};
            const selectedConditions = [
                {
                    ID: {value: 1},
                    USER_INPUT: {value: 'appointmentDetails'},
                    TEXT: {value: 'The condition [placeholder] with input'},
                    FIELD_POSITION: {value: {appointmentAddress: 0, appointmentDate: 1, appointmentTime: 2}},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                }
            ];

            const output = populateAdditionalConditionsAsString(rawLicence, selectedConditions);

            const expectedOutput = {
                licenceConditions: [
                    {
                        content: 'The condition Address 1 on 21/01/2018 at 15:30 with input',
                        group: 'g',
                        subgroup: 'sg',
                        id: 1
                    }
                ]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text when multiple items when string', () => {
            const rawLicence = {licenceConditions: {
                additional: {1: {field: 'injected', appointmentTime: 'injected2'}}, bespoke: []
            }};
            const selectedConditions = [
                {
                    ID: {value: 1},
                    USER_INPUT: {value: 'standardCondition'},
                    TEXT: {value: 'The condition [placeholder] with input [placeholder2] and another'},
                    FIELD_POSITION: {value: {field: 0, appointmentTime: 1}},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                }
            ];

            const output = populateAdditionalConditionsAsString(rawLicence, selectedConditions);

            const expectedOutput = {
                licenceConditions: [
                    {
                        content: 'The condition injected with input injected2 and another',
                        group: 'g',
                        subgroup: 'sg',
                        id: 1
                    }
                ]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text when multiple items in wrong order as string', () => {
            const rawLicence = {licenceConditions: {
                additional: {1: {field: 'injected', appointmentTime: 'injected2'}}, bespoke: []
            }};
            const selectedConditions = [
                {
                    ID: {value: 1},
                    USER_INPUT: {value: 'standardCondition'},
                    TEXT: {value: 'The condition [placeholder] with input [placeholder2] and another'},
                    FIELD_POSITION: {value: {appointmentTime: 1, field: 0}},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                }
            ];

            const output = populateAdditionalConditionsAsString(rawLicence, selectedConditions);

            const expectedOutput = {
                licenceConditions: [
                    {
                        content: 'The condition injected with input injected2 and another',
                        group: 'g',
                        subgroup: 'sg',
                        id: 1
                    }
                ]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text when multiple conditions as string', () => {
            const rawLicence = {
                licenceConditions: {additional: {
                    1: {field: 'injected', appointmentTime: 'injected2'},
                    2: {groupsOrOrganisation: 'injected3'}
                },
                bespoke: []
            }};
            const selectedConditions = [
                {
                    ID: {value: 1},
                    USER_INPUT: {value: 'standardCondition'},
                    TEXT: {value: 'The condition [placeholder] with input [placeholder2] and another'},
                    FIELD_POSITION: {value: {field: 0, appointmentTime: 1}},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                },
                {
                    ID: {value: 2},
                    USER_INPUT: {value: 'groupsOrOrganisations'},
                    TEXT: {value: 'The condition [placeholder]'},
                    FIELD_POSITION: {value: {groupsOrOrganisation: 0}},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                }
            ];

            const output = populateAdditionalConditionsAsString(rawLicence, selectedConditions);

            const expectedOutput = {
                licenceConditions: [
                    {
                        content: 'The condition injected with input injected2 and another',
                        group: 'g',
                        subgroup: 'sg',
                        id: 1
                    },
                    {
                        content: 'The condition injected3',
                        group: 'g',
                        subgroup: 'sg',
                        id: 2
                    }
                ]
            };

            expect(output).to.eql(expectedOutput);

        });
    });

    describe('createInputWithReasonObject', () => {

        const model = {
            decision: {
                reason: 'reason'
            }
        };

        it('should filter out any unacceptable data', () => {
            const input = {decision: 'Yes', reason: 'Yes', bad: 'yes'};
            expect(createInputWithReasonObject({inputObject: input, model})).to.eql({decision: 'Yes', reason: 'Yes'});
        });
        context('When answer is changed to No from Yes', () => {
            it('should remove reason', () => {
                const input = {decision: 'No', reason: 'Reason'};
                expect(createInputWithReasonObject({inputObject: input, model})).to.eql({decision: 'No', reason: null});
            });
        });
    });
});
