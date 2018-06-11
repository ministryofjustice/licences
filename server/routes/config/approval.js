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
            path: '/hdc/send/'
        }
    }
};
