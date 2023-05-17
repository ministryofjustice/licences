import { riskManagementVersion } from '../../config'

export default {
  riskManagement: {
    licenceSection: 'riskManagement',
    fields: [
      {
        planningActions: {
          responseType: 'requiredYesNoIf_version_1',
          validationMessage: 'Say if there are risk management actions',
        },
      },
      {
        awaitingInformation: {
          responseType: 'requiredYesNoIf_version_1',
          validationMessage: 'Say if you are still awaiting information',
        },
      },
      {
        hasConsideredChecks: {
          responseType: 'requiredYesNoIfNot_version_1',
          validationMessage:
            'Say if you have requested and considered risk information related to the proposed address',
        },
      },
      {
        awaitingOtherInformation: {
          responseType: 'requiredYesNoIfNot_version_1',
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
        manageInTheCommunity: {
          responseType: 'requiredYesNoIf_version_3',
          validationMessage:
            'Say if it is possible to manage the offender in the community safely at the proposed address',
        },
      },
      {
        manageInTheCommunityNotPossibleReason: {
          responseType: 'requiredStringIf_manageInTheCommunity_No',
          validationMessage: 'Provide details of why you made this decision',
        },
      },
      {
        pomConsultation: {
          responseType: 'requiredYesNoIf_version_3',
          validationMessage: 'Say if you have consulted the POM about the offender’s progress in custody',
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
