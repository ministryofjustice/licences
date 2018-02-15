module.exports = {
    standard: {
        fields: [
            {additionalConditionsRequired: {}}
        ],
        nextPath: {
            decisions: {
                discriminator: 'additionalConditionsRequired',
                Yes: '/hdc/licenceConditions/additionalConditions/',
                No: '/hdc/risk/riskManagement/'
            },
            path: '/hdc/risk/riskManagement/'
        }
    },
    conditionsSummary: {
        nextPath: {
            path: '/hdc/risk/riskManagement/'
        }
    }
};
