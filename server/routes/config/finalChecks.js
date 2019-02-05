module.exports = {
    seriousOffence: {
        licenceSection: 'seriousOffence',
        validate: true,
        fields: [
            {decision: {
                responseType: 'requiredYesNo',
                validationMessage: 'Select yes or no'
            }}
        ],
        nextPath: {
            path: '/hdc/finalChecks/onRemand/'
        }
    },
    onRemand: {
        licenceSection: 'onRemand',
        validate: true,
        fields: [
            {decision: {
                responseType: 'requiredYesNo',
                validationMessage: 'Select yes or no'
            }}
        ],
        nextPath: {
            path: '/hdc/finalChecks/confiscationOrder/'
        }
    },
    confiscationOrder: {
        licenceSection: 'confiscationOrder',
        validate: true,
        fields: [
            {decision: {
                responseType: 'requiredYesNo',
                validationMessage: 'Select yes or no'
            }},
            {confiscationUnitConsulted: {
                dependentOn: 'decision',
                predicate: 'Yes',
                responseType: 'requiredYesNoIf_decision_Yes',
                validationMessage: 'Select yes or no'
            }},
            {comments: {
                dependentOn: 'decision',
                predicate: 'Yes',
                responseType: 'requiredStringIf_confiscationUnitConsulted_Yes',
                validationMessage: 'Provide details'
            }}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    },
    postpone: {
        licenceSection: 'postpone',
        validate: true,
        fields: [
            {decision: {
                responseType: 'requiredYesNo',
                validationMessage: 'Select yes or no'
            }},
            {postponeReason: {
                dependentOn: 'decision',
                predicate: 'Yes',
                responseType: 'requiredStringIf_decision_Yes',
                validationMessage: 'Enter a reason'
            }}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    },
    refuse: {
        pageDataMap: ['licence', 'finalChecks', 'refusal'],
        saveSection: ['finalChecks', 'refusal'],
        fields: [
            {decision: {}},
            {reason: {}},
            {outOfTimeReasons: {}}
        ],
        nextPath: {
            decisions: {
                discriminator: 'decision',
                Yes: '/hdc/finalChecks/refusal/'
            },
            path: '/hdc/taskList/'
        }
    },
    refusal: {
        pageDataMap: ['licence', 'finalChecks', 'refusal'],
        saveSection: ['finalChecks', 'refusal'],
        fields: [
            {decision: {}},
            {reason: {}},
            {outOfTimeReasons: {}}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    }
};
