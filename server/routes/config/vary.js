module.exports = {
    evidence: {
        licenceSection: 'evidence',
        fields: [
            {evidence: {
                responseType: 'requiredString',
                validationMessage: 'Provide your evidence'
            }}
        ],
        nextPath: {
            path: '/hdc/vary/licenceDetails/'
        }
    },
    licenceDetails: {
        fields: [
            {
                addressLine1: {
                    responseType: 'requiredString', validationMessage: 'Enter an address',
                    licencePosition: ['proposedAddress', 'curfewAddress', 'addressLine1']
                }
            },
            {
                addressLine2: {
                    responseType: 'optionalString',
                    licencePosition: ['proposedAddress', 'curfewAddress', 'addressLine2']
                }
            },
            {
                addressTown: {
                    responseType: 'requiredString', validationMessage: 'Enter a town or city',
                    licencePosition: ['proposedAddress', 'curfewAddress', 'addressTown']
                }
            },
            {
                postCode: {
                    responseType: 'requiredPostcode', validationMessage: 'Enter a postcode',
                    licencePosition: ['proposedAddress', 'curfewAddress', 'postCode']
                }
            },
            {
                telephone: {
                    responseType: 'requiredPhone', validationMessage: 'Enter a telephone number in the right format',
                    licencePosition: ['proposedAddress', 'curfewAddress', 'telephone']
                }
            },
            {
                reportingContact: {
                    responseType: 'requiredString', validationMessage: 'Enter a reporting contact',
                    licencePosition: ['reporting', 'reportingInstructions', 'name']
                }
            },
            {
                reportingAddressLine1: {
                    responseType: 'requiredString', validationMessage: 'Enter a reporting address',
                    licencePosition: ['reporting', 'reportingInstructions', 'buildingAndStreet1']
                }
            },
            {
                reportingAddressLine2: {
                    responseType: 'optionalString',
                    licencePosition: ['reporting', 'reportingInstructions', 'buildingAndStreet2']
                }
            },
            {
                reportingAddressTown: {
                    responseType: 'requiredString', validationMessage: 'Enter a reporting town or city',
                    licencePosition: ['reporting', 'reportingInstructions', 'townOrCity']
                }
            },
            {
                reportingPostCode: {
                    responseType: 'requiredPostcode',
                    validationMessage: 'Enter a reporting postcode in the right format',
                    licencePosition: ['reporting', 'reportingInstructions', 'postcode']
                }
            },
            {
                reportingTelephone: {
                    responseType: 'requiredPhone',
                    validationMessage: 'Enter a reporting telephone number in the right format',
                    licencePosition: ['reporting', 'reportingInstructions', 'telephone']
                }
            },
            {
                daySpecificInputs: {
                    responseType: 'requiredYesNo',
                    validationMessage: 'Say if you require day specific curfew hours',
                    licencePosition: ['curfew', 'curfewHours', 'daySpecificInputs']
                }
            },
            {
                allFrom: {
                    responseType: 'optionalTime',
                    licencePosition: ['curfew', 'curfewHours', 'allFrom']
                }
            },
            {
                allUntil: {
                    responseType: 'optionalTime',
                    licencePosition: ['curfew', 'curfewHours', 'allUntil']
                }
            },
            {
                mondayFrom: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Monday time from',
                    licencePosition: ['curfew', 'curfewHours', 'mondayFrom']
                }
            },
            {
                mondayUntil: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Monday time to',
                    licencePosition: ['curfew', 'curfewHours', 'mondayUntil']
                }
            },
            {
                tuesdayFrom: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Tuesday time from',
                    licencePosition: ['curfew', 'curfewHours', 'tuesdayFrom']
                }
            },
            {
                tuesdayUntil: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Tuesday time to',
                    licencePosition: ['curfew', 'curfewHours', 'tuesdayUntil']
                }
            },
            {
                wednesdayFrom: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Wednesday time from',
                    licencePosition: ['curfew', 'curfewHours', 'wednesdayFrom']
                }
            },
            {
                wednesdayUntil: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Wednesday time to',
                    licencePosition: ['curfew', 'curfewHours', 'wednesdayUntil']
                }
            },
            {
                thursdayFrom: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Thursday time from',
                    licencePosition: ['curfew', 'curfewHours', 'thursdayFrom']
                }
            },
            {
                thursdayUntil: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Thursday time to',
                    licencePosition: ['curfew', 'curfewHours', 'thursdayUntil']
                }
            },
            {
                fridayFrom: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Friday time from',
                    licencePosition: ['curfew', 'curfewHours', 'fridayFrom']
                }
            },
            {
                fridayUntil: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Friday time to',
                    licencePosition: ['curfew', 'curfewHours', 'fridayUntil']
                }
            },
            {
                saturdayFrom: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Saturday time from',
                    licencePosition: ['curfew', 'curfewHours', 'saturdayFrom']
                }
            },
            {
                saturdayUntil: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Saturday time to',
                    licencePosition: ['curfew', 'curfewHours', 'saturdayUntil']
                }
            },
            {
                sundayFrom: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Sunday time from',
                    licencePosition: ['curfew', 'curfewHours', 'sundayFrom']
                }
            },
            {
                sundayUntil: {
                    responseType: 'requiredTimeIf_daySpecificInputs_Yes',
                    validationMessage: 'Enter a valid time for Sunday time to',
                    licencePosition: ['curfew', 'curfewHours', 'sundayUntil']
                }
            },
            {
                additionalConditions: {
                    responseType: 'requiredYesNo',
                    validationMessage: 'Say if you require additional conditions',
                    licencePosition: ['licenceConditions', 'standard', 'additionalConditionsRequired']
                }
            }
        ]
    }
};
