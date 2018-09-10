const {getStatusLabel} = require('../../server/utils/licenceStatusLabels');
const {licenceStages} = require('../../server/models/licenceStages');

describe('getStatusLabel', () => {

    describe('default label for unstarted licences', () => {

        const defaultLabel = 'Not started';

        const examples = [
            {status: undefined, reason: 'missing'},
            {status: {}, reason: 'empty'},
            {status: {stage: licenceStages.ELIGIBILITY, tasks: {}}, reason: 'missing decisions'},
            {status: {stage: licenceStages.ELIGIBILITY, decisions: {}}, reason: 'missing tasks'}
        ];

        examples.forEach(example => {
            it(`should give default label when licence is ${example.reason}`, () => {
                expect(getStatusLabel(example.status, 'CA')).to.eql(defaultLabel);
            });
        });
    });


    describe('CA user labels', () => {

        describe('ELIGIBILITY stage', () => {
            const examples = [
                {
                    status: {stage: licenceStages.ELIGIBILITY, decisions: {}, tasks: {}},
                    label: 'Checking eligibility'
                },
                {
                    status: {stage: licenceStages.ELIGIBILITY, decisions: {excluded: true}, tasks: {}},
                    label: 'Excluded (Ineligible)'
                },
                {
                    status: {stage: licenceStages.ELIGIBILITY, decisions: {insufficientTime: true}, tasks: {}},
                    label: 'Not enough time'
                },
                {
                    status: {stage: licenceStages.ELIGIBILITY, decisions: {unsuitableResult: true}, tasks: {}},
                    label: 'Presumed unsuitable'
                },
                {
                    status: {stage: licenceStages.ELIGIBILITY, decisions: {optedOut: true}, tasks: {}},
                    label: 'Opted out'
                },
                {
                    status: {stage: licenceStages.ELIGIBILITY, decisions: {bassReferralNeeded: true}, tasks: {}},
                    label: 'Getting address'
                },
                {
                    status: {
                        stage: licenceStages.ELIGIBILITY,
                        decisions: {curfewAddressApproved: 'rejected'},
                        tasks: {}
                    },
                    label: 'Address rejected'
                },
                {
                    status: {
                        stage: licenceStages.ELIGIBILITY,
                        decisions: {curfewAddressApproved: 'rejected', unsuitableResult: false},
                        tasks: {}
                    },
                    label: 'Address rejected'
                },
                {
                    status: {
                        stage: licenceStages.ELIGIBILITY,
                        decisions: {curfewAddressApproved: 'rejected', unsuitableResult: true},
                        tasks: {}
                    },
                    label: 'Presumed unsuitable'
                }
            ];

            assertLabels(examples, 'CA');
        });

        describe('ELIGIBILITY stage - message priority when multiple reasons', () => {

            const examples = [
                {
                    status: {
                        stage: licenceStages.ELIGIBILITY,
                        decisions: {excluded: true, insufficientTime: true, unsuitableResult: true}, tasks: {}
                    },
                    label: 'Excluded (Ineligible)'
                },
                {
                    status: {
                        stage: licenceStages.ELIGIBILITY,
                        decisions: {insufficientTime: true, unsuitableResult: true}, tasks: {}
                    },
                    label: 'Presumed unsuitable'
                }
            ];

            assertLabels(examples, 'CA');
        });


        describe('PROCESSING_CA stage', () => {
            const examples = [
                {
                    status: {stage: licenceStages.PROCESSING_CA, decisions: {}, tasks: {}},
                    label: 'Reviewing case'
                },
                {
                    status: {stage: licenceStages.PROCESSING_CA, decisions: {excluded: true}, tasks: {}},
                    label: 'Excluded (Ineligible)'
                },
                {
                    status: {
                        stage: licenceStages.PROCESSING_CA,
                        decisions: {curfewAddressApproved: 'rejected'},
                        tasks: {}
                    },
                    label: 'Address not suitable'
                },
                {
                    status: {stage: licenceStages.PROCESSING_CA, decisions: {postponed: true}, tasks: {}},
                    label: 'Postponed'
                }
            ];

            assertLabels(examples, 'CA');
        });

        describe('PROCESSING_CA stage - message priority when multiple reasons', () => {

            const examples = [
                {
                    status: {
                        stage: licenceStages.PROCESSING_CA,
                        decisions: {excluded: true, curfewAddressApproved: 'approved', postponed: true}, tasks: {}
                    },
                    label: 'Postponed'
                },
                {
                    status: {
                        stage: licenceStages.PROCESSING_CA,
                        decisions: {excluded: true, curfewAddressApproved: 'rejected'}, tasks: {}
                    },
                    label: 'Excluded (Ineligible)'
                }
            ];

            assertLabels(examples, 'CA');
        });

        describe('Other stages', () => {

            const examples = [
                {
                    status: {stage: licenceStages.PROCESSING_RO, decisions: {}, tasks: {}},
                    label: 'With responsible officer'
                },
                {
                    status: {stage: licenceStages.APPROVAL, decisions: {}, tasks: {}},
                    label: 'Submitted to DM'
                },
                {
                    status: {stage: licenceStages.DECIDED, decisions: {approved: true}, tasks: {}},
                    label: 'Approved'
                },
                {
                    status: {stage: licenceStages.DECIDED, decisions: {refused: true}, tasks: {}},
                    label: 'Refused'
                }
            ];

            assertLabels(examples, 'CA');
        });

    });

    describe('RO user labels', () => {

        describe('PROCESSING_RO stage', () => {
            const examples = [
                {
                    status: {stage: licenceStages.PROCESSING_RO, decisions: {}, tasks: {}},
                    label: 'Ready to check'
                },
                {
                    status: {
                        stage: licenceStages.PROCESSING_RO,
                        decisions: {},
                        tasks: {curfewAddressReview: 'UNSTARTED', reportingInstructions: 'DONE'}
                    },
                    label: 'Ready to check'
                },
                {
                    status: {stage: licenceStages.PROCESSING_RO, decisions: {}, tasks: {curfewAddressReview: 'DONE'}},
                    label: 'Assessment ongoing'
                },
                {
                    status: {stage: licenceStages.PROCESSING_RO, decisions: {}, tasks: {curfewHours: 'STARTED'}},
                    label: 'Assessment ongoing'
                },
                {
                    status: {stage: licenceStages.PROCESSING_RO, decisions: {}, tasks: {licenceConditions: 'DONE'}},
                    label: 'Assessment ongoing'
                },
                {
                    status: {stage: licenceStages.PROCESSING_RO, decisions: {}, tasks: {riskManagement: 'STARTED'}},
                    label: 'Assessment ongoing'
                },
                {
                    status: {stage: licenceStages.PROCESSING_RO, decisions: {}, tasks: {reportingInstructions: 'DONE'}},
                    label: 'Assessment ongoing'
                }
            ];

            assertLabels(examples, 'RO');
        });

        describe('PROCESSING_CA stage', () => {
            const examples = [
                {
                    status: {stage: licenceStages.PROCESSING_CA, decisions: {}, tasks: {}},
                    label: 'Submitted to PCA'
                },
                {
                    status: {stage: licenceStages.PROCESSING_CA, decisions: {excluded: true}, tasks: {}},
                    label: 'Submitted to PCA'
                },
                {
                    status: {
                        stage: licenceStages.PROCESSING_CA,
                        decisions: {curfewAddressApproved: 'rejected'},
                        tasks: {}
                    },
                    label: 'Submitted to PCA'
                },
                {
                    status: {stage: licenceStages.PROCESSING_CA, decisions: {postponed: true}, tasks: {}},
                    label: 'Postponed'
                }
            ];

            assertLabels(examples, 'RO');
        });

        describe('Other stages', () => {

            const examples = [
                {
                    status: {stage: licenceStages.ELIGIBILITY, decisions: {}, tasks: {}},
                    label: 'Checking eligibility'
                },
                {
                    status: {stage: licenceStages.APPROVAL, decisions: {approved: true}, tasks: {}},
                    label: 'Submitted to DM'
                },
                {
                    status: {stage: licenceStages.DECIDED, decisions: {approved: true}, tasks: {}},
                    label: 'Approved'
                },
                {
                    status: {stage: licenceStages.DECIDED, decisions: {refused: true}, tasks: {}},
                    label: 'Refused'
                }
            ];

            assertLabels(examples, 'RO');
        });
    });

    describe('DM user labels', () => {

        describe('Approval stage', () => {

            const examples = [
                {
                    status: {stage: licenceStages.APPROVAL, decisions: {}, tasks: {}},
                    label: 'Awaiting decision'
                },
                {
                    status: {stage: licenceStages.APPROVAL, decisions: {insufficientTimeStop: true}, tasks: {}},
                    label: 'Awaiting refusal'
                }
            ];

            assertLabels(examples, 'DM');
        });

        describe('Other stages', () => {

            const examples = [
                {
                    status: {stage: licenceStages.ELIGIBILITY, decisions: {}, tasks: {}},
                    label: 'Checking eligibility'
                },
                {
                    status: {stage: licenceStages.PROCESSING_RO, decisions: {}, tasks: {}},
                    label: 'With responsible officer'
                },
                {
                    status: {stage: licenceStages.PROCESSING_CA, decisions: {}, tasks: {}},
                    label: 'Submitted to PCA'
                },
                {
                    status: {stage: licenceStages.DECIDED, decisions: {approved: true}, tasks: {}},
                    label: 'Approved'
                },
                {
                    status: {stage: licenceStages.DECIDED, decisions: {refused: true}, tasks: {}},
                    label: 'Refused'
                }
            ];

            assertLabels(examples, 'DM');
        });
    });

    function assertLabels(examples, role) {
        examples.forEach(example => {
            it(`should give ${example.label}`, () => {
                expect(getStatusLabel(example.status, role)).to.eql(example.label);
            });
        });
    }
})
;
