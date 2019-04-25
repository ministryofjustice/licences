module.exports = {
  excluded: {
    licenceSection: 'excluded',
    fields: [
      {
        decision: {
          responseType: 'requiredYesNo',
          validationMessage: 'Select yes or no',
        },
      },
      {
        reason: {
          dependentOn: 'decision',
          predicate: 'Yes',
          responseType: 'requiredSelectionIf_decision_Yes',
          validationMessage: 'Select one or more reasons',
        },
      },
    ],
    validate: true,
    nomisPush: {
      status: ['eligibility', 'excluded', 'decision'],
      reason: ['eligibility', 'excluded', 'reason'],
      checksFailedStatusValue: 'Yes',
    },
    nextPath: {
      decisions: [
        {
          discriminator: 'decision',
          No: '/hdc/eligibility/suitability/',
        },
        {
          discriminator: 'decision',
          Yes: '/hdc/taskList/',
        },
      ],
    },
  },
  suitability: {
    licenceSection: 'suitability',
    fields: [
      {
        decision: {
          responseType: 'requiredYesNo',
          validationMessage: 'Select yes or no',
        },
      },
      {
        reason: {
          dependentOn: 'decision',
          predicate: 'Yes',
          responseType: 'requiredSelectionIf_decision_Yes',
          validationMessage: 'Select one or more reasons',
        },
      },
    ],
    validate: true,
    nextPath: {
      decisions: [
        {
          discriminator: 'decision',
          No: '/hdc/eligibility/crdTime/',
        },
        {
          discriminator: 'decision',
          Yes: '/hdc/eligibility/exceptionalCircumstances/',
        },
      ],
    },
  },
  exceptionalCircumstances: {
    licenceSection: 'exceptionalCircumstances',
    fields: [
      {
        decision: {
          responseType: 'requiredYesNo',
          validationMessage: 'Select yes or no',
        },
      },
    ],
    validate: true,
    nomisPush: {
      status: ['eligibility', 'exceptionalCircumstances', 'decision'],
      reason: ['eligibility', 'suitability', 'reason'],
      checksFailedStatusValue: 'No',
    },
    nextPath: {
      decisions: [
        {
          discriminator: 'decision',
          No: '/hdc/taskList/',
        },
        {
          discriminator: 'decision',
          Yes: '/hdc/eligibility/crdTime/',
        },
      ],
    },
  },
  crdTime: {
    licenceSection: 'crdTime',
    fields: [
      {
        decision: {
          responseType: 'requiredYesNo',
          validationMessage: 'Select yes or no',
        },
      },
      {
        dmApproval: {
          dependentOn: 'decision',
          predicate: 'Yes',
          responseType: 'requiredYesNoIf_decision_Yes',
          validationMessage: 'Select yes or no',
        },
      },
    ],
    validate: true,
    nextPath: {
      path: '/hdc/taskList/',
    },
  },
}
