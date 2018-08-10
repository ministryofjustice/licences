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
                    No: '/hdc/taskList/'
                },
                {
                    discriminator: 'electricity',
                    No: '/hdc/taskList/'
                }
            ],
            path: '/hdc/curfew/addressSafety/'
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
                    No: '/hdc/taskList/'
                }
            ],
            path: '/hdc/taskList/'
        }
    },
    curfewHours: {
        licenceSection: 'curfewHours',
        fields: [
            {firstNightFrom: {}},
            {firstNightUntil: {}},
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
            path: '/hdc/taskList/'
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
                    Yes: '/hdc/proposedAddress/curfewAddress/'
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
                    Yes: '/hdc/proposedAddress/curfewAddress/'
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
    }
};
