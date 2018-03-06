module.exports = {
    curfewAddressReview: {
        licenceMap: ['licence'],
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
        licenceMap: ['licence'],
        fields: [
            {deemedSafe: {}},
            {reason: {dependentOn: 'deemedSafe', predicate: 'No'}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'deemedSafe',
                    No: '/hdc/taskList/'
                }
            ],
            path: '/hdc/curfew/curfewHours/'
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
            path: '/hdc/licenceConditions/standard/'
        }
    }
};
