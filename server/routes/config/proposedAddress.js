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
                No: '/hdc/bassReferral/bassRequest/'
            }
        }
    },
    curfewAddress: {
        licenceSection: 'curfewAddress',
        fields: [
            {
                addresses: {
                    isList: true,
                    contains: [
                        {addressLine1: {}},
                        {addressLine2: {}},
                        {addressTown: {}},
                        {postCode: {}},
                        {telephone: {}},
                        {
                            occupier: {
                                contains: [
                                    {name: {}},
                                    {relationship: {}}
                                ],
                                saveEmpty: true
                            }
                        },
                        {
                            residents: {
                                isList: true,
                                contains: [
                                    {name: {}},
                                    {relationship: {}},
                                    {age: {}}
                                ]
                            }
                        },
                        {cautionedAgainstResident: {}}
                    ]
                }
            }
        ],
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/curfewAddress/'
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
                Yes: '/hdc/proposedAddress/curfewAddress/rejected/',
                No: '/hdc/taskList/'
            }
        }
    }
};
