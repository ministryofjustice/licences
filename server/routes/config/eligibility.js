module.exports = {
    excluded: {
        licenceSection: 'excluded',
        fields: [
            {decision: {}},
            {reason: {dependentOn: 'decision', predicate: 'Yes'}}
        ],
        nextPath: {
            path: '/hdc/eligibility/suitability/'
        }
    },
    suitability: {
        licenceSection: 'suitability',
        fields: [
            {decision: {}},
            {reason: {dependentOn: 'decision', predicate: 'Yes'}}
        ],
        nextPath: {
            path: '/hdc/eligibility/crdTime/'
        }
    },
    crdTime: {
        licenceSection: 'crdTime',
        fields: [
            {decision: {}}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    }
};
