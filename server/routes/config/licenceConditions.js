module.exports = {
    standard: {
        fields: [
            {additionalConditionsRequired: {}}
        ],
        nextPath: {
            decisions: {
                discriminator: 'additionalConditionsRequired',
                Yes: '/hdc/licenceConditions/additionalConditions/',
                No: '/hdc/taskList/'
            },
            path: '/hdc/taskList/'
        }
    },
    conditionsSummary: {
        nextPath: {
            path: '/hdc/taskList/'
        }
    }
};
