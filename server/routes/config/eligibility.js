module.exports = {
    excluded: {
        licenceSection: 'excluded',
        fields: [
            {decision: {}},
            {reason: {dependentOn: 'decision', predicate: 'Yes'}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'decision',
                    No: '/hdc/eligibility/suitability/'
                },
                {
                    discriminator: 'decision',
                    Yes: '/hdc/taskList/'
                }
            ],
            path: '/hdc/taskList/'
        }
    },
    suitability: {
        licenceSection: 'suitability',
        fields: [
            {decision: {}},
            {reason: {dependentOn: 'decision', predicate: 'Yes'}}
        ],
        nextPath: {
            decisions: [
                {
                    discriminator: 'decision',
                    No: '/hdc/eligibility/crdTime/'
                },
                {
                    discriminator: 'decision',
                    Yes: '/hdc/taskList/'
                }
            ],
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
