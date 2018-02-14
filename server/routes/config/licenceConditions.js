module.exports = {
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
            path: '/hdc/licenceConditions/riskManagement/'
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
            path: '/hdc/licenceConditions/reportingInstructions/'
        }
    },
    reportingInstructions: {
        licenceSection: 'reportingInstructions',
        fields: [
            {nameOfPerson: {}},
            {buildingAndStreet1: {}},
            {buildingAndStreet2: {}},
            {townOrCity: {}},
            {postcode: {}},
            {telephone: {}},
            {date: {}},
            {time: {}}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    }
};
