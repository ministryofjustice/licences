module.exports = {
    riskManagement: {
        licenceSection: 'riskManagement',
        fields: [
            {planningActions: {
                responseType: 'requiredYesNo',
                validationMessage: 'Say if there are risk management actions'
            }},
            {planningActionsDetails: {
                dependentOn: 'planningActions',
                predicate: 'Yes',
                responseType: 'requiredStringIf_planningActions_Yes',
                validationMessage: 'Provide details of the risk management actions'
            }},
            {awaitingInformation: {
                responseType: 'requiredYesNo',
                validationMessage: 'Say if you are still awaiting information'
            }},
            {awaitingInformationDetails: {
                dependentOn: 'awaitingInformation',
                predicate: 'Yes',
                responseType: 'requiredStringIf_awaitingInformation_Yes',
                validationMessage: 'Provide details of the risk management actions'
            }},
            {victimLiaison: {
                responseType: 'requiredYesNo',
                validationMessage: 'Say if it is a victim liaison case'
            }},
            {victimLiaisonDetails: {
                dependentOn: 'victimLiaison',
                predicate: 'Yes',
                responseType: 'requiredStringIf_victimLiaison_Yes',
                validationMessage: 'Provide details of the victim liaison case'
            }}
        ],
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/'
        }
    }
};
