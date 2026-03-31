module.exports = {
  approvedPremises: {
    pageDataMap: ['licence'],
    fields: [
      {
        required: {
          validationMessage: 'Say if the offender should be sent to approved premises',
        },
      },
    ],
    nextPath: {
      decisions: [
        {
          discriminator: 'required',
          No: {
            path: '/hdc/curfew/curfewAddressReview/',
            change: '/hdc/curfew/curfewAddressReview/change/',
          },
          Yes: {
            path: '/hdc/curfew/approvedPremisesAddress/',
            change: '/hdc/curfew/approvedPremisesAddress/change/',
          },
        },
      ],
      path: '/hdc/curfew/approvedPremisesAddress/',
      change: '/hdc/curfew/approvedPremisesAddress/change/',
    },
  },
  approvedPremisesAddress: {
    licenceSection: 'approvedPremisesAddress',
    validate: true,
    fields: [
      {
        addressLine1: {
          responseType: 'requiredString',
          validationMessage: 'Enter an address',
        },
      },
      {
        addressLine2: {
          responseType: 'optionalString',
        },
      },
      {
        addressTown: {
          responseType: 'requiredString',
          validationMessage: 'Enter a town or city',
        },
      },
      {
        postCode: {
          responseType: 'requiredPostcode',
          validationMessage: 'Enter a postcode',
        },
      },
      {
        telephone: {
          responseType: 'optionalPhone',
          validationMessage: 'Enter a telephone number in the right format',
        },
      },
      {
        additionlInformation: {
          responseType: 'optionalString',
        },
      },
    ],
    nextPath: {
      path: '/hdc/taskList/',
      change: '/hdc/review/licenceDetails/',
    },
  },
  approvedPremisesChoice: {
    pageDataMap: ['licence'],
    nextPath: {
      discriminator: 'decision',
      ApprovedPremises: '/hdc/curfew/approvedPremisesAddress/',
      OptOut: '/hdc/taskList/',
    },
  },
  curfewAddressReview: {
    pageDataMap: ['licence'],
    fields: [
      {
        consent: {
          validationMessage: 'Say if the homeowner consents to HDC',
        },
      },
      {
        consentHavingSpoken: {
          validationMessage: 'Say if you were able to speak to the main occupier and if they consented to HDC',
        },
      },
      {
        electricity: {
          validationMessage: 'Say if there is an electricity supply',
        },
      },
      {
        homeVisitConducted: {
          validationMessage: 'Say if you did a home visit',
        },
      },
      { addressReviewComments: {} },
      { version: '' },
    ],
    nextPath: {
      decisions: [
        {
          discriminator: 'consent',
          No: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/',
            modify: '/hdc/taskList/',
          },
        },
        {
          discriminator: 'consentHavingSpoken',
          No: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/',
            modify: '/hdc/taskList/',
          },
        },
        {
          discriminator: 'electricity',
          No: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/',
            modify: '/hdc/taskList/',
          },
        },
      ],
      path: '/hdc/taskList/',
      change: '/hdc/review/licenceDetails/',
      modify: '/hdc/taskList/',
    },
  },

  curfewHours: {
    licenceSection: 'curfewHours',
    fields: [
      { daySpecificInputs: { responseType: 'optionalString' } },
      {
        allFrom: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should start from',
          conditionallyActive: { daySpecificInputs: 'No' },
        },
      },
      {
        allUntil: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should run until',
          conditionallyActive: { daySpecificInputs: 'No' },
        },
      },
      {
        mondayFrom: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should start from on Monday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
      {
        mondayUntil: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should run until on Monday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
      {
        tuesdayFrom: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should start from on Tuesday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
      {
        tuesdayUntil: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should run until on Tuesday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
      {
        wednesdayFrom: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should start from on Wednesday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
      {
        wednesdayUntil: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should run until on Wednesday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
      {
        thursdayFrom: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should start from on Thursday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
      {
        thursdayUntil: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should run until on Thursday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
      {
        fridayFrom: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should start from on Friday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
      {
        fridayUntil: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should run until on Friday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
      {
        saturdayFrom: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should start from on Saturday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
      {
        saturdayUntil: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should run until on Saturday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
      {
        sundayFrom: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should start from on Sunday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
      {
        sundayUntil: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid time the curfew should run until on Sunday',
          conditionallyActive: { daySpecificInputs: 'Yes' },
        },
      },
    ],
    nextPath: {
      path: '/hdc/taskList/',
      change: '/hdc/review/licenceDetails/',
    },
    modificationRequiresApproval: true,
  },
  withdrawAddress: {
    pageDataMap: ['licence'],
    fields: [{ addressWithdrawn: {} }],
    nextPath: {
      decisions: [
        {
          discriminator: 'addressWithdrawn',
          Yes: '/hdc/curfew/addressWithdrawn/',
        },
      ],
      path: '/hdc/taskList/',
    },
  },
  addressWithdrawn: {
    fields: [{ enterNewAddress: {} }],
    nextPath: {
      decisions: [
        {
          discriminator: 'enterNewAddress',
          Yes: '/hdc/proposedAddress/curfewAddress/',
          No: '/hdc/proposedAddress/curfewAddressChoice/',
        },
      ],
      path: '/hdc/taskList/',
    },
  },
  withdrawConsent: {
    pageDataMap: ['licence'],
    fields: [{ consentWithdrawn: {} }],
    nextPath: {
      decisions: [
        {
          discriminator: 'consentWithdrawn',
          Yes: '/hdc/curfew/consentWithdrawn/',
        },
      ],
      path: '/hdc/taskList/',
    },
  },
  consentWithdrawn: {
    fields: [{ enterNewAddress: {} }],
    nextPath: {
      decisions: [
        {
          discriminator: 'enterNewAddress',
          Yes: '/hdc/proposedAddress/curfewAddress/',
          No: '/hdc/proposedAddress/curfewAddressChoice/',
        },
      ],
      path: '/hdc/taskList/',
    },
  },
  reinstateAddress: {
    fields: [{ consentWithdrawn: {} }, { addressWithdrawn: {} }],
    nextPath: {
      path: '/hdc/taskList/',
    },
  },
  firstNight: {
    licenceSection: 'firstNight',
    fields: [
      {
        firstNightFrom: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid from time',
        },
      },
      {
        firstNightUntil: {
          responseType: 'requiredTime',
          validationMessage: 'Enter a valid until time',
        },
      },
    ],
    validate: true,
    nextPath: {
      path: '/hdc/pdf/taskList/',
    },
  },
}
