module.exports = {
    curfewAddressReview: {
        pageDataMap: ['licence'],
        fields: [
            {consent: {}},
            {electricity: {dependentOn: 'consent', predicate: 'Yes'}},
            {homeVisitConducted: {dependentOn: 'consent', predicate: 'Yes'}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'consent',
                    No: {
                        path: '/hdc/taskList/',
                        change: '/hdc/review/licenceDetails/',
                        modify: '/hdc/taskList/'
                    }
                },
                {
                    discriminator: 'electricity',
                    No: {
                        path: '/hdc/taskList/',
                        change: '/hdc/review/licenceDetails/',
                        modify: '/hdc/taskList/'
                    }
                }
            ],
            path: '/hdc/curfew/addressSafety/',
            change: '/hdc/curfew/addressSafety/change/',
            modify: '/hdc/taskList/'
        }
    },
    addressSafety: {
        pageDataMap: ['licence'],
        fields: [
            {deemedSafe: {}},
            {unsafeReason: {dependentOn: 'deemedSafe', predicate: 'No'}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'deemedSafe',
                    No: {
                        path: '/hdc/taskList/',
                        change: '/hdc/review/licenceDetails/',
                        modify: '/hdc/taskList/'
                    }
                }
            ],
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/',
            modify: '/hdc/taskList/'
        }
    },
    curfewHours: {
        licenceSection: 'curfewHours',
        fields: [
            {daySpecificInputs: {}},
            {allFrom: {}},
            {allUntil: {}},
            {mondayFrom: {}},
            {mondayUntil: {}},
            {tuesdayFrom: {}},
            {tuesdayUntil: {}},
            {wednesdayFrom: {}},
            {wednesdayUntil: {}},
            {thursdayFrom: {}},
            {thursdayUntil: {}},
            {fridayFrom: {}},
            {fridayUntil: {}},
            {saturdayFrom: {}},
            {saturdayUntil: {}},
            {sundayFrom: {}},
            {sundayUntil: {}}
        ],
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/'
        },
        modificationRequiresApproval: true
    },
    withdrawAddress: {
        pageDataMap: ['licence'],
        fields: [
            {addressWithdrawn: {}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'addressWithdrawn',
                    Yes: '/hdc/curfew/addressWithdrawn/'
                }
            ],
            path: '/hdc/taskList/'
        }
    },
    addressWithdrawn: {
        fields: [
            {decision: {}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'decision',
                    Yes: '/hdc/proposedAddress/curfewAddress/add/',
                    No: '/hdc/taskList/'
                }
            ],
            path: '/hdc/taskList/'
        }
    },
    withdrawConsent: {
        pageDataMap: ['licence'],
        fields: [
            {consentWithdrawn: {}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'consentWithdrawn',
                    Yes: '/hdc/curfew/consentWithdrawn/'
                }
            ],
            path: '/hdc/taskList/'
        }
    },
    consentWithdrawn: {
        fields: [
            {decision: {}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'decision',
                    Yes: '/hdc/proposedAddress/curfewAddress/add/',
                    No: '/hdc/taskList/'
                }
            ],
            path: '/hdc/taskList/'
        }
    },
    reinstateAddress: {
        fields: [
            {consentWithdrawn: {}},
            {addressWithdrawn: {}}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    },
    firstNight: {
        fields: [
            {firstNightFrom: {}},
            {firstNightUntil: {}}
        ],
        validateInPlace: true,
        nextPath: {
            path: '/hdc/pdf/taskList/'
        }
    }
};
