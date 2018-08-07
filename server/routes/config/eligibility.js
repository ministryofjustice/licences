module.exports = {
    excluded: {
        licenceSection: 'excluded',
        fields: [
            {decision: {}},
            {reason: {dependentOn: 'decision', predicate: 'Yes'}}
        ],
        validateInPlace: true,
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
            ]
        }
    },
    suitability: {
        licenceSection: 'suitability',
        fields: [
            {decision: {}},
            {reason: {dependentOn: 'decision', predicate: 'Yes'}}
        ],
        validateInPlace: true,
        nextPath: {
            decisions: [
                {
                    discriminator: 'decision',
                    No: '/hdc/eligibility/crdTime/'
                },
                {
                    discriminator: 'decision',
                    Yes: '/hdc/eligibility/exceptionalCircumstances/'
                }
            ]
        }
    },
    exceptionalCircumstances: {
        licenceSection: 'exceptionalCircumstances',
        fields: [
            {decision: {}}
        ],
        validateInPlace: true,
        nextPath: {
            decisions: [
                {
                    discriminator: 'decision',
                    No: '/hdc/taskList/'
                },
                {
                    discriminator: 'decision',
                    Yes: '/hdc/eligibility/crdTime/'
                }
            ]
        }
    },
    crdTime: {
        licenceSection: 'crdTime',
        fields: [
            {decision: {}},
            {dmApproval: {dependentOn: 'decision', predicate: 'Yes'}}
        ],
        validateInPlace: true,
        nextPath: {
            path: '/hdc/taskList/'
        }
    }
};
