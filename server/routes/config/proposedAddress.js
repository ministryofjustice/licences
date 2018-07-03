module.exports = {
    optOut: {
        licenceSection: 'optOut',
        fields: [
            {decision: {}},
            {reason: {dependentOn: 'decision', predicate: 'Yes'}}
        ],
        validateInPlace: true,
        nextPath: {
            decisions: {
                discriminator: 'decision',
                Yes: '/hdc/taskList/',
                No: '/hdc/proposedAddress/addressProposed/'
            }
        }
    },
    addressProposed: {
        licenceSection: 'addressProposed',
        fields: [
            {decision: {}}
        ],
        validateInPlace: true,
        nextPath: {
            decisions: {
                discriminator: 'decision',
                Yes: '/hdc/proposedAddress/curfewAddress/',
                No: '/hdc/proposedAddress/bassReferral/'
            }
        }
    },
    bassReferral: {
        licenceSection: 'bassReferral',
        fields: [
            {decision: {}},
            {proposedTown: {dependentOn: 'decision', predicate: 'Yes'}},
            {proposedCounty: {dependentOn: 'decision', predicate: 'Yes'}}
        ],
        validateInPlace: true,
        nextPath: {
            path: '/hdc/taskList/'
        }
    },
    curfewAddress: {
        licenceSection: 'curfewAddress',
        fields: [
            {addresses: {
                isList: true,
                contains: [
                    {addressLine1: {}},
                    {addressLine2: {}},
                    {addressTown: {}},
                    {postCode: {}},
                    {telephone: {}},
                    {occupier: {
                        contains: [
                            {name: {}},
                            {relationship: {}}
                        ]
                    }},
                    {residents: {
                        isList: true,
                        contains: [
                            {name: {}},
                            {relationship: {}},
                            {age: {}}
                        ]
                    }},
                    {cautionedAgainstResident: {}}
                ]
            }}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    },
    rejected: {
        pageDataMap: ['licence'],
        fields: [
            {enterAlternative: {}}
        ],
        nextPath: {
            decisions: {
                discriminator: 'enterAlternative',
                Yes: '/hdc/proposedAddress/curfewAddress/',
                No: '/hdc/taskList/'
            }
        }
    }
};
