module.exports = {
    reportingInstructions: {
        licenceSection: 'reportingInstructions',
        fields: [
            {
                name: {
                    responseType: 'requiredString',
                    validationMessage: 'Enter a name',
                },
            },
            {
                buildingAndStreet1: {
                    responseType: 'requiredString',
                    validationMessage: 'Enter a building or street',
                },
            },
            {
                buildingAndStreet2: {
                    responseType: 'optionalString',
                },
            },
            {
                townOrCity: {
                    responseType: 'requiredString',
                    validationMessage: 'Enter a town or city',
                },
            },
            {
                postcode: {
                    responseType: 'requiredPostcode',
                    validationMessage: 'Enter a postcode in the right format',
                },
            },
            {
                telephone: {
                    responseType: 'requiredPhone',
                    validationMessage: 'Enter a telephone number in the right format',
                },
            },
        ],
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/',
        },
    },
    reportingDate: {
        licenceSection: 'reportingDate',
        fields: [
            {
                reportingDate: {
                    splitDate: { day: 'reportingDay', month: 'reportingMonth', year: 'reportingYear' },
                    responseType: 'requiredDate',
                    validationMessage: 'Enter a valid date',
                },
            },
            {
                reportingTime: {
                    responseType: 'requiredTime',
                    validationMessage: 'Enter a valid time',
                },
            },
        ],
        validate: true,
        noModify: true,
        nextPath: {
            path: '/hdc/pdf/taskList/',
        },
    },
}
