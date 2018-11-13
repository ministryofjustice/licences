module.exports = {
    curfewAddressChoice: {
        nextPath: {
                discriminator: 'decision',
                Address: '/hdc/proposedAddress/curfewAddress/',
                Bass: '/hdc/bassReferral/bassRequest/',
                OptOut: '/hdc/taskList/'
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
                                    {relationship: {}},
                                    {isOffender: {}}
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
