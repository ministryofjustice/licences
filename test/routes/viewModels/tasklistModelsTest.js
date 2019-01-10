const taskListModel = require('../../../server/routes/viewModels/tasklistModels');

describe('Tasklist models', () => {
    describe('caFinalChecks', () => {
        it('should return list of tasks for standard route', () => {
            expect(taskListModel(
                'caTasksFinalChecks',
                {
                    curfewAddressApproved: true,
                    bassReferralNeeded: false,
                    bassWithdrawn: false,
                    bassAccepted: null,
                    optedOut: false
                },
                {
                    bassAreaCheck: 'UNSTARTED'
                },
                null
                )
            ).to.eql([
                {task: 'curfewAddressTask'},
                {task: 'riskManagementTask'},
                {task: 'victimLiaisonTask'},
                {task: 'curfewHoursTask'},
                {task: 'additionalConditionsTask'},
                {task: 'reportingInstructionsTask'},
                {task: 'finalChecksTask'},
                {task: 'postponementTask'},
                {task: 'HDCRefusalTask'},
                {task: 'caSubmitApprovalTask'}
            ]);
        });

        it('should return a limited set of tasks of curfew address not approved', () => {
            expect(taskListModel(
                'caTasksFinalChecks',
                {
                    curfewAddressApproved: false,
                    bassReferralNeeded: false,
                    bassWithdrawn: false,
                    bassAccepted: null,
                    optedOut: false
                },
                {
                    bassAreaCheck: 'UNSTARTED'
                },
                'caToDmRefusal'
                )
            ).to.eql([
                {task: 'curfewAddressTask'},
                {task: 'HDCRefusalTask'},
                {task: 'caSubmitRefusalTask'}
            ]);
        });

        it('should return bass specific list of tasks', () => {
            expect(taskListModel(
                'caTasksFinalChecks',
                {
                    curfewAddressApproved: false,
                    bassReferralNeeded: true,
                    bassWithdrawn: false,
                    bassAccepted: null,
                    optedOut: false
                },
                {
                    bassAreaCheck: 'DONE'
                },
                'caToDm'
                )
            ).to.eql([
                {task: 'bassOfferTask'},
                {task: 'riskManagementTask'},
                {task: 'victimLiaisonTask'},
                {task: 'curfewHoursTask'},
                {task: 'additionalConditionsTask'},
                {task: 'reportingInstructionsTask'},
                {task: 'finalChecksTask'},
                {task: 'postponementTask'},
                {task: 'HDCRefusalTask'},
                {task: 'caSubmitApprovalTask'}
            ]);
        });

        it('should not show submit tasks if opted out', () => {
            expect(taskListModel(
                'caTasksFinalChecks',
                {
                    curfewAddressApproved: false,
                    bassReferralNeeded: true,
                    bassWithdrawn: false,
                    bassAccepted: null,
                    optedOut: true
                },
                {
                    bassAreaCheck: 'DONE'
                },
                'caToDm'
                )
            ).to.eql([
                {task: 'bassOfferTask'},
                {task: 'riskManagementTask'},
                {task: 'victimLiaisonTask'},
                {task: 'curfewHoursTask'},
                {task: 'additionalConditionsTask'},
                {task: 'reportingInstructionsTask'},
                {task: 'finalChecksTask'},
                {task: 'postponementTask'},
                {task: 'HDCRefusalTask'}
            ]);
        });

        it('should return limited bass specific list of tasks when bass area check not done', () => {
            expect(taskListModel(
                'caTasksFinalChecks',
                {
                    curfewAddressApproved: false,
                    bassReferralNeeded: true,
                    bassWithdrawn: false,
                    bassAccepted: null,
                    optedOut: false
                },
                {
                    bassAreaCheck: 'UNFINISHED'
                },
                'caToDmRefusal'
                )
            ).to.eql([
                {task: 'bassOfferTask'},
                {task: 'HDCRefusalTask'},
                {task: 'caSubmitRefusalTask'}
            ]);
        });

        it('should return limited bass specific list of tasks when bass excluded', () => {
            expect(taskListModel(
                'caTasksFinalChecks',
                {
                    curfewAddressApproved: false,
                    bassReferralNeeded: true,
                    bassWithdrawn: false,
                    bassAccepted: 'Unsuitable',
                    optedOut: false
                },
                {
                    bassAreaCheck: 'DONE'
                },
                'caToDmRefusal'
                )
            ).to.eql([
                {task: 'bassOfferTask'},
                {task: 'HDCRefusalTask'},
                {task: 'caSubmitRefusalTask'}
            ]);
        });
    });
});
