module.exports = {
    optOut: {
        licenceSection: 'optOut',
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
        licenceSection: 'bassReferral',
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
        licenceSection: 'curfewAddress',
        nextPath: '/hdc/proposedAddress/confirmAddress/',
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
    },
    confirmAddress: {
        licenceSection: 'curfewAddress',
        nextPath: '/hdc/taskList/'
    }
};
