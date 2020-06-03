module.exports = {
  seriousOffence: {
    licenceSection: 'seriousOffence',
    validate: true,
    fields: [
      {
        decision: {
          responseType: 'requiredYesNo',
          validationMessage: 'Select yes or no',
        },
      },
    ],
    nextPath: {
      path: '/hdc/finalChecks/onRemand/',
    },
  },
  onRemand: {
    licenceSection: 'onRemand',
    validate: true,
    fields: [
      {
        decision: {
          responseType: 'requiredYesNo',
          validationMessage: 'Select yes or no',
        },
      },
    ],
    nextPath: {
      path: '/hdc/finalChecks/confiscationOrder/',
    },
  },
  confiscationOrder: {
    licenceSection: 'confiscationOrder',
    validate: true,
    fields: [
      {
        decision: {
          responseType: 'requiredYesNo',
          validationMessage: 'Select yes or no',
        },
      },
      {
        confiscationUnitConsulted: {
          dependentOn: 'decision',
          predicate: 'Yes',
          responseType: 'requiredYesNoIf_decision_Yes',
          validationMessage: 'Select yes or no',
        },
      },
      {
        comments: {
          dependentOn: 'decision',
          predicate: 'Yes',
          responseType: 'requiredStringIf_confiscationUnitConsulted_Yes',
          validationMessage: 'Provide details',
        },
      },
    ],
    nextPath: {
      path: '/hdc/taskList/',
    },
  },
  postpone: {
    licenceSection: 'postpone',
    validate: true,
    fields: [
      {
        decision: {
          responseType: 'requiredYesNo',
          validationMessage: 'Select yes or no',
        },
      },
      {
        postponeReason: {
          dependentOn: 'decision',
          predicate: 'Yes',
          responseType: 'requiredStringIf_decision_Yes',
          validationMessage: 'Select a reason',
        },
      },
    ],
    nomisPush: {
      status: ['finalChecks', 'postpone', 'decision'],
      reason: ['finalChecks', 'postpone', 'postponeReason'],
    },
    nextPath: {
      path: '/hdc/taskList/',
    },
  },
  // refuse: {
  //   pageDataMap: ['licence', 'finalChecks', 'refusal'],
  //   saveSection: ['finalChecks', 'refusal'],
  //   fields: [{ decision: {} }, { reason: {} }, { outOfTimeReasons: {} }],
  //   nextPath: {
  //     decisions: {
  //       discriminator: 'decision',
  //       Yes: '/hdc/finalChecks/refusal/',
  //     },
  //     path: '/hdc/taskList/',
  //   },
  // },
  // refusal: {
  //   pageDataMap: ['licence', 'finalChecks', 'refusal'],
  //   saveSection: ['finalChecks', 'refusal'],
  //   fields: [{ decision: {} }, { reason: {} }, { outOfTimeReasons: {} }],
  //   nomisPush: {
  //     status: ['finalChecks', 'refusal', 'decision'],
  //     reason: ['finalChecks', 'refusal', 'reason'],
  //   },
  //   nextPath: {
  //     path: '/hdc/taskList/',
  //   },
  // },

  refuse: {
    pageDataMap: ['licence', 'finalChecks', 'refusal'],
    saveSection: ['finalChecks', 'refusal'],

    fields: [
      {
        decision: {
          responseType: 'requiredYesNo',
          validationMessage: 'Select Yes or No',
        },
      },
      {
        reason: {
          dependentOn: 'decision',
          predicate: 'Yes',
          responseType: 'requiredReasonIf',
          validationMessage: 'Select a reason for refusing HDC',
        },
      },
      {
        outOfTimeReasons: {
          dependentOn: 'reason',
          predicate: 'insufficientTime',
          responseType: 'requiredSelectionIfOutOfTime',
          validationMessage: 'Select a reason(s) for Out of Time',
        },
      },
    ],
    nomisPush: {
      status: ['finalChecks', 'refusal', 'decision'],
      reason: ['finalChecks', 'refusal', 'reason'],
    },
    nextPath: {
      path: '/hdc/taskList/',
    },
    validate: true,
  },
}
