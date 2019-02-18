module.exports = {
    release: {
        licenceSection: 'release',
        validate: true,
        fields: [
            {
                decision: {
                    responseType: 'requiredYesNo',
                    validationMessage: 'Select yes or no',
                },
            },
            {
                decisionMaker: {
                    responseType: 'optionalString',
                },
            },
            {
                notedComments: {
                    conditionallyActive: { confiscationOrder: true },
                    dependentOn: 'decision',
                    predicate: 'Yes',
                    responseType: 'requiredStringIf_decision_Yes',
                    validationMessage: 'Add a comment',
                },
            },
            {
                reason: {
                    dependentOn: 'decision',
                    predicate: 'No',
                    responseType: 'requiredSelectionIf_decision_No',
                    validationMessage: 'Select a reason',
                },
            },
        ],
        nextPath: {
            path: '/hdc/send/decided/',
        },
    },
    refuseReason: {
        licenceSection: 'release',
        fields: [{ decision: {} }],
        nextPath: {
            path: '/hdc/send/decided/',
        },
        saveSection: ['approval', 'release'],
    },
}
