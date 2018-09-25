module.exports = {
    standard: {
        fields: [
            {additionalConditionsRequired: {}}
        ],
        nextPath: {
            decisions: {
                discriminator: 'additionalConditionsRequired',
                Yes: {
                    path: '/hdc/licenceConditions/additionalConditions/',
                    change: '/hdc/licenceConditions/additionalConditions/change/'
                },
                No: {
                    path: '/hdc/taskList/',
                    change: '/hdc/review/licenceDetails/'
                }
            },
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/'
        },
        modificationRequiresApproval: true
    },
    conditionsSummary: {
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/'
        }
    }
};
