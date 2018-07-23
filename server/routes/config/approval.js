module.exports = {
    release: {
        licenceSection: 'release',
        validateInPlace: true,
        fields: [
            {decision: {}},
            {notedComments: {dependentOn: 'decision', predicate: 'Yes'}},
            {reason: {dependentOn: 'decision', predicate: 'No'}}
        ],
        nextPath: {
            path: '/hdc/send/decided/'
        }
    },
    crdrefuse: {
        licenceSection: 'release',
        validateInPlace: false,
        fields: [
            {decision: {}}
        ],
        nextPath: {
            path: '/hdc/send/decided/'
        },
        saveSection: ['approval', 'release']
    }
};
