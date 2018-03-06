module.exports = {
    optOut: {
        licenceSection: 'optOut',
        fields: [
            {decision: {}},
            {reason: {dependentOn: 'decision', predicate: 'Yes'}}
        ],
        nextPath: {
            decisions: {
                discriminator: 'decision',
                Yes: '/hdc/taskList/',
                No: '/hdc/proposedAddress/bassReferral/'
            },
            path: '/hdc/taskList/'
        }
    },
    bassReferral: {
        licenceSection: 'bassReferral',
        fields: [
            {decision: {}},
            {proposedTown: {dependentOn: 'decision', predicate: 'Yes'}},
            {proposedCounty: {dependentOn: 'decision', predicate: 'Yes'}}
        ],
        nextPath: {
            decisions: {
                discriminator: 'decision',
                Yes: '/hdc/taskList/',
                No: '/hdc/proposedAddress/curfewAddress/'
            },
            path: '/hdc/taskList/'
        }
    },
    curfewAddress: {
        licenceSection: 'curfewAddress',
        fields: [
            {preferred: {
                contains: [
                    {addressLine1: {}},
                    {addressLine2: {}},
                    {addressTown: {}},
                    {postCode: {}},
                    {telephone: {}},
                    {electricity: {}},
                    {occupier: {}},
                    {residents: {}},
                    {cautionedAgainstResident: {}}
                ]
            }},
            {alternativeAddress: {}},
            {alternative: {
                dependentOn: 'alternativeAddress',
                predicate: 'Yes',
                contains: [
                    {addressLine1: {}},
                    {addressLine2: {}},
                    {addressTown: {}},
                    {postCode: {}},
                    {telephone: {}},
                    {electricity: {}},
                    {occupier: {}},
                    {residents: {}},
                    {cautionedAgainstResident: {}}
                ]
            }}
        ],
        nextPath: {
            path: '/hdc/proposedAddress/confirmAddress/'
        }
    },
    confirmAddress: {
        licenceSection: 'curfewAddress',
        nextPath: {
            path: '/hdc/send/'
        }
    }
};
