module.exports = {
    bassRequest: {
        licenceSection: 'bassRequest',
        pageDataMap: ['licence', 'bassReferral'],
        validate: true,
        fields: [
            {bassRequested: {
                responseType: 'requiredYesNo',
                validationMessage: 'Select yes or no'
            }},
            {specificArea: {
                responseType: 'requiredYesNoIf_bassRequested_Yes',
                validationMessage: 'Select yes or no'
            }},
            {proposedTown: {
                dependentOn: 'specificArea',
                predicate: 'Yes',
                responseType: 'requiredStringIf_specificArea_Yes',
                validationMessage: 'Enter a town'
            }},
            {proposedCounty: {
                dependentOn: 'specificArea',
                predicate: 'Yes',
                responseType: 'requiredStringIf_specificArea_Yes',
                validationMessage: 'Enter a county'
            }}
        ],
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/bassRequest/'
        }
    },
    rejected: {
        licenceSection: 'bassRequest',
        pageDataMap: ['licence', 'bassReferral'],
        fields: [
            {enterAlternative: {}}
        ],
        nextPath: {
            decisions: {
                discriminator: 'enterAlternative',
                Yes: '/hdc/bassReferral/bassRequest/rejected/',
                No: '/hdc/proposedAddress/curfewAddressChoice/'
            }
        }
    },
    unsuitable: {
        licenceSection: 'bassRequest',
        pageDataMap: ['licence', 'bassReferral'],
        fields: [
            {enterAlternative: {}}
        ],
        nextPath: {
            decisions: {
                discriminator: 'enterAlternative',
                Yes: '/hdc/bassReferral/bassRequest/unsuitable/',
                No: '/hdc/proposedAddress/curfewAddressChoice/'
            }
        }
    },
    bassAreaCheck: {
        licenceSection: 'bassAreaCheck',
        pageDataMap: ['licence', 'bassReferral'],
        validate: true,
        fields: [
            {bassAreaSuitable: {
                responseType: 'requiredYesNo',
                validationMessage: 'Select yes or no'
            }},
            {bassAreaReason: {
                responseType: 'requiredStringIf_bassAreaSuitable_No',
                validationMessage: 'Enter a reason'
            }},
            {bassAreaCheckSeen: {
                responseType: 'optionalString'
            }}
        ],
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/'
        }
    },
    bassOffer: {
        licenceSection: 'bassOffer',
        pageDataMap: ['licence', 'bassReferral'],
        validate: true,
        fields: [
            {
                bassAccepted: {
                    responseType: 'requiredString',
                    validationMessage: 'Select an option'
                }
            },
            {
                bassOfferDetails: {
                    responseType: 'optionalString'
                }
            },
            {
                bassArea: {
                    conditionallyActive: {postApproval: true},
                    dependentOn: 'bassAccepted',
                    predicate: 'Yes',
                    responseType: 'requiredStringIf_bassAccepted_Yes',
                    validationMessage: 'Enter the provided area'
                }
            },
            {
                addressLine1: {
                    conditionallyActive: {postApproval: true},
                    dependentOn: 'bassAccepted',
                    predicate: 'Yes',
                    responseType: 'requiredStringIf_bassAccepted_Yes',
                    validationMessage: 'Enter a building or street'
                }
            },
            {
                addressLine2: {
                    responseType: 'optionalString'
                }
            },
            {
                addressTown: {
                    conditionallyActive: {postApproval: true},
                    dependentOn: 'bassAccepted',
                    predicate: 'Yes',
                    responseType: 'requiredStringIf_bassAccepted_Yes',
                    validationMessage: 'Enter a town or city'
                }
            },
            {
                postCode: {
                    conditionallyActive: {postApproval: true},
                    dependentOn: 'bassAccepted',
                    predicate: 'Yes',
                    responseType: 'requiredPostcodeIf_bassAccepted_Yes',
                    validationMessage: 'Enter a postcode in the right format'
                }
            },
            {
                telephone: {
                    conditionallyActive: {postApproval: true},
                    dependentOn: 'bassAccepted',
                    predicate: 'Yes',
                    responseType: 'optionalPhone',
                    validationMessage: 'Enter a telephone number in the right format'
                }
            }
        ],
        nextPath: {
            decisions: {
                discriminator: 'bassAccepted',
                Yes: '/hdc/taskList/',
                Unsuitable: '/hdc/bassReferral/unsuitable/',
                Unavailable: '/hdc/taskList/'
            },
            withdraw: '/hdc/bassReferral/bassWithdrawn/',
            reinstate: '/hdc/taskList/'
        }
    },
    bassWithdrawn: {
        fields: [
            {decision: {}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'decision',
                    Yes: '/hdc/bassReferral/bassRequest/add/',
                    No: '/hdc/proposedAddress/curfewAddressChoice/'
                }
            ],
            path: '/hdc/taskList/'
        }
    }
};
