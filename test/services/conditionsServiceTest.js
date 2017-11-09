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
    });
});
