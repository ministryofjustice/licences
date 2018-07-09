const createConditionsService = require('../../server/services/conditionsService');

describe('conditionsService', () => {
    let licenceClient;
    let service;

    beforeEach(() => {
        licenceClient = {
            getStandardConditions: sinon.stub().resolves({a: 'b'}),
            getAdditionalConditions: sinon.stub().resolves([{text: 'v', user_input: {}}])
        };

        service = createConditionsService(licenceClient);
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

    describe('populateLicenceWithConditions', () => {

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
                licenceConditions: [{
                    content: [{text: 'The condition'}],
                    group: 'group',
                    subgroup: 'subgroup',
                    id: 1
                }]
            });
        });

        it('should return the licence if conditions not required', () => {
            const licence = {licenceConditions: {
                standard: {additionalConditionsRequired: 'No'},
                additional: {1: {}},
                bespoke: []
            }};
            licenceClient.getAdditionalConditions.resolves([{
                id: 1,
                user_input: null,
                text: 'The condition',
                field_position: null,
                group_name: 'group',
                subgroup_name: 'subgroup'
            }]);

            return expect(service.populateLicenceWithConditions(licence)).to.eventually.eql(licence);
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
                licenceConditions: {}
            });
        });

    });
});
