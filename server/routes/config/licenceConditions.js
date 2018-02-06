module.exports = {
    standardConditions: {
        nextPathDecision: {
            fieldToDecideOn: 'additionalConditions',
            Yes: '/hdc/licenceConditions/additionalConditions/',
            No: '/hdc/licenceConditions/riskManagement/'
        }
    },
    conditionsReview: {
        licenceSection: 'additionalConditions',
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
        nextPath: '/hdc/taskList/'
    },
    curfewAddressReview: {
        licenceMap: ['licence', 'proposedAddress', 'curfewAddress'],
        nextPath: null,
        fields: [
            {landLordHDCConsent: {}},
            {hasElectricitySupply: {dependentOn: 'landLordHDCConsent', predicate: 'Yes'}},
            {homeVisitConducted: {dependentOn: 'landLordHDCConsent', predicate: 'Yes'}},
            {managedSafely: {}},
            {managedSafelyReasons: {dependentOn: 'managedSafely', predicate: 'No'}}
        ]
    }
};
