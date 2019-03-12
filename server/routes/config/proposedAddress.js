module.exports = {
  curfewAddressChoice: {
    nextPath: {
      discriminator: 'decision',
      Address: '/hdc/proposedAddress/curfewAddress/',
      Bass: '/hdc/bassReferral/bassRequest/',
      OptOut: '/hdc/taskList/',
    },
  },
  curfewAddress: {
    licenceSection: 'curfewAddress',
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
          responseType: 'requiredPhone',
        },
      },
      {
        occupier: {
          contains: [
            {
              name: {
                responseType: 'requiredString',
                validationMessage: 'Enter a name',
              },
            },
            {
              relationship: {
                responseType: 'requiredString',
                validationMessage: 'Enter a relationship',
              },
            },
            { isOffender: {} },
          ],
        },
      },
      {
        residents: {
          responseType: 'optionalList',
          isList: true,
          contains: [
            {
              name: {
                responseType: 'requiredString',
                validationMessage: 'Enter a name',
              },
            },
            {
              relationship: {
                responseType: 'requiredString',
                validationMessage: 'Enter a relationship',
              },
            },
            {
              age: {
                responseType: 'optionalAge',
                validationMessage: 'Invalid Age - Enter Number',
              },
            },
          ],
        },
      },
      {
        cautionedAgainstResident: {
          responseType: 'requiredYesNo',
          validationMessage: 'Select yes or no',
        },
      },
    ],
    nextPath: {
      path: '/hdc/taskList/',
      change: '/hdc/review/curfewAddress/',
    },
  },
  rejected: {
    pageDataMap: ['licence'],
    fields: [{ enterAlternative: {} }],
    nextPath: {
      decisions: {
        discriminator: 'enterAlternative',
        Yes: '/hdc/proposedAddress/curfewAddress/',
        No: '/hdc/proposedAddress/curfewAddressChoice/',
      },
    },
  },
}
