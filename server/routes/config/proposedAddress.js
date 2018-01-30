module.exports = {
    optOut: {
        fields: [
            {decision: {}},
            {reason: {dependantOn: 'decision', predicate: 'Yes'}}
        ],
        nextPathDecision: {
            fieldToDecideOn: 'decision',
            Yes: '/hdc/taskList/',
            No: '/hdc/proposedAddress/bassReferral/'
        }
    },
    bassReferral: {
        fields: [
            {decision: {}},
            {proposedTown: {dependantOn: 'decision', predicate: 'Yes'}},
            {proposedCounty: {dependantOn: 'decision', predicate: 'Yes'}}
        ],
        nextPathDecision: {
            fieldToDecideOn: 'decision',
            Yes: '/hdc/taskList/',
            No: '/hdc/proposedAddress/curfewAddress/'
        }
    },
    curfewAddress: {
        nextPath: '/hdc/taskList/',
        fields: [
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
    }
};
