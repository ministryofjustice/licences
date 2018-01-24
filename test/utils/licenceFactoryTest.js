const {expect} = require('../testSetup');
const {
    createLicenceObject,
    createAddressObject,
    createConditionsObject,
    createEligibilityObject,
    createBassReferralObject,
    addAdditionalConditionsAsString,
    addAdditionalConditionsAsObject
} = require('../../server/utils/licenceFactory');

describe('licenceFactory', () => {

    describe('createLicenceObject', () => {

        it('should filter out any unacceptable data', () => {
            const input = {firstName: 'Matt', bad: 'yes'};

            expect(createLicenceObject(input)).to.eql({firstName: 'Matt'});
        });
    });

    describe('createAddressObject', () => {

        it('should filter out any unacceptable data', () => {
            const input = {firstName: 'Matt', address1: 'yes'};

            expect(createAddressObject(input)).to.eql({address1: 'yes'});
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

            const formInputs = {additionalConditions: ['appointmentName', 'confinedDetails']};

            const expectedOutput = {
                1: {appointmentName: undefined},
                2: {
                    confinedFrom: undefined,
                    confinedReviewFrequency: undefined,
                    confinedTo: undefined
                }
            };

            const output = createConditionsObject(selectedConditions, formInputs);

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
                additionalConditions: ['notInSightOf', 'curfewDetails'],
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

            const output = createConditionsObject(selectedConditions, formInputs);

            expect(output).to.eql(expectedOutput);
        });

        it('should return empty object for conditions with no input', () => {

            const selectedConditions = [
                {ID: {value: 1}, USER_INPUT: {value: 'notInSightOf'}, FIELD_POSITION: {value: {notInSightOf: 0}}},
                {ID: {value: 2}, USER_INPUT: {value: 'null'}, FIELD_POSITION: {value: null}}
            ];

            const formInputs = {
                additionalConditions: ['1', '2'],
                notInSightOf: 'abc'
            };

            const expectedOutput = {
                1: {notInSightOf: 'abc'},
                2: {}
            };

            const output = createConditionsObject(selectedConditions, formInputs);

            expect(output).to.eql(expectedOutput);
        });
    });

    describe('addAdditionalConditionsAsObject', () => {
        it('should add text to licence if selected and has no user input', () => {
            const rawLicence = {additionalConditions: {1: {}}};
            const selectedConditions = [
                {
                    ID: {value: 1},
                    USER_INPUT: {value: null},
                    TEXT: {value: 'The condition'},
                    GROUP_NAME: {value: 'g'},
                    SUBGROUP_NAME: {value: 'sg'}
                }
            ];

            const output = addAdditionalConditionsAsObject(rawLicence, selectedConditions);

            const expectedOutput = {
                additionalConditions: [
                    {
                        content: [{text: 'The condition'}],
                        group: 'g',
                        subgroup: 'sg'
                    }
                ]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should return object for view containing condition sections', () => {
            const rawLicence = {additionalConditions: {1: {appointmentName: 'injected'}}};
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

            const output = addAdditionalConditionsAsObject(rawLicence, selectedConditions);

            const expectedOutput = {
                additionalConditions: [
                    {
                        content: [
                            {text: 'The condition '},
                            {variable: 'injected'},
                            {text: ' with input'}
                        ],
                        group: 'g',
                        subgroup: 'sg'
                    }

                ]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text for appointment conditions for view', () => {
            const rawLicence = {
                additionalConditions: {
                    1: {
                        appointmentAddress: 'Address 1', appointmentDate: '21/01/2018', appointmentTime: '15:30'
                    }
                }
            };
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

            const output = addAdditionalConditionsAsObject(rawLicence, selectedConditions);

            const expectedOutput = {
                additionalConditions: [{
                    content: [
                        {text: 'The condition '},
                        {variable: 'Address 1 on 21/01/2018 at 15:30'},
                        {text: ' with input'}
                    ],
                    group: 'g',
                    subgroup: 'sg'
                }]
            };

            expect(output).to.eql(expectedOutput);

        });


        it('should replace placeholder text when multiple items for view', () => {
            const rawLicence = {additionalConditions: {1: {field: 'injected', appointmentTime: 'injected2'}}};
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

            const output = addAdditionalConditionsAsObject(rawLicence, selectedConditions);

            const expectedOutput = {
                additionalConditions: [{
                    content: [
                        {text: 'The condition '},
                        {variable: 'injected'},
                        {text: ' with input '},
                        {variable: 'injected2'},
                        {text: ' and another'}
                    ],
                    group: 'g',
                    subgroup: 'sg'
                }]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text when multiple items in wrong order for view', () => {
            const rawLicence = {additionalConditions: {1: {field: 'injected', appointmentTime: 'injected2'}}};
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

            const output = addAdditionalConditionsAsObject(rawLicence, selectedConditions);

            const expectedOutput = {
                additionalConditions: [{
                    content: [
                        {text: 'The condition '},
                        {variable: 'injected'},
                        {text: ' with input '},
                        {variable: 'injected2'},
                        {text: ' and another'}
                    ],
                    group: 'g',
                    subgroup: 'sg'
                }]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text when multiple conditions for view', () => {
            const rawLicence = {
                additionalConditions: {
                    1: {field: 'injected', appointmentTime: 'injected2'},
                    2: {groupsOrOrganisation: 'injected3'}
                }
            };
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

            const output = addAdditionalConditionsAsObject(rawLicence, selectedConditions);

            const expectedOutput = {
                additionalConditions: [
                    {
                        content: [
                            {text: 'The condition '},
                            {variable: 'injected'},
                            {text: ' with input '},
                            {variable: 'injected2'},
                            {text: ' and another'}
                        ],
                        group: 'g',
                        subgroup: 'sg'
                    },
                    {
                        content: [
                            {text: 'The condition '},
                            {variable: 'injected3'}
                        ],
                        group: 'g2',
                        subgroup: 'sg2'
                    }]
            };

            expect(output).to.eql(expectedOutput);

        });
    });

    describe('addAdditionalConditionsAsString', () => {

        it('should replace placeholder text when asString is true', () => {
            const rawLicence = {additionalConditions: {1: {appointmentName: 'injected'}}};
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

            const output = addAdditionalConditionsAsString(rawLicence, selectedConditions);

            const expectedOutput = {
                additionalConditions: [
                    {
                        content: 'The condition injected with input',
                        group: 'g',
                        subgroup: 'sg'
                    }
                ]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text for appointment conditions for string', () => {
            const rawLicence = {
                additionalConditions: {
                    1: {
                        appointmentAddress: 'Address 1', appointmentDate: '21/01/2018', appointmentTime: '15:30'
                    }
                }
            };
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

            const output = addAdditionalConditionsAsString(rawLicence, selectedConditions);

            const expectedOutput = {
                additionalConditions: [
                    {
                        content: 'The condition Address 1 on 21/01/2018 at 15:30 with input',
                        group: 'g',
                        subgroup: 'sg'
                    }
                ]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text when multiple items when string', () => {
            const rawLicence = {additionalConditions: {1: {field: 'injected', appointmentTime: 'injected2'}}};
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

            const output = addAdditionalConditionsAsString(rawLicence, selectedConditions);

            const expectedOutput = {
                additionalConditions: [
                    {
                        content: 'The condition injected with input injected2 and another',
                        group: 'g',
                        subgroup: 'sg'
                    }
                ]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text when multiple items in wrong order as string', () => {
            const rawLicence = {additionalConditions: {1: {field: 'injected', appointmentTime: 'injected2'}}};
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

            const output = addAdditionalConditionsAsString(rawLicence, selectedConditions);

            const expectedOutput = {
                additionalConditions: [
                    {
                        content: 'The condition injected with input injected2 and another',
                        group: 'g',
                        subgroup: 'sg'
                    }
                ]
            };

            expect(output).to.eql(expectedOutput);

        });

        it('should replace placeholder text when multiple conditions as string', () => {
            const rawLicence = {
                additionalConditions: {
                    1: {field: 'injected', appointmentTime: 'injected2'},
                    2: {groupsOrOrganisation: 'injected3'}
                }
            };
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

            const output = addAdditionalConditionsAsString(rawLicence, selectedConditions);

            const expectedOutput = {
                additionalConditions: [
                    {
                        content: 'The condition injected with input injected2 and another',
                        group: 'g',
                        subgroup: 'sg'
                    },
                    {
                        content: 'The condition injected3',
                        group: 'g',
                        subgroup: 'sg'
                    }
                ]
            };

            expect(output).to.eql(expectedOutput);

        });
    });

    describe('createEligibilityObject', () => {

        it('should filter out any unacceptable data', () => {
            const input = {excluded: 'Yes', bad: 'yes'};
            expect(createEligibilityObject(input)).to.eql({excluded: 'Yes'});
        });

        it('should remove excludedReasons when excluded is No', () => {
            const input = {excluded: 'No', excludedReasons: ['blah', 'blah']};
            expect(createEligibilityObject(input)).to.eql({excluded: 'No'});
        });

        it('should remove unsuitableReasons when unsuitable is No', () => {
            const input = {unsuitable: 'No', unsuitableReasons: ['blah', 'blah']};
            expect(createEligibilityObject(input)).to.eql({unsuitable: 'No'});
        });

        it('should not remove unsuitableReasons when excluded is No', () => {
            const input = {unsuitable: 'Yes', excluded: 'No', unsuitableReasons: ['blah', 'blah']};
            expect(createEligibilityObject(input)).to.eql({
                unsuitable: 'Yes', excluded: 'No', unsuitableReasons: ['blah', 'blah']
            });
        });
    });

    describe('createBassReferralObject', () => {

        it('should filter out any unacceptable data', () => {
            const input = {bassReferralRequested: 'Yes', bad: 'yes'};
            expect(createBassReferralObject(input)).to.eql({bassReferralRequested: 'Yes'});
        });

        it('should remove children when excluded is No', () => {
            const input = {bassReferralRequested: 'No', proposedTown: 'blah'};
            expect(createBassReferralObject(input)).to.eql({bassReferralRequested: 'No'});
        });
    });
});
