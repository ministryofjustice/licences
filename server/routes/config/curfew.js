module.exports = {
    curfewAddressReview: {
        pageDataMap: ['licence'],
        fields: [
            {consent: {
                validationMessage: 'Say if the homeowner consents to HDC'
            }},
            {electricity: {
                dependentOn: 'consent',
                predicate: 'Yes',
                validationMessage: 'Say if there is an electricity supply'
            }},
            {homeVisitConducted: {
                dependentOn: 'consent',
                predicate: 'Yes',
                validationMessage: 'Say if you did a home visit'
            }},
            {addressReviewComments: {}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'consent',
                    No: {
                        path: '/hdc/taskList/',
                        change: '/hdc/review/licenceDetails/',
                        modify: '/hdc/taskList/'
                    }
                },
                {
                    discriminator: 'electricity',
                    No: {
                        path: '/hdc/taskList/',
                        change: '/hdc/review/licenceDetails/',
                        modify: '/hdc/taskList/'
                    }
                }
            ],
            path: '/hdc/curfew/addressSafety/',
            change: '/hdc/curfew/addressSafety/change/',
            modify: '/hdc/taskList/'
        }
    },
    addressSafety: {
        pageDataMap: ['licence'],
        fields: [
            {deemedSafe: {
                validationMessage: 'Say if you approve the address'
            }},
            {unsafeReason: {
                dependentOn: 'deemedSafe',
                predicate: 'No',
                validationMessage: 'Explain why you did not approve the address'
            }}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'deemedSafe',
                    No: {
                        path: '/hdc/taskList/',
                        change: '/hdc/review/licenceDetails/',
                        modify: '/hdc/taskList/'
                    }
                }
            ],
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/',
            modify: '/hdc/taskList/'
        }
    },
    curfewHours: {
        licenceSection: 'curfewHours',
        fields: [
            {daySpecificInputs: {responseType: 'optionalString'}},
            {allFrom: {responseType: 'optionalString'}},
            {allUntil: {responseType: 'optionalString'}},
            {mondayFrom: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }},
            {mondayUntil: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }},
            {tuesdayFrom: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }},
            {tuesdayUntil: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }},
            {wednesdayFrom: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }},
            {wednesdayUntil: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }},
            {thursdayFrom: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }},
            {thursdayUntil: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }},
            {fridayFrom: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }},
            {fridayUntil: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }},
            {saturdayFrom: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }},
            {saturdayUntil: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }},
            {sundayFrom: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }},
            {sundayUntil: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid time'
            }}
        ],
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/'
        },
        modificationRequiresApproval: true
    },
    withdrawAddress: {
        pageDataMap: ['licence'],
        fields: [
            {addressWithdrawn: {}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'addressWithdrawn',
                    Yes: '/hdc/curfew/addressWithdrawn/'
                }
            ],
            path: '/hdc/taskList/'
        }
    },
    addressWithdrawn: {
        fields: [
            {enterNewAddress: {}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'enterNewAddress',
                    Yes: '/hdc/proposedAddress/curfewAddress/add/',
                    No: '/hdc/proposedAddress/curfewAddressChoice/add/'
                }
            ],
            path: '/hdc/taskList/'
        }
    },
    withdrawConsent: {
        pageDataMap: ['licence'],
        fields: [
            {consentWithdrawn: {}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'consentWithdrawn',
                    Yes: '/hdc/curfew/consentWithdrawn/'
                }
            ],
            path: '/hdc/taskList/'
        }
    },
    consentWithdrawn: {
        fields: [
            {enterNewAddress: {}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'enterNewAddress',
                    Yes: '/hdc/proposedAddress/curfewAddress/add/',
                    No: '/hdc/proposedAddress/curfewAddressChoice/add/'
                }
            ],
            path: '/hdc/taskList/'
        }
    },
    reinstateAddress: {
        fields: [
            {consentWithdrawn: {}},
            {addressWithdrawn: {}}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    },
    firstNight: {
        licenceSection: 'firstNight',
        fields: [
            {firstNightFrom: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid from time'
            }},
            {firstNightUntil: {
                responseType: 'requiredTime',
                validationMessage: 'Enter a valid until time'
            }}
        ],
        validate: true,
        nextPath: {
            path: '/hdc/pdf/taskList/'
        }
    }
};
