export default {
  riskManagement: {
    licenceSection: 'riskManagement',
    fields: [
      {
        planningActions: {
          responseType: 'requiredYesNoIfNot_version_2',
          validationMessage: 'Say if there are risk management actions',
        },
      },
      {
        awaitingInformation: {
          responseType: 'requiredYesNoIfNot_version_2',
          validationMessage: 'Say if you are still awaiting information',
        },
      },
      {
        hasConsideredChecks: {
          responseType: 'requiredYesNoIf_version_2',
          validationMessage: 'Say if there is risk information to be considered from police and children’s services',
        },
      },
      {
        awaitingOtherInformation: {
          responseType: 'requiredYesNoIf_version_2',
          validationMessage: 'Say if you are still awaiting other information',
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
        emsInformation: {
          dependentOn: 'proposedAddressSuitable',
          predicate: 'Yes',
          responseType: 'requiredYesNoIf_proposedAddressSuitable_Yes',
          validationMessage: 'Say if you want to provide additional information about the offender or the address',
        },
      },
      {
        emsInformationDetails: {
          dependentOn: 'proposedAddressSuitable',
          predicate: 'Yes',
          responseType: 'requiredStringIf_emsInformation_Yes',
          validationMessage: 'Provide information about the offender or the address',
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
      {
        version: {
          responseType: 'optionalString',
        },
      },
    ],
    nextPath: {
      path: '/hdc/taskList/',
      change: '/hdc/review/licenceDetails/',
    },
  },
}
