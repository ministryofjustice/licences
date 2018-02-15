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
            path: '/hdc/risk/riskManagement/'
        }
    }
};
