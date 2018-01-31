module.exports = {
    excluded: {
        licenceSection: 'excluded',
        fields: [
            {decision: {}},
            {reason: {dependantOn: 'decision', predicate: 'Yes'}}
        ],
        nextPathDecision: {
            fieldToDecideOn: 'decision',
            Yes: '/hdc/taskList/',
            No: '/hdc/eligibility/suitability/'
        }
    },
    suitability: {
        licenceSection: 'suitability',
        fields: [
            {decision: {}},
            {reason: {dependantOn: 'decision', predicate: 'Yes'}}
        ],
        nextPathDecision: {
            fieldToDecideOn: 'decision',
            Yes: '/hdc/taskList/',
            No: '/hdc/eligibility/crdTime/'
        }
    },
    crdTime: {
        licenceSection: 'crdTime',
        nextPath: '/hdc/taskList/',
        fields: [
            {decision: {}}
        ]
    }
};
