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
        }
    },
    withdrawAddress: {
        pageDataMap: ['licence'],
        fields: [
            {addressWithdrawn: {}}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    }
};
