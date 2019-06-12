module.exports = {
  riskManagement: {
    licenceSection: 'riskManagement',
    fields: [
      {
        planningActions: {
          responseType: 'requiredYesNo',
          validationMessage: 'Say if there are risk management actions',
        },
      },
      {
        awaitingInformation: {
          responseType: 'requiredYesNo',
          validationMessage: 'Say if you are still awaiting information',
        },
      },
      {
        riskManagementDetails: {
          responseType: 'optionalString',
        },
      },
      {
        proposedAddressSuitable: {
          responseType: 'requiredYesNo',
          validationMessage: 'Say if the proposed address is suitable',
        },
      },
      {
        unsuitableReason: {
          responseType: 'requiredStringIf_proposedAddressSuitable_No',
          validationMessage: 'Provide details of why you made this decision',
        },
      },
      {
        nonDisclosableInformation: {
          responseType: 'requiredYesNo',
          validationMessage: 'Say if you want to add information that cannot be disclosed to the offender',
        },
      },
      {
        nonDisclosableInformationDetails: {
          responseType: 'requiredStringIf_nonDisclosableInformation_Yes',
          validationMessage: 'Provide information that cannot be disclosed to the offender',
        },
      },
    ],
    nextPath: {
      path: '/hdc/taskList/',
      change: '/hdc/review/licenceDetails/',
    },
  },
}
