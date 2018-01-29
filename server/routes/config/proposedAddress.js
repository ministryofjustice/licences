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
        nextPath: '/hdc/proposedAddress/curfewAddress/',
        fields: [
            {decision: {}},
            {proposedTown: {dependantOn: 'decision', predicate: 'Yes'}},
            {proposedCounty: {dependantOn: 'decision', predicate: 'Yes'}}
        ]
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
            {occupierName: {}},
            {occupierAge: {}},
            {occupierRelationship: {}},
            {resident1Name: {}},
            {resident1Age: {}},
            {resident1Relation: {}},
            {resident2Name: {}},
            {resident2Age: {}},
            {resident2Relation: {}},
            {resident3Name: {}},
            {resident3Age: {}},
            {resident3Relation: {}},
            {cautionedAgainstResident: {}}
        ]
    }
};
