const taskListModel = require('../../../server/routes/viewModels/taskListModels');

describe('TaskList models', () => {
    describe('caEligibility', () => {
        it('should initially show just eligibility task', () => {
            expect(taskListModel(
                'caTasksEligibility',
                {
                    decisions: {
                        bassReferralNeeded: false,
                        optedOut: false,
                        eligible: false
                    },
                    tasks: {
                        eligibility: 'UNSTARTED',
                        optOut: 'UNSTARTED'
                    }
                },
                null
                )
            ).to.eql([{task: 'eligibilityTask'}]);
        });

        it('should show info and address task after eligibility successfully completed', () => {
            expect(taskListModel(
                'caTasksEligibility',
                {
                    decisions: {
                        bassReferralNeeded: false,
                        optedOut: false,
                        eligible: true
                    },
                    tasks: {
                        eligibility: 'DONE',
                        optOut: 'UNSTARTED'
                    }
                },
                null
                )
            ).to.eql([
                {task: 'eligibilityTask'},
                {task: 'informOffenderTask'},
                {task: 'proposedAddressTask'}
            ]);
        });

        it('should allow submission to RO when optout completed and not opted out', () => {
            expect(taskListModel(
                'caTasksEligibility',
                {
                    decisions: {
                        bassReferralNeeded: false,
                        optedOut: false,
                        eligible: true
                    },
                    tasks: {
                        eligibility: 'DONE',
                        optOut: 'DONE'
                    }
                },
                null
                )
            ).to.eql([
                {task: 'eligibilityTask'},
                {task: 'proposedAddressTask'},
                {task: 'caSubmitAddressReviewTask'}
            ]);
        });

        it('should allow submission for bass review if bass review selected', () => {
            expect(taskListModel(
                'caTasksEligibility',
                {
                    decisions: {
                        bassReferralNeeded: true,
                        optedOut: false,
                        eligible: true
                    },
                    tasks: {
                        eligibility: 'DONE',
                        optOut: 'DONE'
                    }
                },
                null
                )
            ).to.eql([
                {task: 'eligibilityTask'},
                {task: 'proposedAddressTask'},
                {task: 'caSubmitBassReviewTask'}
            ]);
        });

        it('should not allow submission for if opted out', () => {
            expect(taskListModel(
                'caTasksEligibility',
                {
                    decisions: {
                        bassReferralNeeded: true,
                        optedOut: true,
                        eligible: true
                    },
                    tasks: {
                        eligibility: 'DONE',
                        optOut: 'DONE'
                    }
                },
                null
                )
            ).to.eql([
                {task: 'eligibilityTask'},
                {task: 'proposedAddressTask'}
            ]);
        });

        it('should allow submission for refusal if ineligible', () => {
            expect(taskListModel(
                'caTasksEligibility',
                {
                    decisions: {
                        bassReferralNeeded: true,
                        optedOut: true,
                        eligible: false
                    },
                    tasks: {
                        eligibility: 'DONE',
                        optOut: 'DONE'
                    }
                },
                'caToDmRefusal'
                )
            ).to.eql([
                {task: 'eligibilityTask'},
                {task: 'caSubmitRefusalTask'}
            ]);
        });
    });

    describe('caFinalChecks', () => {
        it('should return list of tasks for standard route', () => {
            expect(taskListModel(
                'caTasksFinalChecks',
                {
                    decisions: {
                        bassReferralNeeded: false,
                        curfewAddressApproved: true,
                        bassWithdrawn: false,
                        bassAccepted: null,
                        optedOut: false
                    },
                    tasks: {
                        bassAreaCheck: 'UNSTARTED'
                    }
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
                    decisions: {
                        curfewAddressApproved: false,
                        bassReferralNeeded: false,
                        bassWithdrawn: false,
                        bassAccepted: null,
                        optedOut: false
                    },
                    tasks: {
                        bassAreaCheck: 'UNSTARTED'
                    }
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
                    decisions: {
                        curfewAddressApproved: false,
                        bassReferralNeeded: true,
                        bassWithdrawn: false,
                        bassAccepted: null,
                        optedOut: false
                    },
                    tasks: {
                        bassAreaCheck: 'DONE'
                    }
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
                    decisions: {
                        curfewAddressApproved: false,
                        bassReferralNeeded: true,
                        bassWithdrawn: false,
                        bassAccepted: null,
                        optedOut: true
                    },
                    tasks: {
                        bassAreaCheck: 'DONE'
                    }
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
                    decisions: {
                        curfewAddressApproved: false,
                        bassReferralNeeded: true,
                        bassWithdrawn: false,
                        bassAccepted: null,
                        optedOut: false
                    },
                    tasks: {
                        bassAreaCheck: 'UNFINISHED'
                    }
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
                    decisions: {
                        curfewAddressApproved: false,
                        bassReferralNeeded: true,
                        bassWithdrawn: false,
                        bassAccepted: 'Unsuitable',
                        optedOut: false
                    },
                    tasks: {
                        bassAreaCheck: 'DONE'
                    }
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

    describe('caTasksPostApproval', () => {
        it('should return list of tasks for standard route', () => {
            expect(taskListModel(
                'caTasksPostApproval',
                {
                    decisions: {
                        eligible: true,
                        curfewAddressApproved: true,
                        bassReferralNeeded: false,
                        bassWithdrawn: false,
                        bassExcluded: false,
                        bassAccepted: null,
                        optedOut: false,
                        dmRefused: false,
                        excluded: false
                    },
                    tasks: {
                        bassAreaCheck: 'UNSTARTED',
                        bassOffer: 'UNSTARTED'
                    }
                },
                null
                )
            ).to.eql([
                {task: 'eligibilitySummaryTask'},
                {task: 'curfewAddressTask'},
                {task: 'riskManagementTask'},
                {task: 'victimLiaisonTask'},
                {task: 'curfewHoursTask'},
                {task: 'additionalConditionsTask'},
                {task: 'reportingInstructionsTask'},
                {task: 'finalChecksTask'},
                {task: 'postponementTask'},
                {task: 'HDCRefusalTask'},
                {task: 'createLicenceTask'}
            ]);
        });

        it('should return bass tasks if required', () => {
            expect(taskListModel(
                'caTasksPostApproval',
                {
                    decisions: {
                        eligible: true,
                        curfewAddressApproved: true,
                        bassReferralNeeded: true,
                        bassWithdrawn: false,
                        bassExcluded: false,
                        bassAccepted: null,
                        optedOut: false,
                        dmRefused: false,
                        excluded: false
                    },
                    tasks: {
                        bassAreaCheck: 'UNSTARTED',
                        bassOffer: 'DONE'
                    }
                },
                null
                )
            ).to.eql([
                {task: 'eligibilitySummaryTask'},
                {task: 'bassAddressTask'},
                {task: 'riskManagementTask'},
                {task: 'victimLiaisonTask'},
                {task: 'curfewHoursTask'},
                {task: 'additionalConditionsTask'},
                {task: 'reportingInstructionsTask'},
                {task: 'finalChecksTask'},
                {task: 'postponementTask'},
                {task: 'HDCRefusalTask'},
                {task: 'createLicenceTask'}
            ]);
        });

        it('should return just eligibility and notice if ineligible ', () => {
            expect(taskListModel(
                'caTasksPostApproval',
                {
                    decisions: {
                        eligible: false,
                        curfewAddressApproved: true,
                        bassReferralNeeded: true,
                        bassWithdrawn: false,
                        bassExcluded: false,
                        bassAccepted: null,
                        optedOut: false,
                        dmRefused: false
                    },
                    tasks: {
                        bassAreaCheck: 'UNSTARTED',
                        bassOffer: 'DONE'
                    }
                },
                null
                )
            ).to.eql([
                {task: 'eligibilitySummaryTask'},
                {task: 'informOffenderTask'}
            ]);
        });

        it('should send for refusal if no approved address and no new one added', () => {
            expect(taskListModel(
                'caTasksPostApproval',
                {
                    decisions: {
                        eligible: true,
                        curfewAddressApproved: false,
                        bassReferralNeeded: false,
                        bassWithdrawn: false,
                        bassExcluded: false,
                        bassAccepted: null,
                        optedOut: false,
                        dmRefused: false
                    },
                    tasks: {
                        bassAreaCheck: 'UNSTARTED',
                        bassOffer: 'DONE'
                    }
                },
                'caToDmRefusal'
                )
            ).to.eql([
                {task: 'curfewAddressTask'},
                {task: 'HDCRefusalTask'},
                {task: 'caSubmitRefusalTask'}
            ]);
        });

        it('should show proposed address task if caToRo transition (new address added)', () => {
            expect(taskListModel(
                'caTasksPostApproval',
                {
                    decisions: {
                        eligible: true,
                        curfewAddressApproved: false,
                        bassReferralNeeded: false,
                        bassWithdrawn: false,
                        bassExcluded: false,
                        bassAccepted: null,
                        optedOut: false,
                        dmRefused: false
                    },
                    tasks: {
                        bassAreaCheck: 'UNSTARTED',
                        bassOffer: 'DONE'
                    }
                },
                'caToRo'
                )
            ).to.eql([
                {task: 'proposedAddressTask'},
                {task: 'HDCRefusalTask'},
                {task: 'caSubmitAddressReviewTask'}
            ]);
        });
    });


    describe('vary', () => {
        it('should return list of tasks for standard route', () => {
            expect(taskListModel(
                'vary',
                {
                    decisions: {},
                    tasks: {}
                },
                null
                )
            ).to.eql([{task: 'varyLicenceTask'}]);
        });
    });

    describe('caTasksPostApproval', () => {
        it('should show all tasks if address not rejected', () => {
            expect(taskListModel(
                'roTasks',
                {
                    decisions: {
                        addressReviewFailed: false,
                        addressUnsuitable: false
                    },
                    tasks: {}
                },
                'roToCa'
                )
            ).to.eql([
                {task: 'curfewAddressTask'},
                {task: 'riskManagementTask'},
                {task: 'victimLiaisonTask'},
                {task: 'curfewHoursTask'},
                {task: 'additionalConditionsTask'},
                {task: 'reportingInstructionsTask'},
                {task: 'roSubmitTask'}
            ]);
        });

        it('should show bass task if bass referral needed', () => {
            expect(taskListModel(
                'roTasks',
                {
                    decisions: {
                        addressReviewFailed: false,
                        addressUnsuitable: false,
                        bassReferralNeeded: true
                    },
                    tasks: {}
                },
                'roToCa'
                )
            ).to.eql([
                {task: 'bassAreaTask'},
                {task: 'riskManagementTask'},
                {task: 'victimLiaisonTask'},
                {task: 'curfewHoursTask'},
                {task: 'additionalConditionsTask'},
                {task: 'reportingInstructionsTask'},
                {task: 'roSubmitTask'}
            ]);
        });

        it('should show only curfew address review task and send if review failed', () => {
            expect(taskListModel(
                'roTasks',
                {
                    decisions: {
                        addressReviewFailed: true,
                        curfewAddressRejected: true,
                        addressUnsuitable: false,
                        bassReferralNeeded: false
                    },
                    tasks: {}
                },
                'roToCa'
                )
            ).to.eql([
                {task: 'curfewAddressTask'},
                {task: 'roSubmitTask'}
            ]);
        });

        it('should show only risk task and send if unsuitable failed', () => {
            expect(taskListModel(
                'roTasks',
                {
                    decisions: {
                        curfewAddressRejected: true,
                        bassReferralNeeded: false,
                        addressReviewFailed: false,
                        addressUnsuitable: true
                    },
                    tasks: {}
                },
                'roToCa'
                )
            ).to.eql([
                {task: 'riskManagementTask'},
                {task: 'roSubmitTask'}
            ]);
        });
    });
});
