module.exports = {
    standard: {
        fields: [
            {
                additionalConditionsRequired: {
                    responseType: 'requiredYesNo',
                    validationMessage: 'Select yes or no',
                },
            },
        ],
        nextPath: {
            decisions: {
                discriminator: 'additionalConditionsRequired',
                Yes: {
                    path: '/hdc/licenceConditions/additionalConditions/',
                    change: '/hdc/licenceConditions/additionalConditions/change/',
                },
                No: {
                    path: '/hdc/taskList/',
                    change: '/hdc/review/licenceDetails/',
                },
            },
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/',
        },
        modificationRequiresApproval: true,
    },
    additional: {
        fields: [
            {
                NOCONTACTASSOCIATE: {
                    contains: [
                        {
                            groupsOrOrganisation: {
                                validationMessage: 'Enter a name or describe specific groups or organisations',
                            },
                        },
                    ],
                },
            },
            {
                INTIMATERELATIONSHIP: {
                    contains: [
                        {
                            intimateGender: {
                                validationMessage: 'Select women / men / women or men',
                            },
                        },
                    ],
                },
            },
            {
                NOCONTACTNAMED: {
                    contains: [
                        {
                            noContactOffenders: {
                                validationMessage: 'Enter named offender(s) or individual(s)',
                            },
                        },
                    ],
                },
            },
            {
                NORESIDE: {
                    contains: [
                        {
                            notResideWithGender: {
                                validationMessage: 'Select any / any female / any male',
                            },
                        },
                        {
                            notResideWithAge: {
                                validationMessage: 'Enter age',
                            },
                        },
                    ],
                },
            },
            {
                NOUNSUPERVISEDCONTACT: {
                    contains: [
                        {
                            unsupervisedContactGender: {
                                validationMessage: 'Select any / any female / any male',
                            },
                        },
                        {
                            unsupervisedContactAge: {
                                validationMessage: 'Enter age',
                            },
                        },
                        {
                            unsupervisedContactSocial: {
                                validationMessage: 'Enter name of appropriate social service department',
                            },
                        },
                    ],
                },
            },
            {
                NOCHILDRENSAREA: {
                    contains: [
                        {
                            notInSightOf: {
                                validationMessage: "Enter location, for example children's play area",
                            },
                        },
                    ],
                },
            },
            {
                NOWORKWITHAGE: {
                    contains: [
                        {
                            noWorkWithAge: {
                                validationMessage: 'Enter age',
                            },
                        },
                    ],
                },
            },
            {
                NOCOMMUNICATEVICTIM: {
                    contains: [
                        {
                            victimFamilyMembers: {
                                validationMessage: 'Enter name of victim and /or family members',
                            },
                        },
                        {
                            socialServicesDept: {
                                validationMessage: 'Enter name of appropriate social service department',
                            },
                        },
                    ],
                },
            },
            {
                COMPLYREQUIREMENTS: {
                    contains: [
                        {
                            courseOrCentre: {
                                validationMessage: 'Enter name of course / centre',
                            },
                        },
                    ],
                },
            },
            {
                ATTENDALL: {
                    contains: [
                        {
                            appointmentName: {
                                validationMessage: 'Enter name',
                            },
                        },
                        {
                            appointmentProfession: {
                                validationMessage: 'Select psychiatrist / psychologist / medical practitioner',
                            },
                        },
                    ],
                },
            },
            {
                HOMEVISITS: {
                    contains: [
                        {
                            mentalHealthName: {
                                validationMessage: 'Enter name',
                            },
                        },
                    ],
                },
            },
            {
                REMAINADDRESS: {
                    contains: [
                        {
                            curfewAddress: {
                                validationMessage: 'Enter curfew address',
                            },
                        },
                        {
                            curfewFrom: {
                                validationMessage: 'Enter start of curfew hours',
                            },
                        },
                        {
                            curfewTo: {
                                validationMessage: 'Enter end of curfew hours',
                            },
                        },
                    ],
                },
            },
            {
                CONFINEADDRESS: {
                    contains: [
                        {
                            confinedTo: {
                                validationMessage: 'Enter time',
                            },
                        },
                        {
                            confinedFrom: {
                                validationMessage: 'Enter time',
                            },
                        },
                        {
                            confinedReviewFrequency: {
                                validationMessage: 'Enter frequency, for example weekly',
                            },
                        },
                    ],
                },
            },
            {
                REPORTTO: {
                    contains: [
                        {
                            reportingAddress: {
                                validationMessage: 'Enter name of approved premises / police station',
                            },
                        },
                        {
                            reportingTime: {
                                validationMessage: 'Enter time / daily',
                            },
                        },
                        {
                            reportingDaily: {
                                validationMessage: 'Enter time / daily',
                            },
                        },
                        {
                            reportingFrequency: {
                                validationMessage: 'Enter frequency, for example weekly',
                            },
                        },
                    ],
                },
            },
            {
                VEHICLEDETAILS: {
                    contains: [
                        {
                            vehicleDetails: {
                                validationMessage: 'Enter details, for example make, model',
                            },
                        },
                    ],
                },
            },
            {
                EXCLUSIONADDRESS: {
                    contains: [
                        {
                            noEnterPlace: {
                                validationMessage: 'Enter name / type of premises / address / road',
                            },
                        },
                    ],
                },
            },
            {
                EXCLUSIONAREA: {
                    contains: [
                        {
                            exclusionArea: {
                                validationMessage: 'Enter clearly specified area',
                            },
                        },
                    ],
                },
            },
            {
                ATTENDDEPENDENCY: {
                    contains: [
                        {
                            appointmentDate: {
                                validationMessage: 'Enter appointment date',
                            },
                        },
                        {
                            appointmentTime: {
                                validationMessage: 'Enter appointment time',
                            },
                        },
                        {
                            appointmentAddress: {
                                validationMessage: 'Enter appointment name and address',
                            },
                        },
                    ],
                },
            },
            {
                ATTENDSAMPLE: {
                    contains: [
                        {
                            attendSampleDetailsName: {
                                validationMessage: 'Enter appointment name',
                            },
                        },
                        {
                            attendSampleDetailsAddress: {
                                validationMessage: 'Enter appointment address',
                            },
                        },
                    ],
                },
            },
        ],
    },
    conditionsSummary: {
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/',
        },
    },
}
