const taskListModel = require('../../../server/routes/viewModels/taskListModels');

describe('TaskList models', () => {
    describe('caEligibility', () => {
        it('should initially show just eligibility task', () => {
            expect(taskListModel(
                'CA',
                false,
                {
                    decisions: {
                        bassReferralNeeded: false,
                        optedOut: false,
                        eligible: false
                    },
                    tasks: {
                        eligibility: 'UNSTARTED',
                        optOut: 'UNSTARTED'
                    },
                    stage: 'ELIGIBILITY'
                },
                {},
                {},
                null
                )
            ).to.eql({taskListModel: [{task: 'eligibilityTask'}]});
        });

        it('should show info and address task after eligibility successfully completed', () => {
            expect(taskListModel(
                'CA',
                false,
                {
                    decisions: {
                        bassReferralNeeded: false,
                        optedOut: false,
                        eligible: true
                    },
                    tasks: {
                        eligibility: 'DONE',
                        optOut: 'UNSTARTED'
                    },
                    stage: 'ELIGIBILITY'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {task: 'eligibilityTask'},
                    {task: 'informOffenderTask'},
                    {task: 'proposedAddressTask'}
                ]
            });
        });

        it('should allow submission to RO when optout completed and not opted out', () => {
            expect(taskListModel(
                'CA',
                false,
                {
                    decisions: {
                        bassReferralNeeded: false,
                        optedOut: false,
                        eligible: true
                    },
                    tasks: {
                        eligibility: 'DONE',
                        optOut: 'DONE'
                    },
                    stage: 'ELIGIBILITY'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {task: 'eligibilityTask'},
                    {task: 'proposedAddressTask'},
                    {task: 'caSubmitAddressReviewTask'}
                ]
            });
        });

        it('should allow submission for bass review if bass review selected', () => {
            expect(taskListModel(
                'CA',
                false,
                {
                    decisions: {
                        bassReferralNeeded: true,
                        optedOut: false,
                        eligible: true
                    },
                    tasks: {
                        eligibility: 'DONE',
                        optOut: 'DONE'
                    },
                    stage: 'ELIGIBILITY'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {task: 'eligibilityTask'},
                    {task: 'proposedAddressTask'},
                    {task: 'caSubmitBassReviewTask'}
                ]
            });
        });

        it('should not allow submission for if opted out', () => {
            expect(taskListModel(
                'CA',
                false,
                {
                    decisions: {
                        bassReferralNeeded: true,
                        optedOut: true,
                        eligible: true
                    },
                    tasks: {
                        eligibility: 'DONE',
                        optOut: 'DONE'
                    },
                    stage: 'ELIGIBILITY'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {task: 'eligibilityTask'},
                    {task: 'proposedAddressTask'}
                ]
            });
        });

        it('should allow submission for refusal if ineligible', () => {
            expect(taskListModel(
                'CA',
                false,
                {
                    decisions: {
                        bassReferralNeeded: true,
                        optedOut: true,
                        eligible: false
                    },
                    tasks: {
                        eligibility: 'DONE',
                        optOut: 'DONE'
                    },
                    stage: 'ELIGIBILITY'
                },
                {},
                'caToDmRefusal'
                )
            ).to.eql({
                taskListModel: [
                    {task: 'eligibilityTask'},
                    {task: 'caSubmitRefusalTask'}
                ]
            });
        });

        it('should allow submission for refusal if address rejected', () => {
            expect(taskListModel(
                'CA',
                false,
                {
                    decisions: {
                        bassReferralNeeded: true,
                        optedOut: false,
                        eligible: true,
                        curfewAddressRejected: true
                    },
                    tasks: {
                        eligibility: 'DONE',
                        optOut: 'DONE'
                    },
                    stage: 'ELIGIBILITY'
                },
                {},
                'caToDmRefusal'
                )
            ).to.eql({
                taskListModel: [
                    {task: 'eligibilityTask'},
                    {task: 'proposedAddressTask'},
                    {task: 'caSubmitRefusalTask'}
                ]
            });
        });
    });

    describe('caTasksFinalChecks', () => {
        it('should return list of tasks for standard route', () => {
            expect(taskListModel(
                'CA',
                false,
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
                    },
                    stage: 'PROCESSING_CA'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {
                        action: {
                            href: '/hdc/review/address/',
                            text: 'Change',
                            type: 'link'
                        },
                        label: 'Not completed',
                        title: 'Proposed curfew address'
                    },
                    {
                        action: {
                            href: '/hdc/risk/riskManagement/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Risk management'
                    },
                    {
                        action: {
                            href: '/hdc/victim/victimLiaison/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Victim liaison'
                    },
                    {
                        action: {
                            href: '/hdc/curfew/curfewHours/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Curfew hours'
                    },
                    {task: 'additionalConditionsTask'},
                    {task: 'reportingInstructionsTask'},
                    {task: 'finalChecksTask'},
                    {
                        label: 'Postpone the case if you\'re waiting for information on risk management',
                        title: 'Postpone or refuse',
                        action: {type: 'btn', text: 'Postpone', href: '/hdc/finalChecks/postpone/'}
                    },
                    {task: 'HDCRefusalTask'},
                    {task: 'caSubmitApprovalTask'}
                ]
            });
        });

        it('should return a limited set of tasks of curfew address not approved', () => {
            expect(taskListModel(
                'CA',
                false,
                {
                    decisions: {
                        curfewAddressApproved: false,
                        bassReferralNeeded: false,
                        bassWithdrawn: false,
                        bassAccepted: null,
                        optedOut: false,
                        addressUnsuitable: false
                    },
                    tasks: {
                        bassAreaCheck: 'UNSTARTED'
                    },
                    stage: 'PROCESSING_CA'
                },
                {},
                'caToDmRefusal'
                )
            ).to.eql({
                taskListModel: [
                    {
                        action: {
                            href: '/hdc/review/address/',
                            text: 'Change',
                            type: 'link'
                        },
                        label: 'Not completed',
                        title: 'Proposed curfew address'
                    },
                    {task: 'HDCRefusalTask'},
                    {task: 'caSubmitRefusalTask'}
                ]
            });
        });

        it('should show risk if adderss unsuitable', () => {
            expect(taskListModel(
                'CA',
                false,
                {
                    decisions: {
                        curfewAddressApproved: false,
                        bassReferralNeeded: false,
                        bassWithdrawn: false,
                        bassAccepted: null,
                        optedOut: false,
                        addressUnsuitable: true
                    },
                    tasks: {},
                    stage: 'PROCESSING_CA'
                },
                {},
                'caToDmRefusal'
                )
            ).to.eql({
                taskListModel: [
                    {
                        action: {
                            href: '/hdc/review/address/',
                            text: 'Change',
                            type: 'link'
                        },
                        label: 'Not completed',
                        title: 'Proposed curfew address'
                    },
                    {
                        action: {
                            href: '/hdc/risk/riskManagement/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Address unsuitable',
                        title: 'Risk management'
                    },
                    {task: 'HDCRefusalTask'},
                    {task: 'caSubmitRefusalTask'}
                ]
            });
        });

        it('should return bass specific list of tasks', () => {
            expect(taskListModel(
                'CA',
                false,
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
                    },
                    stage: 'PROCESSING_CA'
                },
                'caToDm'
                )
            ).to.eql({
                taskListModel: [
                    {
                        title: 'BASS address',
                        label: 'BASS referral requested',
                        action: {
                            href: '/hdc/bassReferral/bassOffer/',
                            text: 'Continue',
                            type: 'btn'
                        }
                    },
                    {
                        action: {
                            href: '/hdc/risk/riskManagement/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Risk management'
                    },
                    {
                        action: {
                            href: '/hdc/victim/victimLiaison/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Victim liaison'
                    },
                    {
                        action: {
                            href: '/hdc/curfew/curfewHours/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Curfew hours'
                    },
                    {task: 'additionalConditionsTask'},
                    {task: 'reportingInstructionsTask'},
                    {task: 'finalChecksTask'},
                    {
                        title: 'Postpone or refuse',
                        label: 'Postpone the case if you\'re waiting for information on risk management',
                        action: {
                            href: '/hdc/finalChecks/postpone/',
                            text: 'Postpone',
                            type: 'btn'
                        }
                    },
                    {task: 'HDCRefusalTask'},
                    {task: 'caSubmitApprovalTask'}
                ]
            });
        });

        it('should not show submit tasks if opted out', () => {
            expect(taskListModel(
                'CA',
                false,
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
                    },
                    stage: 'PROCESSING_CA'
                },
                {},
                'caToDm'
                )
            ).to.eql({
                taskListModel: [
                    {
                        title: 'BASS address',
                        label: 'BASS referral requested',
                        action: {
                            href: '/hdc/bassReferral/bassOffer/',
                            text: 'Continue',
                            type: 'btn'
                        }
                    },
                    {
                        action: {
                            href: '/hdc/risk/riskManagement/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Risk management'
                    },
                    {
                        action: {
                            href: '/hdc/victim/victimLiaison/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Victim liaison'
                    },
                    {
                        action: {
                            href: '/hdc/curfew/curfewHours/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Curfew hours'
                    },
                    {task: 'additionalConditionsTask'},
                    {task: 'reportingInstructionsTask'},
                    {task: 'finalChecksTask'},
                    {
                        title: 'Postpone or refuse',
                        label: 'Postpone the case if you\'re waiting for information on risk management',
                        action: {
                            href: '/hdc/finalChecks/postpone/',
                            text: 'Postpone',
                            type: 'btn'
                        }
                    },
                    {task: 'HDCRefusalTask'}
                ]
            });
        });

        it('should return limited bass specific list of tasks when bass area check not done', () => {
            expect(taskListModel(
                'CA',
                false,
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
                    },
                    stage: 'PROCESSING_CA'
                },
                {},
                'caToDmRefusal'
                )
            ).to.eql({
                taskListModel: [
                    {
                        title: 'BASS address',
                        label: 'BASS referral requested',
                        action: {
                            href: '/hdc/proposedAddress/curfewAddressChoice/',
                            text: 'Continue',
                            type: 'btn'
                        }
                    },
                    {task: 'HDCRefusalTask'},
                    {task: 'caSubmitRefusalTask'}
                ]
            });
        });

        it('should return limited bass specific list of tasks when bass excluded', () => {
            expect(taskListModel(
                'CA',
                false,
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
                    },
                    stage: 'PROCESSING_CA'
                },
                {},
                'caToDmRefusal'
                )
            ).to.eql({
                taskListModel: [
                    {
                        title: 'BASS address',
                        label: 'BASS referral requested',
                        action: {
                            href: '/hdc/bassReferral/bassOffer/',
                            text: 'Continue',
                            type: 'btn'
                        }
                    },
                    {task: 'HDCRefusalTask'},
                    {task: 'caSubmitRefusalTask'}
                ]
            });
        });

        it('should show proposed address task if caToRo transition (new address added)', () => {
            expect(taskListModel(
                'CA',
                false,
                {
                    decisions: {
                        bassReferralNeeded: false
                    },
                    tasks: {},
                    stage: 'PROCESSING_CA'
                },
                {},
                'caToRo'
                )
            ).to.eql({
                taskListModel: [
                    {task: 'proposedAddressTask'},
                    {task: 'HDCRefusalTask'},
                    {task: 'caSubmitAddressReviewTask'}
                ]
            });
        });
    });

    describe('caTasksPostApproval', () => {
        it('should return list of tasks for standard route', () => {
            expect(taskListModel(
                'CA',
                false,
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
                    },
                    stage: 'DECIDED'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {task: 'eligibilitySummaryTask'},
                    {
                        action: {
                            href: '/hdc/review/address/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Proposed curfew address'
                    },
                    {
                        action: {
                            href: '/hdc/risk/riskManagement/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Risk management'
                    },
                    {
                        action: {
                            href: '/hdc/victim/victimLiaison/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Victim liaison'
                    },
                    {
                        action: {
                            href: '/hdc/curfew/curfewHours/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Curfew hours'
                    },
                    {task: 'additionalConditionsTask'},
                    {task: 'reportingInstructionsTask'},
                    {task: 'finalChecksTask'},
                    {
                        title: 'Postpone or refuse',
                        label: 'Postpone the case if you\'re waiting for information on risk management',
                        action: {
                            href: '/hdc/finalChecks/postpone/',
                            text: 'Postpone',
                            type: 'btn'
                        }
                    },
                    {task: 'HDCRefusalTask'},
                    {task: 'createLicenceTask'}
                ]
            });
        });

        it('should return bass tasks if required', () => {
            expect(taskListModel(
                'CA',
                false,
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
                    },
                    stage: 'MODIFIED'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {task: 'eligibilitySummaryTask'},
                    {task: 'bassAddressTask'},
                    {
                        action: {
                            href: '/hdc/risk/riskManagement/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Risk management'
                    },
                    {
                        action: {
                            href: '/hdc/victim/victimLiaison/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Victim liaison'
                    },
                    {
                        action: {
                            href: '/hdc/curfew/curfewHours/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Curfew hours'
                    },
                    {task: 'additionalConditionsTask'},
                    {task: 'reportingInstructionsTask'},
                    {task: 'finalChecksTask'},
                    {
                        title: 'Postpone or refuse',
                        label: 'Postpone the case if you\'re waiting for information on risk management',
                        action: {
                            href: '/hdc/finalChecks/postpone/',
                            text: 'Postpone',
                            type: 'btn'
                        }
                    },
                    {task: 'HDCRefusalTask'},
                    {task: 'createLicenceTask'}
                ]
            });
        });

        it('should return just eligibility and notice if ineligible ', () => {
            expect(taskListModel(
                'CA',
                false,
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
                    },
                    stage: 'MODIFIED_APPROVAL'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {task: 'eligibilitySummaryTask'},
                    {task: 'informOffenderTask'}
                ]
            });
        });

        it('should send for refusal if no approved address and no new one added', () => {
            expect(taskListModel(
                'CA',
                false,
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
                    tasks: {},
                    stage: 'DECIDED'
                },
                {},
                'caToDmRefusal'
                )
            ).to.eql({
                taskListModel: [
                    {
                        action: {
                            href: '/hdc/review/address/',
                            text: 'View/Edit',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Proposed curfew address'
                    },
                    {task: 'HDCRefusalTask'},
                    {task: 'caSubmitRefusalTask'}
                ]
            });
        });

        it('should show proposed address task if caToRo transition (new address added)', () => {
            expect(taskListModel(
                'CA',
                false,
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
                    },
                    stage: 'DECIDED'
                },
                {},
                'caToRo'
                )
            ).to.eql({
                taskListModel: [
                    {task: 'proposedAddressTask'},
                    {task: 'HDCRefusalTask'},
                    {task: 'caSubmitAddressReviewTask'}
                ]
            });
        });
    });


    describe('vary', () => {
        it('should return vary licence task if licence is unstarted', () => {
            expect(taskListModel(
                'RO',
                true,
                {
                    decisions: {},
                    tasks: {},
                    stage: 'UNSTARTED'
                },
                {},
                null
                )
            ).to.eql({taskListModel: [{task: 'varyLicenceTask'}]});
        });

        it('should return the rest if licence not unstarted', () => {
            expect(taskListModel(
                'RO',
                true,
                {
                    decisions: {},
                    tasks: {},
                    stage: 'SOMETHINGELSE'
                },
                {version: 1},
                null
                )
            ).to.eql({
                taskListModel: [
                    {title: 'Permission for variation', action: {type: 'link', text: 'Change', href: '/hdc/vary/evidence/'}},
                    {title: 'Curfew address', action: {type: 'link', text: 'Change', href: '/hdc/vary/address/'}},
                    {title: 'Additional conditions', action: {type: 'link', text: 'Change', href: '/hdc/licenceConditions/standard/'}},
                    {title: 'Curfew hours', action: {type: 'link', text: 'Change', href: '/hdc/curfew/curfewHours/'}},
                    {title: 'Reporting instructions', action: {type: 'link', text: 'Change', href: '/hdc/vary/reportingAddress/'}},
                    {
                        title: 'Create licence',
                        label: 'Ready to create version 1',
                        action: {type: 'btn', href: '/hdc/pdf/select/', text: 'Continue'}
                    }
                ]
            });
        });

        it('should show current version if one exists and not show create task if version not different', () => {
            expect(taskListModel(
                'RO',
                true,
                {
                    decisions: {},
                    tasks: {},
                    stage: 'SOMETHINGELSE'
                },
                {
                    version: 2, approvedVersion: 2,
                    versionDetails: {version: 1, vary_version: 0},
                    approvedVersionDetails: {version: 1, vary_version: 0, template: 'templateName'}
                },
                null
                )
            ).to.eql({
                taskListModel: [
                    {
                        title: 'View current licence',
                        label: 'Licence version 2',
                        action: {type: 'btn', href: '/hdc/pdf/create/templateName/', text: 'View'}
                    },
                    {title: 'Permission for variation', action: {type: 'link', text: 'Change', href: '/hdc/vary/evidence/'}},
                    {title: 'Curfew address', action: {type: 'link', text: 'Change', href: '/hdc/vary/address/'}},
                    {title: 'Additional conditions', action: {type: 'link', text: 'Change', href: '/hdc/licenceConditions/standard/'}},
                    {title: 'Curfew hours', action: {type: 'link', text: 'Change', href: '/hdc/curfew/curfewHours/'}},
                    {title: 'Reporting instructions', action: {type: 'link', text: 'Change', href: '/hdc/vary/reportingAddress/'}}
                ]
            });
        });

        it('should not show current version if approved version is empty', () => {
            expect(taskListModel(
                'RO',
                true,
                {
                    decisions: {},
                    tasks: {},
                    stage: 'SOMETHINGELSE'
                },
                {
                    version: 2.2, approvedVersion: null,
                    versionDetails: {version: 1, vary_version: 0},
                    approvedVersionDetails: {}
                },
                null
                )
            ).to.eql({
                taskListModel: [
                    {title: 'Permission for variation', action: {type: 'link', text: 'Change', href: '/hdc/vary/evidence/'}},
                    {title: 'Curfew address', action: {type: 'link', text: 'Change', href: '/hdc/vary/address/'}},
                    {title: 'Additional conditions', action: {type: 'link', text: 'Change', href: '/hdc/licenceConditions/standard/'}},
                    {title: 'Curfew hours', action: {type: 'link', text: 'Change', href: '/hdc/curfew/curfewHours/'}},
                    {title: 'Reporting instructions', action: {type: 'link', text: 'Change', href: '/hdc/vary/reportingAddress/'}},
                    {
                        title: 'Create licence',
                        label: 'Ready to create version 2.2',
                        action: {type: 'btn', href: '/hdc/pdf/select/', text: 'Continue'}
                    }
                ]
            });
        });

        it('should show create licence if version ahead of approved version', () => {
            expect(taskListModel(
                'RO',
                true,
                {
                    decisions: {},
                    tasks: {},
                    stage: 'SOMETHINGELSE'
                },
                {
                    version: 1.2, approvedVersion: 1.1,
                    versionDetails: {version: 1, vary_version: 2},
                    approvedVersionDetails: {version: 1, vary_version: 1}
                },
                null
                )
            ).to.eql({
                taskListModel: [
                    {title: 'Permission for variation', action: {type: 'link', text: 'Change', href: '/hdc/vary/evidence/'}},
                    {title: 'Curfew address', action: {type: 'link', text: 'Change', href: '/hdc/vary/address/'}},
                    {title: 'Additional conditions', action: {type: 'link', text: 'Change', href: '/hdc/licenceConditions/standard/'}},
                    {title: 'Curfew hours', action: {type: 'link', text: 'Change', href: '/hdc/curfew/curfewHours/'}},
                    {title: 'Reporting instructions', action: {type: 'link', text: 'Change', href: '/hdc/vary/reportingAddress/'}},
                    {
                        title: 'Create licence',
                        label: 'Ready to create version 1.2',
                        action: {type: 'btn', href: '/hdc/pdf/select/', text: 'Continue'}
                    }
                ]
            });
        });
    });

    describe('caTasksPostApproval', () => {
        it('should show all tasks if address not rejected', () => {
            expect(taskListModel(
                'RO',
                false,
                {
                    decisions: {
                        addressReviewFailed: false,
                        addressUnsuitable: false
                    },
                    tasks: {},
                    stage: 'PROCESSING_RO'
                },
                {},
                'roToCa'
                )
            ).to.eql({
                taskListModel: [
                    {
                        action: {
                            href: '/hdc/curfew/curfewAddressReview/',
                            text: 'Continue',
                            type: 'btn'
                        },
                        label: 'Not completed',
                        title: 'Proposed curfew address'
                    },
                    {
                        action: {
                            href: '/hdc/risk/riskManagement/',
                            text: 'Continue',
                            type: 'btn'
                        },
                        label: 'Not completed',
                        title: 'Risk management'
                    },
                    {
                        action: {
                            href: '/hdc/victim/victimLiaison/',
                            text: 'Continue',
                            type: 'btn'
                        },
                        label: 'Not completed',
                        title: 'Victim liaison'
                    },
                    {
                        action: {
                            href: '/hdc/curfew/curfewHours/',
                            text: 'Continue',
                            type: 'btn'
                        },
                        label: 'Not completed',
                        title: 'Curfew hours'
                    },
                    {task: 'additionalConditionsTask'},
                    {task: 'reportingInstructionsTask'},
                    {task: 'roSubmitTask'}
                ]
            });
        });

        it('should show bass task if bass referral needed', () => {
            expect(taskListModel(
                'RO',
                false,
                {
                    decisions: {
                        addressReviewFailed: false,
                        addressUnsuitable: false,
                        bassReferralNeeded: true
                    },
                    tasks: {},
                    stage: 'PROCESSING_CA'
                },
                {},
                'roToCa'
                )
            ).to.eql({
                taskListModel: [
                    {task: 'bassAreaTask'},
                    {
                        action: {
                            href: '/hdc/risk/riskManagement/',
                            text: 'Continue',
                            type: 'btn'
                        },
                        label: 'Not completed',
                        title: 'Risk management'
                    },
                    {
                        action: {
                            href: '/hdc/victim/victimLiaison/',
                            text: 'Continue',
                            type: 'btn'
                        },
                        label: 'Not completed',
                        title: 'Victim liaison'
                    },
                    {
                        action: {
                            href: '/hdc/curfew/curfewHours/',
                            text: 'Continue',
                            type: 'btn'
                        },
                        label: 'Not completed',
                        title: 'Curfew hours'
                    },
                    {task: 'additionalConditionsTask'},
                    {task: 'reportingInstructionsTask'},
                    {task: 'roSubmitTask'}
                ]
            });
        });

        it('should show only curfew address review task and send if review failed', () => {
            expect(taskListModel(
                'RO',
                false,
                {
                    decisions: {
                        addressReviewFailed: true,
                        curfewAddressRejected: true,
                        addressUnsuitable: false,
                        bassReferralNeeded: false
                    },
                    tasks: {},
                    stage: 'APPROVAL'
                },
                {},
                'roToCa'
                )
            ).to.eql({
                taskListModel: [
                    {
                        action: {
                            href: '/hdc/curfew/curfewAddressReview/',
                            text: 'Change',
                            type: 'link'
                        },
                        label: 'Address rejected',
                        title: 'Proposed curfew address'
                    },
                    {task: 'roSubmitTask'}
                ]
            });
        });

        it('should show only risk task and send if unsuitable failed', () => {
            expect(taskListModel(
                'RO',
                false,
                {
                    decisions: {
                        curfewAddressRejected: true,
                        bassReferralNeeded: false,
                        addressReviewFailed: false,
                        addressUnsuitable: true
                    },
                    tasks: {},
                    stage: 'ELIGIBILITY'
                },
                {},
                'roToCa'
                )
            ).to.eql({
                taskListModel: [
                    {
                        action: {
                            href: '/hdc/risk/riskManagement/',
                            text: 'Continue',
                            type: 'btn'
                        },
                        label: 'Address unsuitable',
                        title: 'Risk management'
                    },
                    {task: 'roSubmitTask'}
                ]
            });
        });
    });

    describe('dmTasks', () => {
        it('should return eligibility and refusal if there is insufficient time', () => {
            expect(taskListModel(
                'DM',
                false,
                {
                    decisions: {insufficientTimeStop: true},
                    tasks: {},
                    stage: 'APPROVAL'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {task: 'eligibilitySummaryTask'},
                    {task: 'refusalTask'}
                ]
            });
        });

        it('should display refusal tasks if address withdrawn but not bassReferralNeeded', () => {
            expect(taskListModel(
                'DM',
                false,
                {
                    decisions: {
                        insufficientTimeStop: false,
                        bassReferralNeeded: false,
                        addressWithdrawn: true,
                        curfewAddressRejected: false
                    },
                    tasks: {},
                    stage: 'APPROVAL'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {task: 'eligibilitySummaryTask'},
                    {
                        title: 'Proposed curfew address',
                        label: 'Address withdrawn',
                        action: {
                            type: 'btn-secondary',
                            href: '/hdc/review/address/',
                            text: 'View'
                        }
                    },
                    {
                        title: 'Return to prison case admin',
                        action: {
                            type: 'btn-secondary',
                            href: '/hdc/send/return/',
                            text: 'Return to prison case admin'
                        }
                    },
                    {task: 'refusalTask'}
                ]
            });
        });

        it('should display refusal tasks if address rejected but not bassReferralNeeded', () => {
            expect(taskListModel(
                'DM',
                false,
                {
                    decisions: {
                        insufficientTimeStop: false,
                        bassReferralNeeded: false,
                        addressWithdrawn: false,
                        curfewAddressRejected: true
                    },
                    tasks: {},
                    stage: 'APPROVAL'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {task: 'eligibilitySummaryTask'},
                    {
                        title: 'Proposed curfew address',
                        label: 'Not completed',
                        action: {
                            type: 'btn-secondary',
                            href: '/hdc/review/address/',
                            text: 'View'
                        }
                    },
                    {
                        title: 'Return to prison case admin',
                        action: {
                            type: 'btn-secondary',
                            href: '/hdc/send/return/',
                            text: 'Return to prison case admin'
                        }
                    },
                    {task: 'refusalTask'}
                ]
            });
        });

        it('should display standard tasks if address approved', () => {
            expect(taskListModel(
                'DM',
                false,
                {
                    decisions: {
                        insufficientTimeStop: false,
                        bassReferralNeeded: false,
                        addressWithdrawn: false,
                        curfewAddressRejected: false,
                        curfewAddressApproved: true
                    },
                    tasks: {},
                    stage: 'APPROVAL'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {
                        action: {
                            href: '/hdc/review/address/',
                            text: 'View',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Proposed curfew address'
                    },
                    {
                        action: {
                            href: '/hdc/review/risk/',
                            text: 'View',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Risk management'
                    },
                    {
                        action: {
                            href: '/hdc/review/victimLiaison/',
                            text: 'View',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Victim liaison'
                    },
                    {
                        action: {
                            href: '/hdc/review/curfewHours/',
                            text: 'View',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Curfew hours'
                    },
                    {task: 'additionalConditionsTask'},
                    {task: 'reportingInstructionsTask'},
                    {task: 'finalChecksTask'},
                    {
                        action: {
                            href: '/hdc/send/return/',
                            text: 'Return to prison case admin',
                            type: 'btn-secondary'
                        },
                        title: 'Return to prison case admin'
                    },
                    {
                        action: {
                            href: '/hdc/approval/release/',
                            text: 'Continue',
                            type: 'btn'
                        },
                        label: 'Make decision',
                        title: 'Final decision'
                    }
                ]
            });
        });

        it('should display standard tasks if bassReferralNeeded', () => {
            expect(taskListModel(
                'DM',
                false,
                {
                    decisions: {
                        insufficientTimeStop: false,
                        bassReferralNeeded: true,
                        addressWithdrawn: false,
                        curfewAddressRejected: false,
                        curfewAddressApproved: false
                    },
                    tasks: {},
                    stage: 'APPROVAL'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {
                        title: 'BASS address',
                        label: 'BASS referral requested',
                        action: {
                            href: '/hdc/review/bassOffer/',
                            text: 'View',
                            type: 'btn-secondary'
                        }
                    },
                    {
                        action: {
                            href: '/hdc/review/risk/',
                            text: 'View',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Risk management'
                    },
                    {
                        action: {
                            href: '/hdc/review/victimLiaison/',
                            text: 'View',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Victim liaison'
                    },
                    {
                        action: {
                            href: '/hdc/review/curfewHours/',
                            text: 'View',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Curfew hours'
                    },
                    {task: 'additionalConditionsTask'},
                    {task: 'reportingInstructionsTask'},
                    {task: 'finalChecksTask'},
                    {
                        action: {
                            href: '/hdc/send/return/',
                            text: 'Return to prison case admin',
                            type: 'btn-secondary'
                        },
                        title: 'Return to prison case admin'
                    },
                    {
                        action: {
                            href: '/hdc/approval/release/',
                            text: 'Continue',
                            type: 'btn'
                        },
                        label: 'Make decision',
                        title: 'Final decision'
                    }
                ]
            });
        });

        it('should display postponement if confiscationOrder is true', () => {
            expect(taskListModel(
                'DM',
                false,
                {
                    decisions: {
                        insufficientTimeStop: false,
                        bassReferralNeeded: true,
                        addressWithdrawn: false,
                        curfewAddressRejected: false,
                        curfewAddressApproved: false,
                        confiscationOrder: true
                    },
                    tasks: {},
                    stage: 'APPROVAL'
                },
                {},
                null
                )
            ).to.eql({
                taskListModel: [
                    {
                        title: 'BASS address',
                        label: 'BASS referral requested',
                        action: {
                            href: '/hdc/review/bassOffer/',
                            text: 'View',
                            type: 'btn-secondary'
                        }
                    },
                    {
                        action: {
                            href: '/hdc/review/risk/',
                            text: 'View',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Risk management'
                    },
                    {
                        action: {
                            href: '/hdc/review/victimLiaison/',
                            text: 'View',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Victim liaison'
                    },
                    {
                        action: {
                            href: '/hdc/review/curfewHours/',
                            text: 'View',
                            type: 'btn-secondary'
                        },
                        label: 'Not completed',
                        title: 'Curfew hours'
                    },
                    {task: 'additionalConditionsTask'},
                    {task: 'reportingInstructionsTask'},
                    {task: 'finalChecksTask'},
                    {
                        action: {
                            href: '/hdc/finalChecks/postpone/',
                            text: 'Postpone',
                            type: 'btn'
                        },
                        label: 'Use this to indicate that the process is postponed if a confiscation order is in place',
                        title: 'Postpone'
                    },
                    {
                        action: {
                            href: '/hdc/send/return/',
                            text: 'Return to prison case admin',
                            type: 'btn-secondary'
                        },
                        title: 'Return to prison case admin'
                    },
                    {
                        action: {
                            href: '/hdc/approval/release/',
                            text: 'Continue',
                            type: 'btn'
                        },
                        label: 'Make decision',
                        title: 'Final decision'
                    }
                ]
            });
        });
    });

    describe('no task list', () => {
        it('should return no licence task', () => {
            expect(taskListModel(
                'RO',
                false,
                {
                    decisions: {},
                    tasks: {},
                    stage: 'UNSTARTED'
                },
                {},
                'roToCa'
                )
            ).to.eql({
                taskListModel: [
                    {
                        title: 'No active licence',
                        action: {type: 'link', text: 'Return to case list', href: '/caseList/'}
                    }
                ]
            });
        });
    });
});
