module.exports = {
    victimLiaison: {
        licenceSection: 'victimLiaison',
        fields: [
            {
                decision: {
                    responseType: 'requiredYesNo',
                    validationMessage: 'Say if it is a victim liaison case'
                }
            },
            {
                victimLiaisonDetails: {
                    dependentOn: 'decision',
                    predicate: 'Yes',
                    responseType: 'requiredStringIf_decision_Yes',
                    validationMessage: 'Provide details of the victim liaison case'
                }
            }
        ],
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/'
        }
    }
};
