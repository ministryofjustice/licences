module.exports = {
    curfewAddressReview: {
        licenceMap: ['licence'],
        fields: [
            {consent: {}},
            {electricity: {dependentOn: 'consent', predicate: 'Yes'}},
            {homeVisitConducted: {dependentOn: 'consent', predicate: 'Yes'}},
            {deemedSafe: {}},
            {safetyDetails: {dependentOn: 'deemedSafe', predicate: 'No'}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'deemedSafe',
                    No: '/hdc/taskList/'
                },
                {
                    discriminator: 'safetyDetails',
                    No: '/hdc/taskList/'
                }
            ],
            path: '/hdc/licenceConditions/curfewHours/'
        }
    },
    standardConditions: {
        fields: [
            {additionalConditionsRequired: {}}
        ],
        nextPath: {
            decisions: {
                discriminator: 'additionalConditionsRequired',
                Yes: '/hdc/licenceConditions/additionalConditions/',
                No: '/hdc/licenceConditions/riskManagement/'
            },
            path: '/hdc/taskList/'
        }
    },
    conditionsSummary: {
        nextPath: {
            path: '/hdc/licenceConditions/riskManagement/'
        }
    },
    riskManagement: {
        licenceSection: 'riskManagement',
        fields: [
            {planningActions: {}},
            {planningActionsDetails: {dependentOn: 'planningActions', predicate: 'Yes'}},
            {awaitingInformation: {}},
            {awaitingInformationDetails: {dependentOn: 'awaitingInformation', predicate: 'Yes'}},
            {victimLiaison: {}},
            {victimLiaisonDetails: {dependentOn: 'victimLiaison', predicate: 'Yes'}}
        ],
        nextPath: {
            path: '/licenceDetails/'
        }
    },
    curfewHours: {
        licenceSection: 'curfewHours',
        fields: [
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
            path: '/hdc/licenceConditions/standardConditions/'
        }
    }
};
