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
        reasonForDecision: {
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
    nomisPush: {
      status: ['approval', 'release', 'decision'],
      reason: ['approval', 'release', 'reason'],
    },
    nextPath: {
      path: '/hdc/send/decided/',
    },
  },
  refuseReason: {
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
        reason: {
          responseType: 'selection',
          validationMessage: 'Select a reason',
        },
      },
    ],
    nomisPush: {
      status: ['approval', 'release', 'decision'],
      reason: ['approval', 'release', 'reason'],
    },
    nextPath: {
      path: '/hdc/send/decided/',
    },
    saveSection: ['approval', 'release'],
  },
}
