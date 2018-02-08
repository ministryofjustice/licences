module.exports = {
    curfewAddressReview: {
        licenceMap: ['licence', 'proposedAddress', 'curfewAddress'],
        fields: [
            {consent: {}},
            {electricity: {dependentOn: 'consent', predicate: 'Yes'}},
            {homeVisitConducted: {dependentOn: 'consent', predicate: 'Yes'}},
            {deemedSafe: {}},
            {safetyDetails: {dependentOn: 'deemedSafe', predicate: 'No'}}
        ],
        nextPath: '/hdc/licenceConditions/standardConditions/'
    },
    standardConditions: {
        fields: [
            {additionalConditionsRequired: {}}
        ],
        nextPathDecision: {
            discriminator: 'additionalConditionsRequired',
            Yes: '/hdc/licenceConditions/additionalConditions/',
            No: '/hdc/licenceConditions/riskManagement/'
        }
    },
    conditionsSummary: {
        nextPath: '/hdc/licenceConditions/riskManagement/'
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
        nextPath: '/licenceDetails/'
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
        nextPath: '/hdc/licenceConditions/standardConditions/'
    }
};
