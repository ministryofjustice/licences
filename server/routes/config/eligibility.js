module.exports = {
    excluded: {
        licenceSection: 'excluded',
        fields: [
            {decision: {}},
            {reason: {dependentOn: 'decision', predicate: 'Yes'}}
        ],
        nextPathDecision: {
            fieldToDecideOn: 'decision',
            Yes: '/hdc/taskList/',
            No: '/hdc/eligibility/suitability/'
        },
        nextPath: '/hdc/eligibility/suitability/'
    },
    suitability: {
        licenceSection: 'suitability',
        fields: [
            {decision: {}},
            {reason: {dependentOn: 'decision', predicate: 'Yes'}}
        ],
        nextPathDecision: {
            fieldToDecideOn: 'decision',
            Yes: '/hdc/taskList/',
            No: '/hdc/eligibility/crdTime/'
        },
        nextPath: '/hdc/eligibility/crdTime/'
    },
    crdTime: {
        licenceSection: 'crdTime',
        nextPath: '/hdc/taskList/',
        fields: [
            {decision: {}}
        ]
    }
};
